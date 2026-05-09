<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->latest();

        if ($request->filled('q')) {
            $query->where(fn ($q) =>
                $q->where('name', 'like', "%{$request->q}%")
                  ->orWhere('email', 'like', "%{$request->q}%")
            );
        }

        $customers = $query->paginate(20);

        return response()->json([
            'data' => $customers->map(fn ($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'email'            => $c->email,
                'role'             => $c->is_banned ? 'banned' : $c->role,
                'orders_count'     => $c->orders_count,
                'orders_sum_total' => (float) ($c->orders_sum_total ?? 0),
                'created_at'       => $c->created_at?->toISOString(),
            ]),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page'    => $customers->lastPage(),
                'per_page'     => $customers->perPage(),
                'total'        => $customers->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->findOrFail($id);

        $orders = $customer->orders()
            ->withCount('items')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($o) => [
                'id'         => $o->id,
                'status'     => $o->status,
                'total'      => (float) $o->total,
                'item_count' => $o->items_count,
                'created_at' => $o->created_at?->toISOString(),
            ]);

        return response()->json([
            'data' => [
                'id'               => $customer->id,
                'name'             => $customer->name,
                'email'            => $customer->email,
                'role'             => $customer->is_banned ? 'banned' : $customer->role,
                'created_at'       => $customer->created_at?->toISOString(),
                'orders_count'     => $customer->orders_count,
                'orders_sum_total' => (float) ($customer->orders_sum_total ?? 0),
                'orders'           => $orders,
            ],
        ]);
    }

    public function ban(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->update(['is_banned' => true]);
        return response()->json(['data' => ['role' => 'banned']]);
    }

    public function unban(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->update(['is_banned' => false]);
        return response()->json(['data' => ['role' => 'customer']]);
    }
}
