<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::latest()->paginate(20);

        return response()->json([
            'data' => $coupons->map(fn ($c) => $this->format($c)),
            'meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page'    => $coupons->lastPage(),
                'total'        => $coupons->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'                => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type'                => ['required', 'in:percentage,fixed'],
            'value'               => ['required', 'numeric', 'min:0.01'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'            => ['nullable', 'integer', 'min:1'],
            'is_active'           => ['sometimes', 'boolean'],
            'expires_at'          => ['nullable', 'date'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon = Coupon::create($data);

        return response()->json(['data' => $this->format($coupon)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $data = $request->validate([
            'code'                => ['sometimes', 'string', 'max:50', "unique:coupons,code,{$id}"],
            'type'                => ['sometimes', 'in:percentage,fixed'],
            'value'               => ['sometimes', 'numeric', 'min:0.01'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'            => ['nullable', 'integer', 'min:1'],
            'is_active'           => ['sometimes', 'boolean'],
            'expires_at'          => ['nullable', 'date'],
        ]);

        if (isset($data['code'])) $data['code'] = strtoupper($data['code']);
        $coupon->update($data);

        return response()->json(['data' => $this->format($coupon->fresh())]);
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted.']);
    }

    private function format(Coupon $c): array
    {
        return [
            'id'                  => $c->id,
            'code'                => $c->code,
            'type'                => $c->type,
            'value'               => (float) $c->value,
            'min_order_amount'    => $c->min_order_amount ? (float) $c->min_order_amount : null,
            'max_discount_amount' => $c->max_discount_amount ? (float) $c->max_discount_amount : null,
            'max_uses'            => $c->max_uses,
            'uses'                => $c->uses,
            'is_active'           => $c->is_active,
            'expires_at'          => $c->expires_at?->toISOString(),
            'created_at'          => $c->created_at?->toISOString(),
        ];
    }
}
