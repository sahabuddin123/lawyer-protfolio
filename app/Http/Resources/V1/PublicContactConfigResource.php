<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class PublicContactConfigResource extends BaseApiResource
{
    public function toArray(Request $request): array
    {
        return [
            'office_name' => $this->resource['office_name'] ?? null,
            'chamber_name' => $this->resource['chamber_name'] ?? null,
            'address' => $this->resource['address'] ?? null,
            'city' => $this->resource['city'] ?? null,
            'country' => $this->resource['country'] ?? null,
            'phone' => $this->resource['phone'] ?? null,
            'email' => $this->resource['email'] ?? null,
            'whatsapp' => $this->resource['whatsapp'] ?? null,
            'office_hours' => $this->resource['office_hours'] ?? null,
            'map_url' => $this->resource['map_url'] ?? null,
            'map_embed_url' => $this->resource['map_embed_url'] ?? null,
            'social_links' => $this->resource['social_links'] ?? [],
            'practice_areas' => $this->resource['practice_areas'] ?? [],
            'legal_notice' => [
                'en' => 'Submitting a message or consultation request through this platform does not create an advocate-client relationship. Do not submit sensitive financial information, banking details, or confidential passwords.',
                'bn' => 'এই প্ল্যাটফর্মের মাধ্যমে বার্তা বা পরামর্শ অনুরোধ পাঠানো কোনো আইনজীবী-মক্কেল সম্পর্ক তৈরি করে না। অনুগ্রহ করে সংবেদনশীল আর্থিক তথ্য, ব্যাংক বিবরণ বা গোপন পাসওয়ার্ড পাঠাবেন না।'
            ],
        ];
    }
}
