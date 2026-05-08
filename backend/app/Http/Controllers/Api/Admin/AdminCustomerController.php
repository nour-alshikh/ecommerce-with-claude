<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
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
                'id'           => $c->id,
                'name'         => $c->name,
                'email'        => $c->email,
                'is_banned'    => $c->is_banned,
                'orders_count' => $c->orders_count,
                'total_spent'  => (float) ($c->orders_sum_total ?? 0),
                'created_at'   => $c->created_at?->toISOString(),
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
        $customer = User::where('role', 'customer')->findOrFail($id);
        $orders   = $customer->orders()->with(['items', 'payment'])->latest()->paginate(10);

        return response()->json([
            'data' => [
                'customer' => new UserResource($customer),
                'orders'   => [
                    'data' => OrderResource::collection($orders),
                    'meta' => [
                        'current_page' => $orders->currentPage(),
                        'last_page'    => $orders->lastPage(),
                        'total'        => $orders->total(),
                    ],
                ],
            ],
        ]);
    }

    public function ban(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->update(['is_banned' => true]);
        return response()->json(['data' => new UserResource($customer)]);
    }

    public function unban(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->update(['is_banned' => false]);
        return response()->json(['data' => new UserResource($customer)]);
    }
}
