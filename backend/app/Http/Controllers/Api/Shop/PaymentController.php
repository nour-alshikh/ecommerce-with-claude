<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\InitiatePaymentRequest;
use App\Models\Cart;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\PaymobService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private PaymobService $paymobService,
        private CartService $cartService,
    ) {}

    public function initiatePayment(InitiatePaymentRequest $request): JsonResponse
    {
        $user      = $request->user();
        $sessionId = $request->header('X-Session-Id');

        if ($sessionId) {
            $this->cartService->mergeGuestCart($sessionId, $user->id);
        }

        $cart = Cart::where('user_id', $user->id)
            ->with(['items.product', 'items.variant', 'coupon'])
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        try {
            $order       = $this->orderService->createFromCart($cart, $request->address_id, $user);
            $paymentData = $this->paymobService->initiatePayment($order);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        return response()->json([
            'data' => [
                'order_id'   => $order->id,
                'iframe_url' => $paymentData['iframe_url'],
            ],
        ]);
    }
}
