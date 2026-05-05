<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'slug'              => $this->slug,
            'description'       => $this->description,
            'short_description' => $this->short_description,
            'price'             => (float) $this->price,
            'sale_price'        => $this->sale_price ? (float) $this->sale_price : null,
            'effective_price'   => (float) $this->effective_price,
            'stock'             => $this->stock,
            'sku'               => $this->sku,
            'status'            => $this->status,
            'is_featured'       => $this->is_featured,
            'views_count'       => $this->views_count,
            'category'          => new CategoryResource($this->whenLoaded('category')),
            'images'            => ProductImageResource::collection($this->whenLoaded('images')),
            'variants'          => ProductVariantResource::collection($this->whenLoaded('variants')),
            'created_at'        => $this->created_at?->toISOString(),
        ];
    }
}
