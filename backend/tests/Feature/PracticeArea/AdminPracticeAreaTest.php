<?php

namespace Tests\Feature\PracticeArea;

use App\Models\ActivityLog;
use App\Models\PracticeArea;
use App\Models\Redirect;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPracticeAreaTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'admin_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->editor = User::factory()->create(['name' => 'Editor User', 'email' => 'editor_test@nijamuddin.com']);
        $this->editor->assignRole('editor');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/practice-areas');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        // An unassigned user
        $plainUser = User::factory()->create();
        Sanctum::actingAs($plainUser);

        $response = $this->getJson('/api/v1/admin/practice-areas');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_practice_areas(): void
    {
        Sanctum::actingAs($this->superAdmin);

        PracticeArea::create([
            'title' => ['en' => 'Draft Domain', 'bn' => 'খসড়া ডোমেইন'],
            'slug' => 'draft-domain',
            'short_description' => ['en' => 'Draft description', 'bn' => 'খসড়া বিবরণ'],
            'full_description' => ['en' => '<p>Full</p>', 'bn' => '<p>পূর্ণ</p>'],
            'status' => 'draft',
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/v1/admin/practice-areas');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.slug', 'draft-domain')
            ->assertJsonPath('data.0.status', 'draft')
            ->assertJsonPath('data.0.title.en', 'Draft Domain');
    }

    public function test_admin_can_create_practice_area(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => ['en' => 'Admiralty & Maritime Law', 'bn' => 'নৌ ও সমুদ্র আইন'],
            'slug' => 'admiralty-maritime-law',
            'short_description' => ['en' => 'Vessel arrest and maritime claims.', 'bn' => 'জাহাজ আটক ও নৌ দাবি।'],
            'full_description' => ['en' => '<p>High Court Admiralty jurisdiction advocacy.</p>', 'bn' => '<p>হাইকোর্ট নৌ এখতিয়ার।</p>'],
            'icon_name' => 'compass',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'seo' => [
                'seo_title' => ['en' => 'Admiralty Law in Bangladesh', 'bn' => 'বাংলাদেশে নৌ আইন'],
                'meta_description' => ['en' => 'Maritime legal counsel.', 'bn' => 'নৌ আইনি সহায়তা।'],
            ],
        ];

        // 'compass' is not in APPROVED_ICONS list, so let's verify icon validation:
        // APPROVED_ICONS includes: scale, landmark, shield, briefcase, file-text, scroll, award, users, building, balance, gavel, book-open, globe
        $payload['icon_name'] = 'scale';

        $response = $this->postJson('/api/v1/admin/practice-areas', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'admiralty-maritime-law')
            ->assertJsonPath('data.icon_name', 'scale')
            ->assertJsonPath('data.is_featured', true)
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('practice_areas', [
            'slug' => 'admiralty-maritime-law',
            'icon_name' => 'scale',
            'status' => 'published',
            'is_featured' => 1,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'practice_area_created',
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'practice_area_published',
        ]);
    }

    public function test_admin_creation_sanitizes_xss_in_descriptions(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => ['en' => 'Taxation Law', 'bn' => 'কর আইন'],
            'slug' => 'taxation-law',
            'short_description' => [
                'en' => 'Tax counsel <script>alert("xss")</script>',
                'bn' => 'কর পরামর্শ',
            ],
            'full_description' => [
                'en' => '<p>Safe paragraph</p><script>evil()</script><iframe src="evil.com"></iframe>',
                'bn' => '<p>নিরাপদ অনুচ্ছেদ</p>',
            ],
            'icon_name' => 'briefcase',
            'status' => 'draft',
            'is_featured' => false,
            'sort_order' => 5,
        ];

        $response = $this->postJson('/api/v1/admin/practice-areas', $payload);

        $response->assertStatus(201);

        $created = PracticeArea::where('slug', 'taxation-law')->first();
        $this->assertStringNotContainsString('<script>', $created->short_description['en']);
        $this->assertStringNotContainsString('<script>', $created->full_description['en']);
        $this->assertStringNotContainsString('<iframe', $created->full_description['en']);
        $this->assertStringContainsString('Safe paragraph', $created->full_description['en']);
    }

    public function test_invalid_icon_fails_validation(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => ['en' => 'Custom Area', 'bn' => 'কাস্টম এরিয়া'],
            'slug' => 'custom-area',
            'short_description' => ['en' => 'Short', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => '<p>Full</p>', 'bn' => '<p>পূর্ণ</p>'],
            'icon_name' => 'malicious_icon_name_not_in_whitelist',
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/v1/admin/practice-areas', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('icon_name');
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Sanctum::actingAs($this->superAdmin);

        PracticeArea::create([
            'title' => ['en' => 'Land Law', 'bn' => 'ভূমি আইন'],
            'slug' => 'land-law',
            'short_description' => ['en' => 'Land law', 'bn' => 'ভূমি আইন'],
            'full_description' => ['en' => '<p>Land</p>', 'bn' => '<p>ভূমি</p>'],
            'status' => 'published',
            'sort_order' => 1,
        ]);

        $payload = [
            'title' => ['en' => 'Duplicate Land Law', 'bn' => 'ডুপ্লিকেট ভূমি আইন'],
            'slug' => 'land-law',
            'short_description' => ['en' => 'Duplicate', 'bn' => 'ডুপ্লিকেট'],
            'full_description' => ['en' => '<p>Duplicate</p>', 'bn' => '<p>ডুপ্লিকেট</p>'],
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/v1/admin/practice-areas', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('slug');
    }

    public function test_published_slug_change_creates_301_redirect(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $area = PracticeArea::create([
            'title' => ['en' => 'Writ Law', 'bn' => 'রিট আইন'],
            'slug' => 'writ-law-old',
            'short_description' => ['en' => 'Writ', 'bn' => 'রিট'],
            'full_description' => ['en' => '<p>Writ</p>', 'bn' => '<p>রিট</p>'],
            'status' => 'published',
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        $updatePayload = [
            'title' => ['en' => 'Constitutional Writ Advocacy', 'bn' => 'সাংবিধানিক রিট পরামর্শ'],
            'slug' => 'constitutional-writ-advocacy',
            'short_description' => ['en' => 'Updated writ', 'bn' => 'হালনাগাদ রিট'],
            'full_description' => ['en' => '<p>Updated writ content</p>', 'bn' => '<p>হালনাগাদ রিট বিবরণ</p>'],
            'icon_name' => 'gavel',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
        ];

        $response = $this->putJson("/api/v1/admin/practice-areas/{$area->id}", $updatePayload);

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'constitutional-writ-advocacy');

        // Check auto-redirect record
        $this->assertDatabaseHas('redirects', [
            'source_url' => '/practice-areas/writ-law-old',
            'target_url' => '/practice-areas/constitutional-writ-advocacy',
            'status_code' => 301,
            'is_active' => 1,
        ]);
    }

    public function test_admin_can_delete_practice_area(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $area = PracticeArea::create([
            'title' => ['en' => 'To Delete', 'bn' => 'মুছে ফেলার যোগ্য'],
            'slug' => 'to-delete',
            'short_description' => ['en' => 'Desc', 'bn' => 'বিবরণ'],
            'full_description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'draft',
        ]);

        $response = $this->deleteJson("/api/v1/admin/practice-areas/{$area->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('practice_areas', ['id' => $area->id]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'practice_area_deleted',
        ]);
    }

    public function test_admin_can_reorder_practice_areas(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $a1 = PracticeArea::create([
            'title' => ['en' => 'Area 1', 'bn' => 'এলাকা ১'],
            'slug' => 'area-1',
            'short_description' => ['en' => 'D1', 'bn' => 'ব১'],
            'full_description' => ['en' => '<p>D1</p>', 'bn' => '<p>ব১</p>'],
            'status' => 'draft',
            'sort_order' => 1,
        ]);

        $a2 = PracticeArea::create([
            'title' => ['en' => 'Area 2', 'bn' => 'এলাকা ২'],
            'slug' => 'area-2',
            'short_description' => ['en' => 'D2', 'bn' => 'ব২'],
            'full_description' => ['en' => '<p>D2</p>', 'bn' => '<p>ব২</p>'],
            'status' => 'draft',
            'sort_order' => 2,
        ]);

        $response = $this->postJson('/api/v1/admin/practice-areas/reorder', [
            'items' => [$a2->id, $a1->id],
        ]);

        $response->assertStatus(200);

        $this->assertEquals(1, $a2->fresh()->sort_order);
        $this->assertEquals(2, $a1->fresh()->sort_order);
    }
}
