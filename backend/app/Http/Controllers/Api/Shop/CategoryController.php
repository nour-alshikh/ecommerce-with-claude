<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::with('children')
            ->where('slug', $slug)
            ->firstOrFail();

        $products = $category->products()
            ->with(['images', 'category'])
            ->active()
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => [
                'category' => new CategoryResource($category),
                'products' => ProductResource::collection($products),
            ],
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
        ]);
    }
}
