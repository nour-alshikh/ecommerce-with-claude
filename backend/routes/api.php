<?php

use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Shop\AddressController;
use App\Http\Controllers\Api\Shop\CartController;
use App\Http\Controllers\Api\Shop\CategoryController;
use App\Http\Controllers\Api\Shop\OrderController;
use App\Http\Controllers\Api\Shop\PaymentController;
use App\Http\Controllers\Api\Shop\ProductController;
use App\Http\Controllers\Api\Webhook\StripeWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  (prefix: /api/v1 — set in bootstrap/app.php)
|--------------------------------------------------------------------------
*/

// ── Public ────────────────────────────────────────────────────────────────

Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/login', LoginController::class);
    Route::post('/auth/register', RegisterController::class);
});

// Catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Cart — guest-friendly (resolves by X-Session-Id header or auth token)
Route::middleware('throttle:api')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/coupon', [CartController::class, 'applyCoupon']);
    Route::delete('/cart/coupon', [CartController::class, 'removeCoupon']);
});

// Stripe webhook — no auth, verified by signature
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

// ── Authenticated ─────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'not.banned', 'throttle:api'])->group(function () {

    // Auth profile
    Route::delete('/auth/logout', [ProfileController::class, 'logout']);
    Route::get('/auth/me', [ProfileController::class, 'show']);
    Route::put('/auth/profile', [ProfileController::class, 'update']);
    Route::put('/auth/password', [ProfileController::class, 'changePassword']);

    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // Checkout — creates order + Stripe PaymentIntent
    Route::post('/payments/intent', [PaymentController::class, 'createIntent']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // ── Admin ─────────────────────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/stats/revenue', [AdminDashboardController::class, 'revenue']);
        Route::get('/stats/top-products', [AdminDashboardController::class, 'topProducts']);

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

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::post('/orders/{id}/refund', [AdminOrderController::class, 'refund']);

        // Customers
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{id}', [AdminCustomerController::class, 'show']);
        Route::patch('/customers/{id}/ban', [AdminCustomerController::class, 'ban']);
        Route::patch('/customers/{id}/unban', [AdminCustomerController::class, 'unban']);

        // Coupons
        Route::get('/coupons', [AdminCouponController::class, 'index']);
        Route::post('/coupons', [AdminCouponController::class, 'store']);
        Route::put('/coupons/{id}', [AdminCouponController::class, 'update']);
        Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);

        // Reviews
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::patch('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::patch('/reviews/{id}/reject', [AdminReviewController::class, 'reject']);

        // Settings
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);
    });
});
