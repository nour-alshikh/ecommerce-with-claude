<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymobService
{
    private const BASE_URL = 'https://accept.paymob.com/api';

    private string $apiKey;
    private string $integrationId;
    private int $iframeId;
    private string $currency;

    public function __construct()
    {
        $this->apiKey        = config('services.paymob.api_key');
        $this->integrationId = config('services.paymob.integration_id');
        $this->iframeId      = (int) config('services.paymob.iframe_id');
        $this->currency      = config('services.paymob.currency', 'EGP');
    }

    public function initiatePayment(Order $order): array
    {
        $order->loadMissing('user');

        $authToken     = $this->authenticate();
        $paymobOrderId = $this->registerOrder($authToken, $order);
        $paymentKey    = $this->getPaymentKey($authToken, $paymobOrderId, $order);

        Payment::create([
            'order_id'    => $order->id,
            'provider'    => 'paymob',
            'provider_id' => (string) $paymobOrderId,
            'status'      => 'pending',
            'amount'      => $order->total,
            'currency'    => $this->currency,
            'metadata'    => ['paymob_order_id' => $paymobOrderId],
        ]);

        return [
            'iframe_url' => self::BASE_URL . "/acceptance/iframes/{$this->iframeId}?payment_token={$paymentKey}",
        ];
    }

    private function authenticate(): string
    {
        $response = Http::post(self::BASE_URL . '/auth/tokens', [
            'api_key' => $this->apiKey,
        ]);

        if (! $response->successful()) {
            Log::error('Paymob auth failed', ['body' => $response->body()]);
            throw new \RuntimeException('Paymob authentication failed.');
        }

        return $response->json('token');
    }

    private function registerOrder(string $authToken, Order $order): int
    {
        $response = Http::post(self::BASE_URL . '/ecommerce/orders', [
            'auth_token'        => $authToken,
            'delivery_needed'   => false,
            'amount_cents'      => (int) round((float) $order->total * 100),
            'currency'          => $this->currency,
            'merchant_order_id' => (string) $order->id,
            'items'             => [],
        ]);

        if (! $response->successful()) {
            Log::error('Paymob register order failed', ['body' => $response->body()]);
            throw new \RuntimeException('Paymob order registration failed.');
        }

        return $response->json('id');
    }

    private function getPaymentKey(string $authToken, int $paymobOrderId, Order $order): string
    {
        $nameParts   = explode(' ', $order->shipping_name ?? 'Customer', 2);
        $firstName   = $nameParts[0];
        $lastName    = $nameParts[1] ?? 'NA';
        $redirectUrl = env('FRONTEND_URL', 'http://localhost:3000') . "/orders/{$order->id}?paid=true";

        $response = Http::post(self::BASE_URL . '/acceptance/payment_keys', [
            'auth_token'           => $authToken,
            'amount_cents'         => (int) round((float) $order->total * 100),
            'expiration'           => 3600,
            'order_id'             => $paymobOrderId,
            'billing_data'         => [
                'apartment'       => 'NA',
                'email'           => $order->user->email,
                'floor'           => 'NA',
                'first_name'      => $firstName,
                'last_name'       => $lastName,
                'street'          => $order->shipping_line1 ?? 'NA',
                'building'        => 'NA',
                'phone_number'    => 'NA',
                'shipping_method' => 'NA',
                'postal_code'     => $order->shipping_postal_code ?? 'NA',
                'city'            => $order->shipping_city ?? 'NA',
                'country'         => $order->shipping_country ?? 'NA',
                'state'           => $order->shipping_state ?? 'NA',
            ],
            'currency'             => $this->currency,
            'integration_id'       => (int) $this->integrationId,
            'lock_order_when_paid' => 'false',
            'redirection_url'      => $redirectUrl,
        ]);

        if (! $response->successful()) {
            Log::error('Paymob payment key failed', ['body' => $response->body()]);
            throw new \RuntimeException('Paymob payment key generation failed.');
        }

        return $response->json('token');
    }
}
