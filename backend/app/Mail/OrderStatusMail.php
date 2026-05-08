<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public string $newStatus) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->newStatus) {
            'shipped'   => "Your order #{$this->order->id} has shipped!",
            'delivered' => "Your order #{$this->order->id} has been delivered",
            default     => "Order #{$this->order->id} update: {$this->newStatus}",
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.order-status');
    }
}
