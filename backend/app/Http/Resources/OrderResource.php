<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status,
            'subtotal'     => (float) $this->subtotal,
            'discount'     => (float) $this->discount,
            'tax'          => (float) $this->tax,
            'shipping'     => (float) $this->shipping,
            'total'        => (float) $this->total,
            'coupon_code'  => $this->coupon_code,
            'items'        => OrderItemResource::collection($this->whenLoaded('items')),
            'payment'      => $this->whenLoaded('payment', fn () => $this->payment ? [
                'status'      => $this->payment->status,
                'provider_id' => $this->payment->provider_id,
            ] : null),
            'shipping_name'        => $this->shipping_name,
            'shipping_line1'       => $this->shipping_line1,
            'shipping_line2'       => $this->shipping_line2,
            'shipping_city'        => $this->shipping_city,
            'shipping_state'       => $this->shipping_state,
            'shipping_postal_code' => $this->shipping_postal_code,
            'shipping_country'     => $this->shipping_country,
            'notes'        => $this->notes,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
