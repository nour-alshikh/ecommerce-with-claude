<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'name'       => ['required', 'string', 'max:255'],
            'slug'       => ['required', 'string', Rule::unique('categories', 'slug')->ignore($categoryId)],
            'parent_id'  => ['nullable', 'exists:categories,id'],
            'sort_order' => ['integer', 'min:0'],
            'image'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
