<?php

use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Shop\CategoryController;
use App\Http\Controllers\Api\Shop\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  (prefix: /api/v1 — set in bootstrap/app.php)
|--------------------------------------------------------------------------
*/

// ── Public ────────────────────────────────────────────────────────────────

// Auth (rate-limited to 5/min per IP)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/login', LoginController::class);
    Route::post('/auth/register', RegisterController::class);
});

// Catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// ── Authenticated ─────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'not.banned', 'throttle:api'])->group(function () {

    // Auth profile
    Route::delete('/auth/logout', [ProfileController::class, 'logout']);
    Route::get('/auth/me', [ProfileController::class, 'show']);
    Route::put('/auth/profile', [ProfileController::class, 'update']);
    Route::put('/auth/password', [ProfileController::class, 'changePassword']);

    // ── Admin ─────────────────────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {

        // Stats placeholder (Phase 4)
        Route::get('/stats', fn (Request $request) => response()->json(['data' => []]));

        // Categories
        Route::apiResource('categories', AdminCategoryController::class);

        // Products
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
        Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImages']);
        Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'deleteImage']);
        Route::patch('/products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage']);
        Route::patch('/products/bulk-status', [AdminProductController::class, 'bulkStatus']);
    });
});
