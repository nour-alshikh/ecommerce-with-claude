<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class AdminOrderController extends Controller
{
    private const ALLOWED_TRANSITIONS = [
        'pending'    => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped'    => ['delivered'],
        'delivered'  => [],
        'cancelled'  => [],
        'refunded'   => [],
    ];

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items', 'payment'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$request->q}%")
                ->orWhere('email', 'like', "%{$request->q}%"));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'data' => $orders->map(fn ($o) => [
                'id'         => $o->id,
                'status'     => $o->status,
                'total'      => (float) $o->total,
                'created_at' => $o->created_at?->toISOString(),
                'customer'   => ['id' => $o->user_id, 'name' => $o->user?->name, 'email' => $o->user?->email],
                'item_count' => $o->items->sum('quantity'),
            ]),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['user', 'items.product', 'items.variant', 'payment'])->findOrFail($id);

        return response()->json([
            'data' => array_merge((new OrderResource($order))->resolve(), [
                'customer' => ['id' => $order->user_id, 'name' => $order->user?->name, 'email' => $order->user?->email],
            ]),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string']]);

        $order = Order::findOrFail($id);
        $allowed = self::ALLOWED_TRANSITIONS[$order->status] ?? [];

        if (! in_array($request->status, $allowed)) {
            return response()->json([
                'message' => "Cannot transition from '{$order->status}' to '{$request->status}'.",
            ], 422);
        }

        $order->update(['status' => $request->status]);
        return response()->json(['data' => new OrderResource($order)]);
    }

    public function refund(int $id): JsonResponse
    {
        $order   = Order::with('payment')->findOrFail($id);
        $payment = $order->payment;

        if (! $payment || $payment->status !== 'succeeded') {
            return response()->json(['message' => 'No successful payment to refund.'], 422);
        }

        try {
            $stripe = new StripeClient(config('services.stripe.secret'));
            $stripe->refunds->create(['payment_intent' => $payment->provider_id]);

            $payment->update(['status' => 'refunded', 'refunded_amount' => $payment->amount]);
            $order->update(['status' => 'refunded']);

            return response()->json(['data' => new OrderResource($order)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Refund failed: ' . $e->getMessage()], 500);
        }
    }
}
