<?php

namespace Tests\Feature\Contact;

use App\Models\ContactMessage;
use App\Models\ConsultationRequest;
use App\Models\PracticeArea;
use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicContactTest extends TestCase
{
    use DatabaseTransactions;

    protected PracticeArea $practiceArea;

    protected function setUp(): void
    {
        parent::setUp();

        CmsCacheService::forgetContactConfig();

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'slug' => 'test-constitutional-law-' . uniqid(),
            'short_description' => ['en' => 'Constitutional litigation.', 'bn' => 'সাংবিধানিক মামলা।'],
            'full_description' => ['en' => 'Full details on constitutional litigation.', 'bn' => 'পূর্ণ বিবরণ।'],
            'status' => 'published',
            'sort_order' => 1,
        ]);

        SiteSetting::setValue('contact_phone', '+8801819000000', 'contact', true);
        SiteSetting::setValue('contact_email', 'chamber@example.com', 'contact', true);
        SiteSetting::setValue('contact_chamber_name', 'TEST — Supreme Court Chamber', 'contact', true);
    }

    public function test_public_can_retrieve_contact_configuration(): void
    {
        $response = $this->getJson('/api/v1/contact');

        $response->assertStatus(200)
            ->assertJsonPath('data.phone', '+8801819000000')
            ->assertJsonPath('data.email', 'chamber@example.com')
            ->assertJsonPath('data.chamber_name', 'TEST — Supreme Court Chamber')
            ->assertJsonStructure([
                'data' => [
                    'office_name',
                    'chamber_name',
                    'phone',
                    'email',
                    'practice_areas',
                    'legal_notice',
                ],
            ]);
    }

    public function test_public_can_submit_contact_message(): void
    {
        $payload = [
            'name' => 'TEST — Rahim Ahmed',
            'phone' => '+8801712345678',
            'email' => 'rahim@example.com',
            'subject' => 'TEST — Inquiry regarding land title dispute',
            'practice_area_id' => $this->practiceArea->id,
            'message' => 'Seeking an initial legal inquiry concerning property documentation in Chittagong.',
            'consent' => true,
        ];

        $response = $this->postJson('/api/v1/contact', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.received', true);

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'TEST — Rahim Ahmed',
            'phone' => '+8801712345678',
            'status' => 'new',
            'consent_given' => 1,
        ]);
    }

    public function test_contact_submission_requires_mandatory_fields(): void
    {
        $response = $this->postJson('/api/v1/contact', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone', 'subject', 'message', 'consent']);
    }

    public function test_contact_submission_honeypot_drops_spam_silently(): void
    {
        $payload = [
            'name' => 'SPAMBOT 3000',
            'phone' => '+1234567890',
            'subject' => 'Cheap pharmaceuticals',
            'message' => 'Visit spam link immediately for special discount!',
            'consent' => true,
            '_honeypot' => 'I am an automated spam bot',
        ];

        $initialCount = ContactMessage::count();

        $response = $this->postJson('/api/v1/contact', $payload);

        // Honeypot returns simulated success response
        $response->assertStatus(200);

        // Verifies zero record insertion
        $this->assertSame($initialCount, ContactMessage::count());
    }

    public function test_contact_submission_sanitizes_xss_inputs(): void
    {
        $payload = [
            'name' => '<script>alert("XSS")</script>John Doe',
            'phone' => '+8801700000000',
            'subject' => '<b>Urgent Help</b>',
            'message' => '<img src=x onerror=alert(1)>This is a legitimate legal inquiry text.',
            'consent' => true,
        ];

        $response = $this->postJson('/api/v1/contact', $payload);
        $response->assertStatus(201);

        $record = ContactMessage::where('phone', '+8801700000000')->latest()->first();
        $this->assertNotNull($record);
        $this->assertStringNotContainsString('<script>', $record->name);
        $this->assertStringNotContainsString('<b>', $record->subject);
        $this->assertStringNotContainsString('<img', $record->message);
    }

    public function test_public_can_submit_consultation_request(): void
    {
        $payload = [
            'name' => 'TEST — Advocate Tanvir',
            'phone' => '+8801999999999',
            'email' => 'tanvir@example.com',
            'subject' => 'TEST — High Court Division Writ Consultation',
            'practice_area_id' => $this->practiceArea->id,
            'preferred_date' => now()->addDays(5)->format('Y-m-d'),
            'preferred_time' => 'Morning (10:00 AM - 1:00 PM)',
            'message' => 'Requesting appointment discussion regarding a fundamental rights writ petition under Article 102.',
            'consent' => true,
        ];

        $response = $this->postJson('/api/v1/consultation', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.received', true);

        $this->assertDatabaseHas('consultation_requests', [
            'name' => 'TEST — Advocate Tanvir',
            'phone' => '+8801999999999',
            'status' => 'new',
            'preferred_time' => 'Morning (10:00 AM - 1:00 PM)',
            'consent_given' => 1,
        ]);
    }

    public function test_consultation_submission_requires_mandatory_fields(): void
    {
        $response = $this->postJson('/api/v1/consultation', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone', 'subject', 'message', 'consent']);
    }

    public function test_consultation_submission_validates_preferred_date(): void
    {
        $payload = [
            'name' => 'TEST — User',
            'phone' => '+8801999999999',
            'subject' => 'TEST — Consultation',
            'preferred_date' => '2020-01-01', // Past date
            'message' => 'Detailed message of sufficient length for validation requirements.',
            'consent' => true,
        ];

        $response = $this->postJson('/api/v1/consultation', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['preferred_date']);
    }

    public function test_consultation_submission_honeypot_drops_spam_silently(): void
    {
        $payload = [
            'name' => 'SPAMBOT CONSULTANT',
            'phone' => '+1234567890',
            'subject' => 'Buy backlinks now',
            'message' => 'Automated spam payload designed to clutter consultations.',
            'consent' => true,
            '_honeypot' => 'bot-honeypot-value',
        ];

        $initialCount = ConsultationRequest::count();

        $response = $this->postJson('/api/v1/consultation', $payload);

        $response->assertStatus(200);
        $this->assertSame($initialCount, ConsultationRequest::count());
    }
}
