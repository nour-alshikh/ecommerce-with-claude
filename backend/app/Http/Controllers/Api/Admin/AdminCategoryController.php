<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')->whereNull('parent_id')->orderBy('sort_order')->get();
        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        unset($data['image']);
        $category = Category::create($data);

        return response()->json(['data' => new CategoryResource($category), 'message' => 'Category created.'], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(['data' => new CategoryResource($category->load('children'))]);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($category->image_path) Storage::disk('public')->delete($category->image_path);
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        unset($data['image']);
        $category->update($data);

        return response()->json(['data' => new CategoryResource($category->fresh('children')), 'message' => 'Category updated.']);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete category with products.'], 422);
        }

        if ($category->image_path) Storage::disk('public')->delete($category->image_path);
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
