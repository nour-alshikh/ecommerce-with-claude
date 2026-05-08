<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        // Always return success to avoid user enumeration
        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'If that email exists, a password reset link has been sent.']);
    }
}
