<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'images'])->withTrashed();

        if ($search = $request->q) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"));
        }

        if ($status = $request->status) {
            $query->where('status', $status);
        }

        if ($request->category) {
            $query->where('category_id', $request->category);
        }

        $products = $query->latest()->paginate(20);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => ['current_page' => $products->currentPage(), 'last_page' => $products->lastPage(), 'total' => $products->total()],
        ]);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $data = $request->safe()->except('variants');
            $product = Product::create($data);

            if ($request->has('variants')) {
                foreach ($request->variants as $i => $variant) {
                    $product->variants()->create([...$variant, 'sort_order' => $i]);
                }
            }

            return response()->json(['data' => new ProductResource($product->load(['category', 'images', 'variants'])), 'message' => 'Product created.'], 201);
        });
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => new ProductResource($product->load(['category', 'images', 'variants']))]);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        return DB::transaction(function () use ($request, $product) {
            $data = $request->safe()->except('variants');
            $product->update($data);

            if ($request->has('variants')) {
                $product->variants()->delete();
                foreach ($request->variants as $i => $variant) {
                    $product->variants()->create([...$variant, 'sort_order' => $i]);
                }
            }

            return response()->json(['data' => new ProductResource($product->fresh(['category', 'images', 'variants'])), 'message' => 'Product updated.']);
        });
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted.']);
    }

    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images'   => ['required', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        $images     = [];

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('products', 'public');
            $images[] = $product->images()->create([
                'path'       => $path,
                'is_primary' => !$hasPrimary && $i === 0,
                'sort_order' => $product->images()->count() + $i,
            ]);
            $hasPrimary = true;
        }

        return response()->json(['message' => count($images) . ' image(s) uploaded.'], 201);
    }

    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, 404);
        Storage::disk('public')->delete($image->path);
        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $product->images()->oldest()->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Image deleted.']);
    }

    public function setPrimaryImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, 404);
        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);
        return response()->json(['message' => 'Primary image set.']);
    }

    public function bulkStatus(Request $request): JsonResponse
    {
        $request->validate([
            'ids'    => ['required', 'array'],
            'ids.*'  => ['integer', 'exists:products,id'],
            'status' => ['required', 'in:active,inactive,draft'],
        ]);

        Product::whereIn('id', $request->ids)->update(['status' => $request->status]);
        return response()->json(['message' => count($request->ids) . ' products updated.']);
    }
}
