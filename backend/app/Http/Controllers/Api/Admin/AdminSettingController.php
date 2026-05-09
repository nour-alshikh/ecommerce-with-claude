<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    private const ALLOWED_KEYS = [
        'store_name', 'store_email', 'currency', 'tax_rate',
        'low_stock_threshold', 'free_shipping_threshold', 'maintenance_mode',
    ];

    public function index(): JsonResponse
    {
        $settings = Setting::whereIn('key', self::ALLOWED_KEYS)->pluck('value', 'key');

        $defaults = [
            'store_name'              => 'My Store',
            'store_email'             => '',
            'currency'                => 'USD',
            'tax_rate'                => '0',
            'low_stock_threshold'     => '5',
            'free_shipping_threshold' => '0',
            'maintenance_mode'        => '0',
        ];

        $data = array_merge($defaults, $settings->toArray());

        return response()->json(['data' => $data]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name'              => ['sometimes', 'string', 'max:255'],
            'store_email'             => ['sometimes', 'nullable', 'email'],
            'currency'                => ['sometimes', 'string', 'size:3'],
            'tax_rate'                => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'low_stock_threshold'     => ['sometimes', 'integer', 'min:0'],
            'free_shipping_threshold' => ['sometimes', 'numeric', 'min:0'],
            'maintenance_mode'        => ['sometimes', 'boolean'],
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, (string) $value);
        }

        return response()->json(['data' => $data, 'message' => 'Settings saved.']);
    }
}
