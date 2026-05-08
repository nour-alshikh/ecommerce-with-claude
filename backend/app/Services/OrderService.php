<?php

namespace App\Services;

use App\Jobs\SendOrderConfirmationEmail;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    public function __construct(private CouponService $couponService) {}

    public function createFromCart(Cart $cart, int $addressId, User $user): Order
    {
        $cart->load(['items.product', 'items.variant', 'coupon']);

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException('Cart is empty.');
        }

        $address = $user->addresses()->findOrFail($addressId);

        $subtotal = 0.0;
        foreach ($cart->items as $item) {
            $subtotal += $item->unitPrice() * $item->quantity;
        }

        $discount = 0.0;
        if ($cart->coupon) {
            $discount = $this->couponService->calculateDiscount($cart->coupon, $subtotal);
        }

        $total = max(0.0, $subtotal - $discount);

        return DB::transaction(function () use ($cart, $address, $user, $subtotal, $discount, $total) {
            $order = Order::create([
                'user_id'              => $user->id,
                'address_id'           => $address->id,
                'status'               => 'pending',
                'subtotal'             => $subtotal,
                'discount'             => $discount,
                'tax'                  => 0,
                'shipping'             => 0,
                'total'                => $total,
                'coupon_id'            => $cart->coupon_id,
                'coupon_code'          => $cart->coupon?->code,
                'shipping_name'        => $address->full_name,
                'shipping_line1'       => $address->line1,
                'shipping_line2'       => $address->line2,
                'shipping_city'        => $address->city,
                'shipping_state'       => $address->state,
                'shipping_postal_code' => $address->postal_code,
                'shipping_country'     => $address->country,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id'   => $item->product_id,
                    'variant_id'   => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_name' => $item->variant?->name,
                    'unit_price'   => $item->unitPrice(),
                    'quantity'     => $item->quantity,
                    'subtotal'     => $item->unitPrice() * $item->quantity,
                ]);
            }

            return $order;
        });
    }

    public function confirmFromWebhook(string $paymentIntentId): Order
    {
        $payment = Payment::where('provider_id', $paymentIntentId)->firstOrFail();
        $order   = $payment->order;

        if ($order->status === 'pending') {
            DB::transaction(function () use ($order, $payment) {
                $order->update(['status' => 'processing']);
                $payment->update(['status' => 'succeeded']);

                $this->decrementStock($order);

                $cart = Cart::where('user_id', $order->user_id)->first();
                if ($cart) {
                    $cart->items()->delete();
                    $cart->update(['coupon_id' => null]);
                }

                if ($order->coupon_id) {
                    Coupon::where('id', $order->coupon_id)->increment('uses');
                }

                SendOrderConfirmationEmail::dispatch($order)->onQueue('default');
            });
        }

        return $order->load(['items.product', 'payment', 'user']);
    }

    public function decrementStock(Order $order): void
    {
        $order->loadMissing('items.variant');

        foreach ($order->items as $item) {
            if ($item->variant_id) {
                $item->variant?->decrement('stock', $item->quantity);
            } else {
                $item->product()->decrement('stock', $item->quantity);
            }
        }
    }
}
