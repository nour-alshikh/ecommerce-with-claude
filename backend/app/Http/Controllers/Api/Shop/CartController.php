<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\AddCartItemRequest;
use App\Http\Requests\Shop\ApplyCouponRequest;
use App\Http\Requests\Shop\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    private function resolveCart(Request $request)
    {
        $userId    = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id');
        return $this->cartService->getOrCreateCart($userId, $sessionId);
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $cart->load(['items.product.images', 'items.variant', 'coupon']);
        return response()->json(['data' => new CartResource($cart)]);
    }

    public function addItem(AddCartItemRequest $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $this->cartService->addItem(
            $cart,
            $request->product_id,
            $request->variant_id,
            $request->input('quantity', 1)
        );
        $cart->load(['items.product.images', 'items.variant', 'coupon']);
        return response()->json(['data' => new CartResource($cart)], 201);
    }

    public function updateItem(UpdateCartItemRequest $request, int $itemId): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $item = $cart->items()->findOrFail($itemId);
        $this->cartService->updateItem($item, $request->quantity);
        $cart->load(['items.product.images', 'items.variant', 'coupon']);
        return response()->json(['data' => new CartResource($cart)]);
    }

    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $item = $cart->items()->findOrFail($itemId);
        $this->cartService->removeItem($item);
        $cart->load(['items.product.images', 'items.variant', 'coupon']);
        return response()->json(['data' => new CartResource($cart)]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $this->cartService->clear($cart);
        return response()->json(['message' => 'Cart cleared.']);
    }

    public function applyCoupon(ApplyCouponRequest $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $cart = $this->cartService->applyCoupon($cart, $request->code);
        return response()->json(['data' => new CartResource($cart)]);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $cart = $this->cartService->removeCoupon($cart);
        return response()->json(['data' => new CartResource($cart)]);
    }
}
