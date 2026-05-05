<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\ProductFilterRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(ProductFilterRequest $request): JsonResponse
    {
        $query = Product::with(['images', 'category'])
            ->active();

        // Full-text search (fallback to LIKE on SQLite/test env)
        if ($q = $request->q) {
            if (DB::getDriverName() === 'mysql') {
                $query->whereFullText(['name', 'description'], $q);
            } else {
                $query->where(fn ($q2) => $q2
                    ->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%"));
            }
        }

        // Category filter
        if ($category = $request->category) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        // Price filter (uses effective price: sale_price ?? price)
        if ($request->min_price !== null) {
            $query->where(function ($q) use ($request) {
                $q->whereNotNull('sale_price')->where('sale_price', '>=', $request->min_price)
                  ->orWhere(function ($q) use ($request) {
                      $q->whereNull('sale_price')->where('price', '>=', $request->min_price);
                  });
            });
        }

        if ($request->max_price !== null) {
            $query->where(function ($q) use ($request) {
                $q->whereNotNull('sale_price')->where('sale_price', '<=', $request->max_price)
                  ->orWhere(function ($q) use ($request) {
                      $q->whereNull('sale_price')->where('price', '<=', $request->max_price);
                  });
            });
        }

        // Sorting
        match ($request->sort) {
            'price_asc'  => $query->orderByRaw('COALESCE(sale_price, price) ASC'),
            'price_desc' => $query->orderByRaw('COALESCE(sale_price, price) DESC'),
            'popular'    => $query->orderByDesc('views_count'),
            default      => $query->latest(),
        };

        $perPage  = min((int) ($request->per_page ?? 20), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['images', 'variants', 'category'])
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment view count without triggering model events
        Product::withoutTimestamps(fn () => $product->increment('views_count'));

        return response()->json(['data' => new ProductResource($product)]);
    }
}
