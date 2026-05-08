<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $revenue = fn (string $from) => Order::whereNotIn('status', ['cancelled', 'refunded'])
            ->whereDate('created_at', '>=', $from)
            ->sum('total');

        $orderCount = fn (string $from) => Order::whereDate('created_at', '>=', $from)->count();

        return response()->json([
            'data' => [
                'revenue' => [
                    'today' => (float) $revenue($today),
                    'week'  => (float) $revenue($weekStart),
                    'month' => (float) $revenue($monthStart),
                ],
                'orders' => [
                    'today'      => $orderCount($today),
                    'week'       => $orderCount($weekStart),
                    'month'      => $orderCount($monthStart),
                    'pending'    => Order::where('status', 'pending')->count(),
                    'processing' => Order::where('status', 'processing')->count(),
                ],
                'customers' => [
                    'total'       => User::where('role', 'customer')->count(),
                    'this_month'  => User::where('role', 'customer')
                        ->whereDate('created_at', '>=', $monthStart)
                        ->count(),
                ],
            ],
        ]);
    }

    public function revenue(): JsonResponse
    {
        $rows = Order::whereNotIn('status', ['cancelled', 'refunded'])
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['data' => $rows]);
    }

    public function topProducts(): JsonResponse
    {
        $rows = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereNotIn('orders.status', ['cancelled', 'refunded'])
            ->selectRaw('product_id, product_name, SUM(quantity) as total_sold, SUM(subtotal) as total_revenue')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return response()->json(['data' => $rows]);
    }
}
