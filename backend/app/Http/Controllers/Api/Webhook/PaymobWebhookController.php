<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymobWebhookController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        if (($payload['type'] ?? '') !== 'TRANSACTION') {
            return response()->json(['received' => true]);
        }

        $transaction = $payload['obj'] ?? [];

        if (! $this->verifyHmac($transaction, $request->query('hmac', ''))) {
            Log::warning('Paymob webhook HMAC mismatch');
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        // Only process successful, settled transactions
        if ($transaction['success'] === true && $transaction['pending'] === false) {
            $paymobOrderId = (string) ($transaction['order']['id'] ?? '');

            try {
                $this->orderService->confirmFromWebhook($paymobOrderId);
            } catch (\Exception $e) {
                Log::error('Paymob webhook order confirm failed', [
                    'paymob_order_id' => $paymobOrderId,
                    'error'           => $e->getMessage(),
                ]);
            }
        }

        return response()->json(['received' => true]);
    }

    private function verifyHmac(array $transaction, string $receivedHmac): bool
    {
        if (empty($receivedHmac)) {
            return false;
        }

        // Fields Paymob uses for HMAC-SHA512, in this exact order
        $fields = [
            'amount_cents', 'created_at', 'currency', 'error_occured',
            'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
            'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
            'is_voided', 'order', 'owner', 'pending',
            'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
        ];

        $concatenated = '';
        foreach ($fields as $field) {
            if (str_contains($field, '.')) {
                [$key1, $key2] = explode('.', $field, 2);
                $value = $transaction[$key1][$key2] ?? '';
            } elseif ($field === 'order') {
                $value = (string) ($transaction['order']['id'] ?? '');
            } else {
                $value = $transaction[$field] ?? '';
            }

            if (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            }

            $concatenated .= (string) $value;
        }

        $computed = hash_hmac('sha512', $concatenated, config('services.paymob.hmac_secret'));

        return hash_equals($computed, strtolower($receivedHmac));
    }
}
