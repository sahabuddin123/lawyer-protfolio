<?php

use App\Http\Controllers\Api\V1\Admin\AdminCareerTimelineController;
use App\Http\Controllers\Api\V1\Admin\AdminCredentialController;
use App\Http\Controllers\Api\V1\Admin\AdminEducationController;
use App\Http\Controllers\Api\V1\Admin\AdminHomepageController;
use App\Http\Controllers\Api\V1\Admin\AdminMenuController;
use App\Http\Controllers\Api\V1\Admin\AdminMenuItemController;
use App\Http\Controllers\Api\V1\Admin\AdminPageController;
use App\Http\Controllers\Api\V1\Admin\AdminProfessionalMembershipController;
use App\Http\Controllers\Api\V1\Admin\AdminProfileController;
use App\Http\Controllers\Api\V1\Admin\AdminRedirectController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\Public\HomeController;
use App\Http\Controllers\Api\V1\Public\NavigationController;
use App\Http\Controllers\Api\V1\Public\PageController;
use App\Http\Controllers\Api\V1\Public\ProfileController;
use App\Http\Controllers\Api\V1\Public\SettingsController;
use App\Http\Controllers\Api\V1\Admin\AdminPracticeAreaController;
use App\Http\Controllers\Api\V1\Public\PracticeAreaController as PublicPracticeAreaController;
use App\Http\Controllers\Api\V1\Admin\AdminCourtroomController;
use App\Http\Controllers\Api\V1\Public\CourtroomController as PublicCourtroomController;
use App\Http\Controllers\Api\V1\Admin\AdminLegalResearchController;
use App\Http\Controllers\Api\V1\Public\LegalResearchController;
use App\Http\Controllers\Api\V1\Admin\AdminTaxonomyController;
use App\Http\Controllers\Api\V1\Public\TaxonomyController;
use App\Http\Controllers\Api\V1\Admin\AdminJudgmentReviewController;
use App\Http\Controllers\Api\V1\Public\JudgmentReviewController;
use App\Http\Controllers\Api\V1\Admin\AdminPublicationController;
use App\Http\Controllers\Api\V1\Public\PublicationController;
use App\Http\Controllers\Api\V1\Admin\AdminMediaPressController;
use App\Http\Controllers\Api\V1\Admin\AdminMediaAppearanceController;
use App\Http\Controllers\Api\V1\Public\MediaPressController;
use App\Http\Controllers\Api\V1\Public\MediaAppearanceController;
use App\Http\Controllers\Api\V1\Public\MediaController;
use App\Http\Resources\V1\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (Version 1)
|--------------------------------------------------------------------------
|
| Base URL Prefix: /api/v1 (configured in bootstrap/app.php)
|
*/

