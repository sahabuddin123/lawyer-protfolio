<?php

namespace Tests\Feature\Contact;

use App\Models\ActivityLog;
use App\Models\ContactMessage;
use App\Models\ConsultationRequest;
use App\Models\PracticeArea;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ContactE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
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

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Corporate & Commercial', 'bn' => 'কর্পোরেট ও বাণিজ্যিক'],
            'slug' => 'test-corporate-' . uniqid(),
            'short_description' => ['en' => 'Corporate advisory.', 'bn' => 'কর্পোরেট পরামর্শ।'],
            'full_description' => ['en' => 'Corporate and commercial legal services.', 'bn' => 'কর্পোরেট ও বাণিজ্যিক আইনি সেবা।'],
            'status' => 'published',
            'sort_order' => 1,
        ]);
    }

    public function test_complete_contact_and_consultation_lifecycle_e2e(): void
    {
        // 1. Public retrieves contact configuration
        $configRes = $this->getJson('/api/v1/contact');
        $configRes->assertStatus(200)
            ->assertJsonStructure(['data' => ['office_name', 'practice_areas', 'legal_notice']]);

        // 2. Public visitor submits contact message
        $contactPayload = [
            'name' => 'TEST — Shafiul Alam',
            'phone' => '+8801711223344',
            'email' => 'shafiul@example.com',
            'subject' => 'TEST — Company formation inquiry',
            'practice_area_id' => $this->practiceArea->id,
            'message' => 'Inquiring about joint venture registration under RJSC in Bangladesh.',
            'consent' => true,
        ];

        $contactRes = $this->postJson('/api/v1/contact', $contactPayload);
        $contactRes->assertStatus(201)
            ->assertJsonPath('data.received', true);

        $messageId = $contactRes->json('data.id');
        $this->assertNotNull($messageId);

        // 3. Public visitor submits consultation request
        $consultationPayload = [
            'name' => 'TEST — Shafiul Alam',
            'phone' => '+8801711223344',
            'email' => 'shafiul@example.com',
            'subject' => 'TEST — Corporate Merger Consultation',
            'practice_area_id' => $this->practiceArea->id,
            'preferred_date' => now()->addDays(7)->format('Y-m-d'),
            'preferred_time' => 'Afternoon (2:00 PM - 5:00 PM)',
            'message' => 'Requires detailed consultation on regulatory approvals for acquisition.',
            'consent' => true,
        ];

        $consultationRes = $this->postJson('/api/v1/consultation', $consultationPayload);
        $consultationRes->assertStatus(201)
            ->assertJsonPath('data.received', true);

        $consultationId = $consultationRes->json('data.id');
        $this->assertNotNull($consultationId);

        // 4. Admin views incoming messages in inbox
        $adminMessagesRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/contacts?status=new');
        $adminMessagesRes->assertStatus(200);

        // 5. Admin opens contact message (auto-marks read)
        $detailRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/contacts/{$messageId}");
        $detailRes->assertStatus(200)
            ->assertJsonPath('data.name', 'TEST — Shafiul Alam');

        // 6. Admin updates contact message to replied with notes
        $updateMsgRes = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/admin/contacts/{$messageId}", [
                'status' => 'replied',
                'admin_notes' => 'Sent initial checklist via phone call.',
            ]);
        $updateMsgRes->assertStatus(200)
            ->assertJsonPath('data.status', 'replied');

        // Verify audit log for contact update
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'contact_updated',
        ]);

        // 7. Admin views consultation request
        $consultationDetailRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/consultations/{$consultationId}");
        $consultationDetailRes->assertStatus(200)
            ->assertJsonPath('data.preferred_time', 'Afternoon (2:00 PM - 5:00 PM)');

        // 8. Admin updates consultation status and adds private note
        $updateConsultationRes = $this->actingAs($this->adminUser, 'sanctum')
            ->patchJson("/api/v1/admin/consultations/{$consultationId}", [
                'status' => 'contacted',
                'admin_notes' => 'Chamber assistant spoke with client.',
            ]);
        $updateConsultationRes->assertStatus(200)
            ->assertJsonPath('data.status', 'contacted')
            ->assertJsonPath('data.admin_notes', 'Chamber assistant spoke with client.');

        // Verify audit log for consultation update
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'consultation_updated',
        ]);

        // 9. Admin soft-deletes both items
        $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/contacts/{$messageId}")
            ->assertStatus(200);

        $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/consultations/{$consultationId}")
            ->assertStatus(200);

        $this->assertSoftDeleted('contact_messages', ['id' => $messageId]);
        $this->assertSoftDeleted('consultation_requests', ['id' => $consultationId]);
    }
}
