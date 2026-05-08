<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\CreatePaymentIntentRequest;
use App\Models\Cart;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private OrderService $orderService,
        private PaymentService $paymentService,
    ) {}

    public function createIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)
            ->with(['items.product', 'items.variant', 'coupon'])
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        $order      = $this->orderService->createFromCart($cart, $request->address_id, $user);
        $intentData = $this->paymentService->createPaymentIntent($order);

        return response()->json([
            'data' => [
                'order_id'      => $order->id,
                'client_secret' => $intentData['client_secret'],
            ],
        ]);
    }
}
