<?php

namespace Tests\Feature\Contact;

use App\Models\ContactMessage;
use App\Models\ConsultationRequest;
use App\Models\PracticeArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AdminContactTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $unauthorizedUser;
    protected PracticeArea $practiceArea;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('view_contacts', 'web');
        Permission::findOrCreate('manage_contacts', 'web');
        Permission::findOrCreate('view_consultations', 'web');
        Permission::findOrCreate('manage_consultations', 'web');

        $this->adminUser = User::factory()->create();
        $this->adminUser->givePermissionTo([
            'view_contacts',
            'manage_contacts',
            'view_consultations',
            'manage_consultations',
        ]);

        $this->unauthorizedUser = User::factory()->create();

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Civil Litigation', 'bn' => 'দেওয়ানি মামলা'],
            'slug' => 'test-civil-litigation-' . uniqid(),
            'short_description' => ['en' => 'Civil cases.', 'bn' => 'দেওয়ানি বিষয়াবলী।'],
            'full_description' => ['en' => 'Full civil case representation.', 'bn' => 'পূর্ণ দেওয়ানি মামলা প্রতিনিধিত্ব।'],
            'status' => 'published',
            'sort_order' => 1,
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/v1/admin/contacts')->assertStatus(401);
        $this->getJson('/api/v1/admin/consultations')->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        $this->actingAs($this->unauthorizedUser, 'sanctum')
            ->getJson('/api/v1/admin/contacts')
            ->assertStatus(403);

        $this->actingAs($this->unauthorizedUser, 'sanctum')
            ->getJson('/api/v1/admin/consultations')
            ->assertStatus(403);
    }

    public function test_admin_can_list_contact_messages_with_filters(): void
    {
        ContactMessage::create([
            'name' => 'TEST — Hassan Ali',
            'phone' => '+8801700000001',
            'subject' => 'TEST — Property inquiry',
            'message' => 'Sample message text for testing listing filter.',
            'status' => 'new',
            'consent_given' => true,
        ]);

        ContactMessage::create([
            'name' => 'TEST — Karim Khan',
            'phone' => '+8801700000002',
            'subject' => 'TEST — Arbitration question',
            'message' => 'Sample message text for testing listing filter.',
            'status' => 'replied',
            'consent_given' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/contacts?status=new');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.status', 'new')
            ->assertJsonPath('data.0.name', 'TEST — Hassan Ali');
    }

    public function test_admin_can_view_contact_message_and_marks_as_read(): void
    {
        $msg = ContactMessage::create([
            'name' => 'TEST — Monir Hossain',
            'phone' => '+8801700000003',
            'subject' => 'TEST — Legal opinion on contract',
            'message' => 'Please provide an opinion on commercial contract clause 4.',
            'status' => 'new',
            'consent_given' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/contacts/{$msg->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'TEST — Monir Hossain');

        $msg->refresh();
        $this->assertSame('read', $msg->status);
    }

    public function test_admin_can_update_contact_message_status_and_notes(): void
    {
        $msg = ContactMessage::create([
            'name' => 'TEST — Faruk Ahmed',
            'phone' => '+8801700000004',
            'subject' => 'TEST — High Court Division Bail Inquiry',
            'message' => 'Seeking representation for anticipatory bail hearing.',
            'status' => 'read',
            'consent_given' => true,
        ]);

        $payload = [
            'status' => 'replied',
            'admin_notes' => 'Contacted via telephone on 2026-10-09. Consultation scheduled next week.',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/admin/contacts/{$msg->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'replied')
            ->assertJsonPath('data.admin_notes', $payload['admin_notes']);

        $msg->refresh();
        $this->assertSame('replied', $msg->status);
        $this->assertSame($payload['admin_notes'], $msg->admin_notes);
    }

    public function test_admin_can_soft_delete_contact_message(): void
    {
        $msg = ContactMessage::create([
            'name' => 'TEST — To Be Deleted',
            'phone' => '+8801700000005',
            'subject' => 'TEST — Deletion test',
            'message' => 'This message should be soft-deleted.',
            'status' => 'new',
            'consent_given' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/contacts/{$msg->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('contact_messages', ['id' => $msg->id]);
    }

    public function test_admin_can_list_consultations_with_filters(): void
    {
        ConsultationRequest::create([
            'name' => 'TEST — Client A',
            'phone' => '+8801800000001',
            'subject' => 'TEST — Civil Suit Case',
            'practice_area_id' => $this->practiceArea->id,
            'preferred_date' => now()->addDays(2)->format('Y-m-d'),
            'message' => 'Consultation inquiry regarding title suit.',
            'status' => 'new',
            'consent_given' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/consultations?practice_area_id={$this->practiceArea->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'TEST — Client A');
    }

    public function test_admin_can_view_and_update_consultation_status_and_notes(): void
    {
        $consultation = ConsultationRequest::create([
            'name' => 'TEST — Tariqul Islam',
            'phone' => '+8801800000002',
            'subject' => 'TEST — Writ Consultation',
            'preferred_date' => now()->addDays(3)->format('Y-m-d'),
            'preferred_time' => 'Evening (6:00 PM - 9:00 PM)',
            'message' => 'Consultation narrative regarding tender appeal.',
            'status' => 'new',
            'consent_given' => true,
        ]);

        $showResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/consultations/{$consultation->id}");

        $showResponse->assertStatus(200)
            ->assertJsonPath('data.name', 'TEST — Tariqul Islam')
            ->assertJsonPath('data.preferred_time', 'Evening (6:00 PM - 9:00 PM)');

        $updateResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/admin/consultations/{$consultation->id}", [
                'status' => 'scheduled',
                'admin_notes' => 'Chamber consultation set for Monday at 6:30 PM.',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'scheduled')
            ->assertJsonPath('data.admin_notes', 'Chamber consultation set for Monday at 6:30 PM.');

        $consultation->refresh();
        $this->assertSame('scheduled', $consultation->status);
    }

    public function test_admin_can_soft_delete_consultation(): void
    {
        $consultation = ConsultationRequest::create([
            'name' => 'TEST — Client To Delete',
            'phone' => '+8801800000003',
            'subject' => 'TEST — Deletion Consultation',
            'message' => 'Message to be soft deleted.',
            'status' => 'new',
            'consent_given' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/consultations/{$consultation->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('consultation_requests', ['id' => $consultation->id]);
    }
}