// Health Check Endpoint (Public foundation probe)
Route::get('/health', HealthCheckController::class);

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Public Web API Route Group (Rate-limited to 60 req/min)
Route::middleware(['throttle:api'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::get('/navigation', [NavigationController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);
    Route::get('/home', [HomeController::class, 'index']);

    // Phase 6 Profile Public Routes
    Route::get('/profile', [ProfileController::class, 'index']);
    Route::get('/credentials', [ProfileController::class, 'credentials']);
    Route::get('/timeline', [ProfileController::class, 'timeline']);

    // Phase 7 Practice Areas Public Routes
    Route::get('/practice-areas', [PublicPracticeAreaController::class, 'index']);
    Route::get('/practice-areas/{slug}', [PublicPracticeAreaController::class, 'show']);

    // Phase 8 Courtroom Public Routes
    Route::get('/courtroom', [PublicCourtroomController::class, 'index']);
    Route::get('/courtroom/documents/{id}/download', [PublicCourtroomController::class, 'downloadDocument']);
    Route::get('/courtroom/{slug}', [PublicCourtroomController::class, 'show']);

    // Phase 9 Legal Research Public Routes
    Route::get('/research', [LegalResearchController::class, 'index']);
    Route::get('/research/{slug}/download', [LegalResearchController::class, 'downloadPdf']);
    Route::get('/research/{slug}', [LegalResearchController::class, 'show']);

    // Phase 10 Judgment Reviews Public Routes
    Route::get('/judgments', [JudgmentReviewController::class, 'index']);
    Route::get('/judgments/{slug}/download', [JudgmentReviewController::class, 'downloadPdf']);
    Route::get('/judgments/{slug}', [JudgmentReviewController::class, 'show']);

    // Phase 11 Publications Public Routes
    Route::get('/publications', [PublicationController::class, 'index']);
    Route::get('/publications/{slug}/download', [PublicationController::class, 'downloadPdf']);
    Route::get('/publications/{slug}', [PublicationController::class, 'show']);

    // Phase 12 Media Public Routes
    Route::get('/media/press', [MediaPressController::class, 'index']);
    Route::get('/media/press/{slug}/download', [MediaPressController::class, 'downloadDocument']);
    Route::get('/media/press/{slug}', [MediaPressController::class, 'show']);

    Route::get('/media/appearances', [MediaAppearanceController::class, 'index']);
    Route::get('/media/appearances/{slug}/download', [MediaAppearanceController::class, 'downloadDocument']);
    Route::get('/media/appearances/{slug}', [MediaAppearanceController::class, 'show']);

    Route::get('/media', [MediaController::class, 'index']);
    Route::get('/media/{slug}', [MediaController::class, 'show']);

    // Taxonomy Public Routes
    Route::get('/categories', [TaxonomyController::class, 'categories']);
    Route::get('/tags', [TaxonomyController::class, 'tags']);
});


// Client Intake Route Group Foundation (Rate-limited to 5 req/min)
Route::middleware(['throttle:intake'])->group(function () {
    // Honeypot-guarded public inquiry endpoints will register here
});

// Admin / Authenticated API Route Group (Sanctum protected + RBAC)
Route::prefix('admin')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    // Admin Verification Probes for RBAC Testing
    Route::get('/dashboard/stats', function () {
        return ApiResponse::success([
            'stats' => [
                'users_count' => User::count(),
            ],
        ], 'Dashboard statistics retrieved successfully.');
    })->middleware('permission:view_dashboard');

    Route::get('/users', function () {
        return ApiResponse::success(
            UserResource::collection(User::with(['avatar', 'roles.permissions', 'permissions'])->get()),
            'Users list retrieved successfully.'
        );
    })->middleware('permission:manage_users');

    // CMS & Site Settings Routes
    Route::prefix('settings')->middleware('permission:manage_settings')->group(function () {
        Route::get('/', [AdminSettingController::class, 'index']);
        Route::put('/', [AdminSettingController::class, 'update']);
    });

    Route::apiResource('pages', AdminPageController::class)->middleware('permission:manage_pages');

    Route::prefix('menus')->middleware('permission:manage_menus')->group(function () {
        Route::get('/', [AdminMenuController::class, 'index']);
        Route::post('/', [AdminMenuController::class, 'store']);
        Route::get('/{menu}', [AdminMenuController::class, 'show']);
        Route::put('/{menu}', [AdminMenuController::class, 'update']);
        Route::delete('/{menu}', [AdminMenuController::class, 'destroy']);
        Route::post('/{menu}/reorder', [AdminMenuController::class, 'reorderItems']);
    });

    Route::prefix('menu-items')->middleware('permission:manage_menus')->group(function () {
        Route::post('/', [AdminMenuItemController::class, 'store']);
        Route::put('/{menuItem}', [AdminMenuItemController::class, 'update']);
        Route::delete('/{menuItem}', [AdminMenuItemController::class, 'destroy']);
    });

    Route::prefix('homepage')->middleware('permission:manage_homepage')->group(function () {
        Route::get('/sections', [AdminHomepageController::class, 'index']);
        Route::put('/sections/{homepageSection}', [AdminHomepageController::class, 'update']);
        Route::post('/sections/reorder', [AdminHomepageController::class, 'reorder']);
    });

    Route::apiResource('redirects', AdminRedirectController::class)->middleware('permission:manage_redirects');

    // Phase 6 Profile & Pedigree Routes
    Route::prefix('profile')->middleware('permission:edit_profile')->group(function () {
        Route::get('/', [AdminProfileController::class, 'show']);
        Route::put('/', [AdminProfileController::class, 'update']);
    });

    Route::prefix('credentials')->middleware('permission:manage_credentials')->group(function () {
        Route::get('/', [AdminCredentialController::class, 'index']);
        Route::post('/', [AdminCredentialController::class, 'store']);
        Route::post('/reorder', [AdminCredentialController::class, 'reorder']);
        Route::get('/{credential}', [AdminCredentialController::class, 'show']);
        Route::put('/{credential}', [AdminCredentialController::class, 'update']);
        Route::delete('/{credential}', [AdminCredentialController::class, 'destroy']);
    });

    Route::prefix('educations')->middleware('permission:manage_educations')->group(function () {
        Route::get('/', [AdminEducationController::class, 'index']);
        Route::post('/', [AdminEducationController::class, 'store']);
        Route::post('/reorder', [AdminEducationController::class, 'reorder']);
        Route::get('/{education}', [AdminEducationController::class, 'show']);
        Route::put('/{education}', [AdminEducationController::class, 'update']);
        Route::delete('/{education}', [AdminEducationController::class, 'destroy']);
    });

    Route::prefix('timeline')->middleware('permission:manage_timeline')->group(function () {
        Route::get('/', [AdminCareerTimelineController::class, 'index']);
        Route::post('/', [AdminCareerTimelineController::class, 'store']);
        Route::post('/reorder', [AdminCareerTimelineController::class, 'reorder']);
        Route::get('/{careerTimeline}', [AdminCareerTimelineController::class, 'show']);
        Route::put('/{careerTimeline}', [AdminCareerTimelineController::class, 'update']);
        Route::delete('/{careerTimeline}', [AdminCareerTimelineController::class, 'destroy']);
    });

    Route::prefix('memberships')->middleware('permission:manage_memberships')->group(function () {
        Route::get('/', [AdminProfessionalMembershipController::class, 'index']);
        Route::post('/', [AdminProfessionalMembershipController::class, 'store']);
        Route::post('/reorder', [AdminProfessionalMembershipController::class, 'reorder']);
        Route::get('/{membership}', [AdminProfessionalMembershipController::class, 'show']);
        Route::put('/{membership}', [AdminProfessionalMembershipController::class, 'update']);
        Route::delete('/{membership}', [AdminProfessionalMembershipController::class, 'destroy']);
    });

    // Phase 7 Practice Areas Admin Routes
    Route::prefix('practice-areas')->group(function () {
        Route::get('/', [AdminPracticeAreaController::class, 'index'])->middleware('permission:edit_practice_area|create_practice_area');
        Route::post('/', [AdminPracticeAreaController::class, 'store'])->middleware('permission:create_practice_area');
        Route::post('/reorder', [AdminPracticeAreaController::class, 'reorder'])->middleware('permission:edit_practice_area');
        Route::get('/{practiceArea}', [AdminPracticeAreaController::class, 'show'])->middleware('permission:edit_practice_area');
        Route::put('/{practiceArea}', [AdminPracticeAreaController::class, 'update'])->middleware('permission:edit_practice_area');
        Route::delete('/{practiceArea}', [AdminPracticeAreaController::class, 'destroy'])->middleware('permission:delete_practice_area');
    });

    // Phase 8 Courtroom Admin Routes
    Route::prefix('courtroom')->group(function () {
        Route::get('/', [AdminCourtroomController::class, 'index'])->middleware('permission:edit_cases|create_cases');
        Route::post('/', [AdminCourtroomController::class, 'store'])->middleware('permission:create_cases');
        Route::post('/reorder', [AdminCourtroomController::class, 'reorder'])->middleware('permission:edit_cases');
        Route::get('/{courtroom}', [AdminCourtroomController::class, 'show'])->middleware('permission:edit_cases');
        Route::put('/{courtroom}', [AdminCourtroomController::class, 'update'])->middleware('permission:edit_cases');
        Route::delete('/{courtroom}', [AdminCourtroomController::class, 'destroy'])->middleware('permission:delete_cases');
        Route::post('/{id}/documents', [AdminCourtroomController::class, 'addDocument'])->middleware('permission:manage_case_documents');
    });

    Route::prefix('case-documents')->middleware('permission:manage_case_documents|view_confidential_cases')->group(function () {
        Route::put('/{id}', [AdminCourtroomController::class, 'updateDocument'])->middleware('permission:manage_case_documents');
        Route::delete('/{id}', [AdminCourtroomController::class, 'deleteDocument'])->middleware('permission:manage_case_documents');
        Route::get('/{id}/download', [AdminCourtroomController::class, 'downloadDocument']);
    });

    // Phase 9 Legal Research Admin Routes
    Route::prefix('research')->group(function () {
        Route::get('/', [AdminLegalResearchController::class, 'index'])->middleware('permission:edit_research|create_research');
        Route::post('/', [AdminLegalResearchController::class, 'store'])->middleware('permission:create_research');
        Route::post('/reorder', [AdminLegalResearchController::class, 'reorder'])->middleware('permission:edit_research');
        Route::get('/{research}/preview', [AdminLegalResearchController::class, 'preview'])->middleware('permission:edit_research|create_research');
        Route::get('/{research}/download', [AdminLegalResearchController::class, 'downloadDocument'])->middleware('permission:edit_research|create_research');
        Route::get('/{research}', [AdminLegalResearchController::class, 'show'])->middleware('permission:edit_research|create_research');
        Route::put('/{research}', [AdminLegalResearchController::class, 'update'])->middleware('permission:edit_research');
        Route::delete('/{research}', [AdminLegalResearchController::class, 'destroy'])->middleware('permission:delete_research');
    });

    // Phase 10 Judgment Reviews Admin Routes
    Route::prefix('judgments')->group(function () {
        Route::get('/', [AdminJudgmentReviewController::class, 'index'])->middleware('permission:edit_judgments|create_judgments');
        Route::post('/', [AdminJudgmentReviewController::class, 'store'])->middleware('permission:create_judgments');
        Route::post('/reorder', [AdminJudgmentReviewController::class, 'reorder'])->middleware('permission:edit_judgments');
        Route::get('/{judgment}/preview', [AdminJudgmentReviewController::class, 'preview'])->middleware('permission:edit_judgments|create_judgments');
        Route::get('/{judgment}/download', [AdminJudgmentReviewController::class, 'downloadDocument'])->middleware('permission:edit_judgments|create_judgments');
        Route::get('/{judgment}', [AdminJudgmentReviewController::class, 'show'])->middleware('permission:edit_judgments|create_judgments');
        Route::put('/{judgment}', [AdminJudgmentReviewController::class, 'update'])->middleware('permission:edit_judgments');
        Route::delete('/{judgment}', [AdminJudgmentReviewController::class, 'destroy'])->middleware('permission:delete_judgments');
    });

    // Phase 11 Publications Admin Routes
    Route::prefix('publications')->group(function () {
        Route::get('/', [AdminPublicationController::class, 'index'])->middleware('permission:edit_publications|create_publications');
        Route::post('/', [AdminPublicationController::class, 'store'])->middleware('permission:create_publications');
        Route::post('/reorder', [AdminPublicationController::class, 'reorder'])->middleware('permission:edit_publications');
        Route::get('/{publication}/preview', [AdminPublicationController::class, 'preview'])->middleware('permission:edit_publications|create_publications');
        Route::get('/{publication}/download', [AdminPublicationController::class, 'downloadDocument'])->middleware('permission:edit_publications|create_publications');
        Route::get('/{publication}', [AdminPublicationController::class, 'show'])->middleware('permission:edit_publications|create_publications');
        Route::put('/{publication}', [AdminPublicationController::class, 'update'])->middleware('permission:edit_publications');
        Route::delete('/{publication}', [AdminPublicationController::class, 'destroy'])->middleware('permission:delete_publications');
    });

    // Phase 12 Media Press Admin Routes
    Route::prefix('media/press')->middleware('permission:manage_press')->group(function () {
        Route::get('/', [AdminMediaPressController::class, 'index']);
        Route::post('/', [AdminMediaPressController::class, 'store']);
        Route::post('/reorder', [AdminMediaPressController::class, 'reorder']);
        Route::get('/{mediaPress}/preview', [AdminMediaPressController::class, 'preview']);
        Route::get('/{mediaPress}/download', [AdminMediaPressController::class, 'downloadDocument']);
        Route::get('/{mediaPress}', [AdminMediaPressController::class, 'show']);
        Route::put('/{mediaPress}', [AdminMediaPressController::class, 'update']);
        Route::delete('/{mediaPress}', [AdminMediaPressController::class, 'destroy']);
    });

    // Phase 12 Media Appearances Admin Routes
    Route::prefix('media/appearances')->middleware('permission:manage_appearances')->group(function () {
        Route::get('/', [AdminMediaAppearanceController::class, 'index']);
        Route::post('/', [AdminMediaAppearanceController::class, 'store']);
        Route::post('/reorder', [AdminMediaAppearanceController::class, 'reorder']);
        Route::get('/{mediaAppearance}/preview', [AdminMediaAppearanceController::class, 'preview']);
        Route::get('/{mediaAppearance}/download', [AdminMediaAppearanceController::class, 'downloadDocument']);
        Route::get('/{mediaAppearance}', [AdminMediaAppearanceController::class, 'show']);
        Route::put('/{mediaAppearance}', [AdminMediaAppearanceController::class, 'update']);
        Route::delete('/{mediaAppearance}', [AdminMediaAppearanceController::class, 'destroy']);
    });

    // Taxonomies Admin Routes
    Route::prefix('taxonomies')->middleware('permission:edit_research|create_research|manage_settings')->group(function () {
        Route::get('/categories', [AdminTaxonomyController::class, 'categories']);
        Route::post('/categories', [AdminTaxonomyController::class, 'storeCategory']);
        Route::get('/tags', [AdminTaxonomyController::class, 'tags']);
        Route::post('/tags', [AdminTaxonomyController::class, 'storeTag']);
    });
});

