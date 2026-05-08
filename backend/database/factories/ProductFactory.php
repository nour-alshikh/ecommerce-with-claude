<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);

        return [
            'category_id'       => Category::factory(),
            'name'              => ucwords($name),
            'slug'              => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'description'       => $this->faker->paragraph(),
            'short_description' => $this->faker->sentence(),
            'price'             => $this->faker->randomFloat(2, 9.99, 299.99),
            'sale_price'        => null,
            'stock'             => $this->faker->numberBetween(0, 100),
            'sku'               => strtoupper($this->faker->unique()->bothify('??-####')),
            'status'            => 'active',
            'is_featured'       => false,
            'views_count'       => 0,
        ];
    }
}
