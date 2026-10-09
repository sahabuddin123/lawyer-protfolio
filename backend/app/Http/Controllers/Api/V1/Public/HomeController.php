<?php

namespace App\Http\Controllers\Api\v1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\HomepageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Retrieve aggregated initial bootstrap data for homepage.
     */
    public function index(Request $request, HomepageService $homepageService): JsonResponse
    {
        $data = $homepageService->getHomepageData($request);

        return ApiResponse::success($data, 'Homepage data retrieved successfully.');
    }
}
