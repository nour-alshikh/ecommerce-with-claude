<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->word();

        return [
            'parent_id'  => null,
            'name'       => ucfirst($name),
            'slug'       => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(100, 999),
            'image_path' => null,
            'sort_order' => 0,
        ];
    }
}
