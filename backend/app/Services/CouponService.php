<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Validation\ValidationException;

class CouponService
{
    public function validate(string $code, float $subtotal): Coupon
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon || ! $coupon->isValid($subtotal)) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired coupon code.']]);
        }

        return $coupon;
    }

    public function calculateDiscount(Coupon $coupon, float $subtotal): float
    {
        if ($coupon->type === 'percentage') {
            $discount = $subtotal * ((float) $coupon->value / 100);
            if ($coupon->max_discount_amount) {
                $discount = min($discount, (float) $coupon->max_discount_amount);
            }
            return round($discount, 2);
        }

        return min(round((float) $coupon->value, 2), $subtotal);
    }
}
