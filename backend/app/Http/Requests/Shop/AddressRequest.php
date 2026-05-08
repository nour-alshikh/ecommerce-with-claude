<?php

namespace App\Http\Requests\Shop;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'label'       => ['nullable', 'string', 'max:100'],
            'full_name'   => ['required', 'string', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'line1'       => ['required', 'string', 'max:255'],
            'line2'       => ['nullable', 'string', 'max:255'],
            'city'        => ['required', 'string', 'max:100'],
            'state'       => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country'     => ['required', 'string', 'size:2'],
            'is_default'  => ['sometimes', 'boolean'],
        ];
    }
}
