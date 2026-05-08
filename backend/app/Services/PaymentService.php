<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Stripe\StripeClient;

class PaymentService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function createPaymentIntent(Order $order): array
    {
        $intent = $this->stripe->paymentIntents->create([
            'amount'                     => (int) round((float) $order->total * 100),
            'currency'                   => 'usd',
            'metadata'                   => ['order_id' => $order->id],
            'automatic_payment_methods'  => ['enabled' => true],
        ]);

        Payment::create([
            'order_id'    => $order->id,
            'provider'    => 'stripe',
            'provider_id' => $intent->id,
            'status'      => 'pending',
            'amount'      => $order->total,
            'currency'    => 'usd',
            'metadata'    => $intent->toArray(),
        ]);

        return [
            'client_secret'      => $intent->client_secret,
            'payment_intent_id'  => $intent->id,
        ];
    }
}
