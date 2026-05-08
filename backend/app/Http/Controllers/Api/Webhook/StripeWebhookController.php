<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function handle(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $this->handleSucceeded($event->data->object->id);
        }

        return response()->json(['received' => true]);
    }

    private function handleSucceeded(string $paymentIntentId): void
    {
        try {
            $this->orderService->confirmFromWebhook($paymentIntentId);
        } catch (\Exception $e) {
            Log::error('Webhook order confirm failed', [
                'payment_intent' => $paymentIntentId,
                'error'          => $e->getMessage(),
            ]);
        }
    }
}
