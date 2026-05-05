<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  (prefix: /api/v1 — set in bootstrap/app.php)
|--------------------------------------------------------------------------
*/

// Public auth routes (rate-limited to 5/min per IP)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/login', LoginController::class);
    Route::post('/auth/register', RegisterController::class);
});

// Authenticated routes
Route::middleware(['auth:sanctum', 'not.banned', 'throttle:api'])->group(function () {
    Route::delete('/auth/logout', [ProfileController::class, 'logout']);
    Route::get('/auth/me', [ProfileController::class, 'show']);
    Route::put('/auth/profile', [ProfileController::class, 'update']);
    Route::put('/auth/password', [ProfileController::class, 'changePassword']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', fn (Request $request) => response()->json(['data' => []]));
    });
});
