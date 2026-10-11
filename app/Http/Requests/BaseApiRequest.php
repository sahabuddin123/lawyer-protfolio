<?php

namespace App\Http\Requests;

use App\Http\Responses\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class BaseApiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Handle a failed validation attempt with the standardized API error envelope.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                'The given data was invalid.',
                422,
                $validator->errors()->toArray(),
                'VALIDATION_FAILED'
            )
        );
    }

    /**
     * Handle a failed authorization attempt with standardized API error envelope.
     */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                'You do not have authorization to perform this action.',
                403,
                [],
                'FORBIDDEN'
            )
        );
    }
}
