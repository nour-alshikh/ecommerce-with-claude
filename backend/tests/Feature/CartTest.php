<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(int $stock = 10): Product
    {
        return Product::factory()->create([
            'status' => 'active',
            'stock'  => $stock,
            'price'  => 29.99,
        ]);
    }

    // ── Guest cart ─────────────────────────────────────────────────────────

    public function test_guest_can_get_empty_cart(): void
    {
        $this->getJson('/api/v1/cart', ['X-Session-Id' => 'sess-abc'])
            ->assertOk()
            ->assertJsonPath('data.item_count', 0);
    }

    public function test_guest_can_add_item_to_cart(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity'   => 2,
        ], ['X-Session-Id' => 'sess-abc'])
            ->assertOk()
            ->assertJsonPath('data.item_count', 2);
    }

    public function test_add_item_fails_when_out_of_stock(): void
    {
        $product = $this->makeProduct(stock: 0);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity'   => 1,
        ], ['X-Session-Id' => 'sess-abc'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_adding_same_product_twice_increments_quantity(): void
    {
        $product = $this->makeProduct();

        $headers = ['X-Session-Id' => 'sess-merge'];

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 1], $headers);
        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 2], $headers)
            ->assertOk()
            ->assertJsonPath('data.item_count', 3);
    }

    // ── Authenticated cart ──────────────────────────────────────────────────

    public function test_auth_user_can_add_and_update_item(): void
    {
        $user    = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertOk();

        $itemId = $response->json('data.items.0.id');

        $this->actingAs($user)
            ->patchJson("/api/v1/cart/items/{$itemId}", ['quantity' => 5])
            ->assertOk()
            ->assertJsonPath('data.item_count', 5);
    }

    public function test_update_item_to_zero_removes_it(): void
    {
        $user    = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 2])
            ->assertOk();

        $itemId = $response->json('data.items.0.id');

        $this->actingAs($user)
            ->patchJson("/api/v1/cart/items/{$itemId}", ['quantity' => 0])
            ->assertOk()
            ->assertJsonPath('data.item_count', 0);
    }

    public function test_auth_user_can_remove_item(): void
    {
        $user    = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 1])
            ->assertOk();

        $itemId = $response->json('data.items.0.id');

        $this->actingAs($user)
            ->deleteJson("/api/v1/cart/items/{$itemId}")
            ->assertOk()
            ->assertJsonPath('data.item_count', 0);
    }

    // ── Variant stock check ─────────────────────────────────────────────────

    public function test_add_variant_fails_when_variant_out_of_stock(): void
    {
        $user    = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct();
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'stock'      => 0,
        ]);

        $this->actingAs($user)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity'   => 1,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['quantity']);
    }

    // ── Clear cart ──────────────────────────────────────────────────────────

    public function test_auth_user_can_clear_cart(): void
    {
        $user    = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct();

        $this->actingAs($user)
            ->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 3]);

        $this->actingAs($user)
            ->deleteJson('/api/v1/cart')
            ->assertOk();

        $this->actingAs($user)
            ->getJson('/api/v1/cart')
            ->assertOk()
            ->assertJsonPath('data.item_count', 0);
    }
}
