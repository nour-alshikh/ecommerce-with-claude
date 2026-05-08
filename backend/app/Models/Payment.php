<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'provider', 'provider_id',
        'status', 'amount', 'currency', 'refunded_amount', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount'          => 'decimal:2',
            'refunded_amount' => 'decimal:2',
            'metadata'        => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
