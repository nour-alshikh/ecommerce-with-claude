<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\ReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(string $slug): AnonymousResourceCollection
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $reviews = Review::with('user')
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->latest()
            ->paginate(10);

        return ReviewResource::collection($reviews);
    }

    public function store(ReviewRequest $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        // Verified purchase check
        $hasPurchased = Order::where('user_id', $user->id)
            ->whereIn('status', ['delivered', 'shipped', 'processing'])
            ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
            ->exists();

        if (! $hasPurchased) {
            return response()->json([
                'message' => 'You can only review products you have purchased.',
            ], 403);
        }

        // Unique-per-user-product enforced at DB level, but return a friendly error
        if (Review::where('user_id', $user->id)->where('product_id', $product->id)->exists()) {
            return response()->json([
                'message' => 'You have already reviewed this product.',
            ], 422);
        }

        $review = Review::create([
            'user_id'    => $user->id,
            'product_id' => $product->id,
            'order_id'   => Order::where('user_id', $user->id)
                ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
                ->latest()
                ->value('id'),
            'rating'  => $request->rating,
            'title'   => $request->title,
            'comment' => $request->comment,
            'status'  => 'pending',
        ]);

        return response()->json([
            'message' => 'Review submitted and pending approval.',
            'data'    => new ReviewResource($review->load('user')),
        ], 201);
    }
}
