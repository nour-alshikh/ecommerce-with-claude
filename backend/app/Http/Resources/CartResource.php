<?php

namespace App\Http\Resources;

use App\Services\CouponService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subtotal = $this->subtotal();
        $discount = 0.0;

        if ($this->coupon) {
            $svc      = new CouponService();
            $discount = $svc->calculateDiscount($this->coupon, $subtotal);
        }

        return [
            'id'         => $this->id,
            'items'      => CartItemResource::collection($this->whenLoaded('items')),
            'coupon'     => $this->coupon ? [
                'code'  => $this->coupon->code,
                'type'  => $this->coupon->type,
                'value' => (float) $this->coupon->value,
            ] : null,
            'subtotal'   => round($subtotal, 2),
            'discount'   => round($discount, 2),
            'total'      => round(max(0, $subtotal - $discount), 2),
            'item_count' => $this->items->sum('quantity'),
        ];
    }
}
