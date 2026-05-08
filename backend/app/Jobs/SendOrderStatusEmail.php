<?php

namespace App\Jobs;

use App\Mail\OrderStatusMail;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order, public string $newStatus) {}

    public function handle(): void
    {
        $this->order->load(['items', 'user']);
        Mail::to($this->order->user->email)
            ->send(new OrderStatusMail($this->order, $this->newStatus));
    }
}
