<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['user', 'product'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        $reviews = $query->paginate(20);

        return response()->json([
            'data' => $reviews->map(fn ($r) => [
                'id'           => $r->id,
                'rating'       => $r->rating,
                'title'        => $r->title,
                'comment'      => $r->comment,
                'status'       => $r->status,
                'created_at'   => $r->created_at?->toISOString(),
                'user'         => ['id' => $r->user_id, 'name' => $r->user?->name],
                'product'      => ['id' => $r->product_id, 'name' => $r->product?->name, 'slug' => $r->product?->slug],
            ]),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ],
        ]);
    }

    public function approve(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'approved']);
        return response()->json(['data' => ['id' => $review->id, 'status' => $review->status]]);
    }

    public function reject(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'rejected']);
        return response()->json(['data' => ['id' => $review->id, 'status' => $review->status]]);
    }
}
