<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(private CouponService $couponService) {}

    public function getOrCreateCart(?int $userId, ?string $sessionId): Cart
    {
        if ($userId) {
            return Cart::firstOrCreate(['user_id' => $userId]);
        }

        if ($sessionId) {
            return Cart::firstOrCreate(
                ['session_id' => $sessionId, 'user_id' => null],
                ['session_id' => $sessionId, 'expires_at' => now()->addDays(7)]
            );
        }

        throw new \InvalidArgumentException('Must provide userId or sessionId.');
    }

    public function addItem(Cart $cart, int $productId, ?int $variantId, int $qty = 1): CartItem
    {
        $product = Product::findOrFail($productId);

        if ($variantId) {
            $variant = ProductVariant::where('id', $variantId)
                ->where('product_id', $productId)
                ->firstOrFail();

            if ($variant->stock < $qty) {
                throw ValidationException::withMessages(['quantity' => ['Insufficient stock.']]);
            }
        } else {
            if ($product->stock < $qty) {
                throw ValidationException::withMessages(['quantity' => ['Insufficient stock.']]);
            }
        }

        $item = $cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($item) {
            $item->increment('quantity', $qty);
            return $item->fresh();
        }

        return $cart->items()->create([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity'   => $qty,
        ]);
    }

    public function updateItem(CartItem $item, int $qty): CartItem
    {
        if ($qty < 1) {
            $item->delete();
            return $item;
        }

        $item->update(['quantity' => $qty]);
        return $item->fresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function mergeGuestCart(string $sessionId, int $userId): void
    {
        $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
        if (! $guestCart) return;

        $userCart = $this->getOrCreateCart($userId, null);

        foreach ($guestCart->items as $guestItem) {
            $existing = $userCart->items()
                ->where('product_id', $guestItem->product_id)
                ->where('variant_id', $guestItem->variant_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $guestItem->quantity);
            } else {
                $userCart->items()->create([
                    'product_id' => $guestItem->product_id,
                    'variant_id' => $guestItem->variant_id,
                    'quantity'   => $guestItem->quantity,
                ]);
            }
        }

        $guestCart->delete();
    }

    public function applyCoupon(Cart $cart, string $code): Cart
    {
        $cart->load('items.product');
        $subtotal = $cart->subtotal();
        $coupon   = $this->couponService->validate($code, $subtotal);
        $cart->update(['coupon_id' => $coupon->id]);
        return $cart->fresh()->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function removeCoupon(Cart $cart): Cart
    {
        $cart->update(['coupon_id' => null]);
        return $cart->fresh()->load(['items.product.images', 'items.variant', 'coupon']);
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
        $cart->update(['coupon_id' => null]);
    }
}
