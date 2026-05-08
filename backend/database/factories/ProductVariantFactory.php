<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id'     => Product::factory(),
            'name'           => $this->faker->randomElement(['S', 'M', 'L', 'XL', 'XXL']),
            'sku'            => strtoupper($this->faker->unique()->bothify('VAR-####')),
            'price_modifier' => 0,
            'stock'          => $this->faker->numberBetween(0, 50),
            'sort_order'     => 0,
        ];
    }
}
