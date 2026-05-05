<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'image_url'  => $this->image_path ? asset('storage/' . $this->image_path) : null,
            'parent_id'  => $this->parent_id,
            'children'   => CategoryResource::collection($this->whenLoaded('children')),
            'sort_order' => $this->sort_order,
        ];
    }
}
