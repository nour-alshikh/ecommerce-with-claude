<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRoutesTest extends TestCase
{
    use RefreshDatabase;

    private array $adminRoutes = [
        ['GET',   '/api/v1/admin/stats'],
        ['GET',   '/api/v1/admin/stats/revenue'],
        ['GET',   '/api/v1/admin/stats/top-products'],
        ['GET',   '/api/v1/admin/orders'],
        ['GET',   '/api/v1/admin/customers'],
        ['GET',   '/api/v1/admin/coupons'],
        ['GET',   '/api/v1/admin/reviews'],
        ['GET',   '/api/v1/admin/settings'],
        ['GET',   '/api/v1/admin/products'],
        ['GET',   '/api/v1/admin/categories'],
    ];

    public function test_unauthenticated_requests_get_401(): void
    {
        foreach ($this->adminRoutes as [$method, $path]) {
            $this->json($method, $path)
                ->assertStatus(401, "Expected 401 for {$method} {$path}");
        }
    }

    public function test_customer_gets_403_on_all_admin_routes(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        foreach ($this->adminRoutes as [$method, $path]) {
            $this->actingAs($customer)
                ->json($method, $path)
                ->assertStatus(403, "Expected 403 for customer on {$method} {$path}");
        }
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Just check it's not 401/403 — actual data responses tested per controller
        foreach ($this->adminRoutes as [$method, $path]) {
            $this->actingAs($admin)
                ->json($method, $path)
                ->assertSuccessful("Expected success for admin on {$method} {$path}");
        }
    }

    public function test_banned_customer_gets_403(): void
    {
        $banned = User::factory()->create(['role' => 'customer', 'is_banned' => true]);

        // Banned users can't access any authenticated route
        $this->actingAs($banned)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(403);
    }
}
