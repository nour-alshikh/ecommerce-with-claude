<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── Users ──────────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@ecommerce.local'],
            ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'customer@ecommerce.local'],
            ['name' => 'Test Customer', 'password' => Hash::make('password'), 'role' => 'customer']
        );

        // ── Categories ─────────────────────────────────────────────────────
        $electronics = Category::firstOrCreate(
            ['slug' => 'electronics'],
            ['name' => 'Electronics', 'sort_order' => 1]
        );

        $clothing = Category::firstOrCreate(
            ['slug' => 'clothing'],
            ['name' => 'Clothing', 'sort_order' => 2]
        );

        $home = Category::firstOrCreate(
            ['slug' => 'home-garden'],
            ['name' => 'Home & Garden', 'sort_order' => 3]
        );

        // ── Products ───────────────────────────────────────────────────────
        $products = [
            // Electronics
            ['name' => 'Wireless Headphones Pro', 'category' => $electronics, 'price' => 199.99, 'sale_price' => 149.99, 'stock' => 50, 'featured' => true,
             'desc' => 'Premium wireless headphones with active noise cancellation and 30-hour battery life.'],
            ['name' => 'Mechanical Keyboard RGB', 'category' => $electronics, 'price' => 129.99, 'sale_price' => null, 'stock' => 30, 'featured' => false,
             'desc' => 'Full-size mechanical keyboard with customizable RGB backlighting and tactile switches.'],
            ['name' => 'USB-C Monitor 27"', 'category' => $electronics, 'price' => 449.99, 'sale_price' => 399.99, 'stock' => 15, 'featured' => true,
             'desc' => '4K IPS display with USB-C power delivery, perfect for creators and developers.'],
            ['name' => 'Portable Bluetooth Speaker', 'category' => $electronics, 'price' => 79.99, 'sale_price' => null, 'stock' => 80, 'featured' => false,
             'desc' => 'Waterproof speaker with 360° sound and 12-hour playback.'],
            ['name' => 'Webcam 4K Auto-Focus', 'category' => $electronics, 'price' => 119.99, 'sale_price' => 89.99, 'stock' => 40, 'featured' => false,
             'desc' => 'Professional 4K webcam with AI-powered auto-focus for video calls and streaming.'],
            ['name' => 'Smart Watch Series X', 'category' => $electronics, 'price' => 299.99, 'sale_price' => null, 'stock' => 25, 'featured' => true,
             'desc' => 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.'],
            ['name' => 'Wireless Mouse Ultra', 'category' => $electronics, 'price' => 59.99, 'sale_price' => null, 'stock' => 100, 'featured' => false,
             'desc' => 'Ergonomic wireless mouse with silent clicks and multi-device pairing.'],

            // Clothing
            ['name' => 'Classic Cotton T-Shirt', 'category' => $clothing, 'price' => 29.99, 'sale_price' => null, 'stock' => 0, 'featured' => false,
             'desc' => 'Soft 100% organic cotton t-shirt in a relaxed fit. Available in multiple colors.',
             'variants' => [['name' => 'S'], ['name' => 'M'], ['name' => 'L'], ['name' => 'XL']]],
            ['name' => 'Slim Fit Chinos', 'category' => $clothing, 'price' => 69.99, 'sale_price' => 49.99, 'stock' => 0, 'featured' => true,
             'desc' => 'Versatile slim-fit chinos made from stretch cotton blend for all-day comfort.',
             'variants' => [['name' => '30x30'], ['name' => '32x30'], ['name' => '32x32'], ['name' => '34x32']]],
            ['name' => 'Hooded Sweatshirt', 'category' => $clothing, 'price' => 59.99, 'sale_price' => null, 'stock' => 0, 'featured' => false,
             'desc' => 'Heavyweight fleece hoodie with kangaroo pocket and adjustable drawstring.',
             'variants' => [['name' => 'XS'], ['name' => 'S'], ['name' => 'M'], ['name' => 'L'], ['name' => 'XL']]],
            ['name' => 'Running Sneakers', 'category' => $clothing, 'price' => 119.99, 'sale_price' => 89.99, 'stock' => 0, 'featured' => true,
             'desc' => 'Lightweight running shoes with responsive cushioning and breathable mesh upper.',
             'variants' => [['name' => '8'], ['name' => '9'], ['name' => '10'], ['name' => '11'], ['name' => '12']]],
            ['name' => 'Leather Belt', 'category' => $clothing, 'price' => 34.99, 'sale_price' => null, 'stock' => 60, 'featured' => false,
             'desc' => 'Full-grain leather belt with brushed silver buckle. Classic and durable.'],
            ['name' => 'Wool Beanie', 'category' => $clothing, 'price' => 19.99, 'sale_price' => null, 'stock' => 120, 'featured' => false,
             'desc' => 'Warm merino wool beanie, ribbed knit design, one size fits most.'],

            // Home & Garden
            ['name' => 'Ceramic Plant Pot Set', 'category' => $home, 'price' => 49.99, 'sale_price' => null, 'stock' => 35, 'featured' => false,
             'desc' => 'Set of 3 handmade ceramic pots with drainage holes. Perfect for indoor plants.'],
            ['name' => 'Bamboo Cutting Board', 'category' => $home, 'price' => 39.99, 'sale_price' => 29.99, 'stock' => 70, 'featured' => false,
             'desc' => 'Extra-large bamboo cutting board with juice groove and non-slip feet.'],
            ['name' => 'Scented Soy Candle Set', 'category' => $home, 'price' => 44.99, 'sale_price' => null, 'stock' => 90, 'featured' => true,
             'desc' => 'Set of 4 hand-poured soy candles in vanilla, cedar, lavender, and citrus scents.'],
            ['name' => 'French Press Coffee Maker', 'category' => $home, 'price' => 34.99, 'sale_price' => null, 'stock' => 45, 'featured' => false,
             'desc' => '34 oz borosilicate glass French press with stainless steel filter system.'],
            ['name' => 'LED Desk Lamp', 'category' => $home, 'price' => 54.99, 'sale_price' => 44.99, 'stock' => 55, 'featured' => false,
             'desc' => 'Touch-control LED lamp with 5 brightness levels and USB charging port.'],
            ['name' => 'Linen Throw Blanket', 'category' => $home, 'price' => 79.99, 'sale_price' => null, 'stock' => 40, 'featured' => true,
             'desc' => 'Lightweight stonewashed linen blanket, 60x80", perfect for sofa or bed.'],
            ['name' => 'Herb Garden Starter Kit', 'category' => $home, 'price' => 29.99, 'sale_price' => null, 'stock' => 65, 'featured' => false,
             'desc' => 'Complete indoor herb kit with 6 varieties, biodegradable pots, and organic soil.'],
        ];

        foreach ($products as $i => $data) {
            $slug = Str::slug($data['name']);
            $product = Product::firstOrCreate(
                ['slug' => $slug],
                [
                    'category_id'       => $data['category']->id,
                    'name'              => $data['name'],
                    'description'       => $data['desc'],
                    'short_description' => Str::limit($data['desc'], 120),
                    'price'             => $data['price'],
                    'sale_price'        => $data['sale_price'],
                    'stock'             => $data['stock'],
                    'sku'               => 'SKU-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'status'            => 'active',
                    'is_featured'       => $data['featured'],
                ]
            );

            // Seed variants if defined
            if (isset($data['variants']) && $product->variants()->count() === 0) {
                foreach ($data['variants'] as $j => $variant) {
                    ProductVariant::create([
                        'product_id'     => $product->id,
                        'name'           => $variant['name'],
                        'price_modifier' => 0,
                        'stock'          => rand(5, 30),
                        'sort_order'     => $j,
                    ]);
                }
            }
        }
    }
}
