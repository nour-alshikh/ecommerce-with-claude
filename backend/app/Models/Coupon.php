<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount', 'max_discount_amount',
        'max_uses', 'uses', 'is_active', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'value'               => 'decimal:2',
            'min_order_amount'    => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'is_active'           => 'boolean',
            'expires_at'          => 'datetime',
        ];
    }

    public function isValid(float $subtotal): bool
    {
        if (! $this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->uses >= $this->max_uses) return false;
        if ($this->min_order_amount !== null && $subtotal < (float) $this->min_order_amount) return false;
        return true;
    }
}
