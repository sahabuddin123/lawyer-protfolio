<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\FooterBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicFooterController extends Controller
{
    public function __construct(
        protected FooterBuilderService $footerService
    ) {}

    /**
     * Retrieve published active footer layout for public presentation.
     */
    public function show(Request $request): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale() ?: 'en');
        if (!in_array($locale, ['en', 'bn'], true)) {
            $locale = 'en';
        }

        $footerData = $this->footerService->getActivePublishedFooter($locale);

        return ApiResponse::success($footerData, 'Public footer retrieved successfully.');
    }
}
