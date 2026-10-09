<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class ProfileResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'name' => $isAdmin ? $this->name : $this->resolveTranslation($this->name),
            'title' => $isAdmin ? $this->title : $this->resolveTranslation($this->title),
            'subtitle' => $isAdmin ? $this->subtitle : $this->resolveTranslation($this->subtitle),
            'short_bio' => $isAdmin ? $this->short_bio : $this->resolveTranslation($this->short_bio),
            'long_bio' => $isAdmin ? $this->long_bio : $this->resolveTranslation($this->long_bio),
            'status' => $this->status,
            'bar_council_enrollment' => $this->bar_council_enrollment,
            'high_court_enrollment' => $this->high_court_enrollment,
            'appellate_division_enrollment' => $this->appellate_division_enrollment,
            'chambers_address' => $isAdmin ? $this->chambers_address : $this->resolveTranslation($this->chambers_address),
            'office_address' => $isAdmin ? $this->office_address : $this->resolveTranslation($this->office_address),
            'phone' => $this->phone,
            'email' => $this->email,
            'whatsapp' => $this->whatsapp,
            'philosophy' => $isAdmin ? $this->philosophy : $this->resolveTranslation($this->philosophy),
            'legal_approach' => $isAdmin ? $this->legal_approach : $this->resolveTranslation($this->legal_approach),
            'profile_photo' => $this->whenLoaded('profilePhoto', fn () => new MediaResource($this->profilePhoto)),
            'court_robes_photo' => $this->whenLoaded('courtRobesPhoto', fn () => new MediaResource($this->courtRobesPhoto)),
            'signature_photo' => $this->whenLoaded('signaturePhoto', fn () => new MediaResource($this->signaturePhoto)),
            'seo' => $this->whenLoaded('seo', fn () => new SeoMetaResource($this->seo)),
            'credentials' => $this->whenLoaded('credentials', fn () => CredentialResource::collection($this->credentials)),
            'educations' => $this->whenLoaded('educations', fn () => EducationResource::collection($this->educations)),
            'timeline' => $this->whenLoaded('timeline', fn () => CareerTimelineResource::collection($this->timeline)),
            'memberships' => $this->whenLoaded('memberships', fn () => ProfessionalMembershipResource::collection($this->memberships)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
