<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'category_id'       => ['required', 'exists:categories,id'],
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['required', 'string', Rule::unique('products', 'slug')->ignore($productId)->whereNull('deleted_at')],
            'description'       => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'price'             => ['required', 'numeric', 'min:0'],
            'sale_price'        => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'stock'             => ['required', 'integer', 'min:0'],
            'sku'               => ['nullable', 'string', Rule::unique('products', 'sku')->ignore($productId)->whereNull('deleted_at')],
            'status'            => ['required', 'in:active,inactive,draft'],
            'is_featured'       => ['boolean'],
            'weight'            => ['nullable', 'numeric', 'min:0'],
            'variants'          => ['nullable', 'array'],
            'variants.*.name'           => ['required', 'string'],
            'variants.*.price_modifier' => ['required', 'numeric'],
            'variants.*.stock'          => ['required', 'integer', 'min:0'],
        ];
    }
}
