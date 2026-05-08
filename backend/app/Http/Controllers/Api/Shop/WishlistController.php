<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = WishlistItem::with(['product.images', 'product.category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $items->map(fn ($i) => [
                'id'         => $i->id,
                'product_id' => $i->product_id,
                'product'    => new ProductResource($i->product),
                'created_at' => $i->created_at->toISOString(),
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['product_id' => ['required', 'integer', 'exists:products,id']]);

        $item = WishlistItem::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json(['message' => 'Added to wishlist.', 'data' => ['id' => $item->id]], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        WishlistItem::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }

    public function ids(Request $request): JsonResponse
    {
        $ids = WishlistItem::where('user_id', $request->user()->id)
            ->pluck('product_id');

        return response()->json(['data' => $ids]);
    }
}
