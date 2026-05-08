<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\AddressRequest;
use App\Http\Resources\AddressResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->get();
        return response()->json(['data' => AddressResource::collection($addresses)]);
    }

    public function store(AddressRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($data);
        return response()->json(['data' => new AddressResource($address)], 201);
    }

    public function update(AddressRequest $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $data    = $request->validated();

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($data);
        return response()->json(['data' => new AddressResource($address)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();
        return response()->json(['message' => 'Address deleted.']);
    }
}
