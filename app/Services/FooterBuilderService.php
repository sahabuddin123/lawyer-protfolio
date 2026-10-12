<?php

namespace App\Services;

use App\Models\FooterRevision;
use App\Models\FooterTemplate;
use App\Models\Menu;
use App\Models\Page;
use App\Models\PracticeArea;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class FooterBuilderService
{
    /**
     * Allowed element types whitelist
     */
    public const ALLOWED_ELEMENT_TYPES = [
        // Structure
        'divider',
        'spacer',
        'container',
        // Branding & Content
        'site_identity',
        'heading',
        'paragraph',
        'rich_text',
        'image',
        'icon',
        'button',
        'link',
        'navigation_menu',
        'custom_link_group',
        // Social
        'social_group',
        'social_icon',
        // Chambers & Contact
        'chambers_list',
        'chamber_card',
        'phone_contact',
        'email_contact',
        'contact_group',
        // Legal & Utility
        'legal_disclaimer',
        'copyright',
        'legal_links',
        'back_to_top',
        'custom_cta_reference',
    ];

    /**
     * Retrieve the active published footer data for public consumption.
     */
    public function getActivePublishedFooter(?string $locale = null): array
    {
        $locale = $locale ?: app()->getLocale() ?: 'en';
        $cacheKey = CmsCacheService::footerKey($locale);

        return Cache::remember($cacheKey, CmsCacheService::TTL_SETTINGS, function () use ($locale) {
            $template = FooterTemplate::active()->first();

            if (!$template || empty($template->layout_data)) {
                return $this->buildResolvedFooterPayload(
                    $this->getDefaultInstitutionalLayout(),
                    'default-institutional',
                    'Default Institutional Footer',
                    $locale
                );
            }

            return $this->buildResolvedFooterPayload(
                $template->layout_data,
                $template->slug,
                $template->name,
                $locale,
                $template->id
            );
        });
    }

    /**
     * Build resolved footer payload replacing dynamic tokens (like {year})
     */
    protected function buildResolvedFooterPayload(array $layoutData, string $slug, string $name, string $locale, ?int $templateId = null): array
    {
        $year = (string) date('Y');
        $resolved = $this->resolveDynamicNodes($layoutData, $locale, $year);

        return [
            'template_id' => $templateId,
            'slug' => $slug,
            'name' => $name,
            'locale' => $locale,
            'layout' => $resolved,
        ];
    }

    /**
     * Recursively resolve dynamic tokens in layout nodes
     */
    protected function resolveDynamicNodes(mixed $node, string $locale, string $year): mixed
    {
        if (is_string($node)) {
            return str_replace(['{year}', '{YEAR}'], $year, $node);
        }

        if (is_array($node)) {
            $result = [];
            foreach ($node as $key => $val) {
                $result[$key] = $this->resolveDynamicNodes($val, $locale, $year);
            }
            return $result;
        }

        return $node;
    }

    /**
     * Validate and sanitize layout data.
     */
    public function validateAndSanitizeLayout(array $layoutData): array
    {
        if (!isset($layoutData['rows']) || !is_array($layoutData['rows'])) {
            throw new InvalidArgumentException('Layout data must contain a "rows" array.');
        }

        if (count($layoutData['rows']) > 50) {
            throw new InvalidArgumentException('Layout exceeds maximum limit of 50 rows.');
        }

        $sanitizedRows = [];
        $totalElements = 0;

        foreach ($layoutData['rows'] as $rIdx => $row) {
            if (!is_array($row)) {
                continue;
            }

            $rowId = isset($row['id']) && is_string($row['id']) ? $row['id'] : 'row_' . Str::random(8);
            $rowSettings = isset($row['settings']) && is_array($row['settings']) ? $this->sanitizeSettings($row['settings']) : [];
            $columns = isset($row['columns']) && is_array($row['columns']) ? $row['columns'] : [];

            $sanitizedColumns = [];
            foreach ($columns as $cIdx => $column) {
                if (!is_array($column)) {
                    continue;
                }

                $colId = isset($column['id']) && is_string($column['id']) ? $column['id'] : 'col_' . Str::random(8);
                $span = isset($column['span']) ? (int) $column['span'] : 12;
                $span = max(1, min(12, $span));
                $colSettings = isset($column['settings']) && is_array($column['settings']) ? $this->sanitizeSettings($column['settings']) : [];
                $elements = isset($column['elements']) && is_array($column['elements']) ? $column['elements'] : [];

                $sanitizedElements = [];
                foreach ($elements as $eIdx => $element) {
                    if (!is_array($element)) {
                        continue;
                    }

                    $totalElements++;
                    if ($totalElements > 200) {
                        throw new InvalidArgumentException('Layout exceeds maximum element limit (200).');
                    }

                    $sanitizedElements[] = $this->sanitizeElement($element);
                }

                $sanitizedColumns[] = [
                    'id' => $colId,
                    'span' => $span,
                    'settings' => $colSettings,
                    'elements' => $sanitizedElements,
                ];
            }

            $sanitizedRows[] = [
                'id' => $rowId,
                'settings' => $rowSettings,
                'columns' => $sanitizedColumns,
            ];
        }

        $rootSettings = isset($layoutData['settings']) && is_array($layoutData['settings'])
            ? $this->sanitizeSettings($layoutData['settings'])
            : [];

        return [
            'settings' => $rootSettings,
            'rows' => $sanitizedRows,
        ];
    }

    /**
     * Sanitize an individual element
     */
    protected function sanitizeElement(array $element): array
    {
        $type = isset($element['type']) ? (string) $element['type'] : 'paragraph';
        if (!in_array($type, self::ALLOWED_ELEMENT_TYPES, true)) {
            throw new InvalidArgumentException("Unsupported element type: '{$type}'.");
        }

        $id = isset($element['id']) && is_string($element['id']) ? $element['id'] : 'el_' . Str::random(8);
        $content = isset($element['content']) && is_array($element['content']) ? $element['content'] : [];
        $settings = isset($element['settings']) && is_array($element['settings']) ? $this->sanitizeSettings($element['settings']) : [];

        // Sanitize content fields recursively
        $sanitizedContent = $this->sanitizeElementContent($type, $content);

        return [
            'id' => $id,
            'type' => $type,
            'content' => $sanitizedContent,
            'settings' => $settings,
        ];
    }

    /**
     * Sanitize element content based on element type
     */
    protected function sanitizeElementContent(string $type, array $content): array
    {
        $sanitized = [];

        foreach ($content as $key => $value) {
            if ($key === 'url' || $key === 'href' || $key === 'link') {
                if (is_string($value)) {
                    if (!HtmlSanitizer::isSafeUrl($value)) {
                        $sanitized[$key] = '#';
                    } else {
                        $sanitized[$key] = $value;
                    }
                } else {
                    $sanitized[$key] = '#';
                }
            } elseif ($key === 'links' || $key === 'items' || $key === 'profiles') {
                if (is_array($value)) {
                    $sanitized[$key] = array_map(function ($item) {
                        if (!is_array($item)) return $item;
                        $cleanedItem = [];
                        foreach ($item as $k => $v) {
                            if ($k === 'url' || $k === 'href') {
                                $cleanedItem[$k] = (is_string($v) && HtmlSanitizer::isSafeUrl($v)) ? $v : '#';
                            } elseif (is_string($v)) {
                                $cleanedItem[$k] = strip_tags($v);
                            } elseif (is_array($v)) {
                                $cleanedItem[$k] = HtmlSanitizer::cleanTranslations($v);
                            } else {
                                $cleanedItem[$k] = $v;
                            }
                        }
                        return $cleanedItem;
                    }, $value);
                } else {
                    $sanitized[$key] = [];
                }
            } elseif ($key === 'text' || $key === 'title' || $key === 'label' || $key === 'heading') {
                if (is_array($value)) {
                    $sanitized[$key] = HtmlSanitizer::cleanTranslations($value);
                } elseif (is_string($value)) {
                    $sanitized[$key] = strip_tags($value);
                } else {
                    $sanitized[$key] = $value;
                }
            } elseif ($key === 'html' || $key === 'body' || $key === 'description') {
                if (is_array($value)) {
                    $sanitized[$key] = HtmlSanitizer::cleanTranslations($value);
                } elseif (is_string($value)) {
                    $sanitized[$key] = HtmlSanitizer::clean($value);
                } else {
                    $sanitized[$key] = $value;
                }
            } else {
                if (is_array($value)) {
                    $sanitized[$key] = HtmlSanitizer::cleanTranslations($value);
                } elseif (is_string($value)) {
                    $sanitized[$key] = strip_tags($value);
                } else {
                    $sanitized[$key] = $value;
                }
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize CSS and design settings
     */
    protected function sanitizeSettings(array $settings): array
    {
        $sanitized = [];
        foreach ($settings as $key => $value) {
            if (is_string($value)) {
                // Reject suspicious expression/url/import injection in styles
                $low = strtolower($value);
                if (str_contains($low, 'javascript:') || str_contains($low, 'expression(') || str_contains($low, '@import')) {
                    continue;
                }
                $sanitized[$key] = htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
            } elseif (is_bool($value) || is_numeric($value)) {
                $sanitized[$key] = $value;
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizeSettings($value);
            }
        }
        return $sanitized;
    }

    /**
     * Save draft for template
     */
    public function saveDraft(FooterTemplate $template, array $data, ?int $userId = null): FooterTemplate
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = strip_tags($data['name']);
        }

        if (isset($data['display_conditions'])) {
            $updateData['display_conditions'] = is_array($data['display_conditions']) ? $data['display_conditions'] : [];
        }

        if (isset($data['layout_data'])) {
            $updateData['layout_data'] = $this->validateAndSanitizeLayout($data['layout_data']);
        }

        $updateData['updated_by'] = $userId;

        $template->update($updateData);

        return $template->fresh();
    }

    /**
     * Publish template atomically
     */
    public function publish(FooterTemplate $template, ?string $changeSummary = null, ?int $userId = null): FooterTemplate
    {
        return DB::transaction(function () use ($template, $changeSummary, $userId) {
            // 1. Deactivate other templates if this template becomes globally active
            FooterTemplate::where('id', '!=', $template->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            // 2. Compute revision version
            $latestVersion = (int) FooterRevision::where('footer_template_id', $template->id)->max('version');
            $newVersion = $latestVersion + 1;

            // 3. Create revision record
            FooterRevision::create([
                'footer_template_id' => $template->id,
                'version' => $newVersion,
                'layout_data' => $template->layout_data,
                'change_summary' => $changeSummary ?: "Published version {$newVersion}",
                'created_by' => $userId,
                'created_at' => now(),
            ]);

            // 4. Update template status to published and active
            $template->update([
                'status' => 'published',
                'is_active' => true,
                'published_at' => now(),
                'updated_by' => $userId,
            ]);

            // 5. Invalidate CMS cache
            CmsCacheService::forgetFooter();

            return $template->fresh();
        });
    }

    /**
     * Restore a revision
     */
    public function restoreRevision(FooterTemplate $template, int $revisionId, ?int $userId = null): FooterTemplate
    {
        $revision = FooterRevision::where('footer_template_id', $template->id)
            ->where('id', $revisionId)
            ->firstOrFail();

        return DB::transaction(function () use ($template, $revision, $userId) {
            $sanitizedLayout = $this->validateAndSanitizeLayout($revision->layout_data);

            $latestVersion = (int) FooterRevision::where('footer_template_id', $template->id)->max('version');
            $newVersion = $latestVersion + 1;

            // Save restoring action as a new revision
            FooterRevision::create([
                'footer_template_id' => $template->id,
                'version' => $newVersion,
                'layout_data' => $sanitizedLayout,
                'change_summary' => "Restored from version {$revision->version}",
                'created_by' => $userId,
                'created_at' => now(),
            ]);

            $template->update([
                'layout_data' => $sanitizedLayout,
                'updated_by' => $userId,
            ]);

            if ($template->is_active) {
                CmsCacheService::forgetFooter();
            }

            return $template->fresh();
        });
    }

    /**
     * Duplicate an existing template
     */
    public function duplicate(FooterTemplate $template, ?int $userId = null): FooterTemplate
    {
        $baseSlug = $template->slug . '-copy';
        $slug = $baseSlug;
        $counter = 1;
        while (FooterTemplate::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        return FooterTemplate::create([
            'name' => $template->name . ' (Copy)',
            'slug' => $slug,
            'status' => 'draft',
            'is_active' => false,
            'display_conditions' => $template->display_conditions,
            'layout_data' => $template->layout_data,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);
    }

    /**
     * Fetch canonical CMS and site data sources for binding in the builder
     */
    public function getCanonicalDataSources(): array
    {
        // 1. Identity details
        $identity = [
            'lawyer_name' => [
                'en' => 'Advocate Nijam Uddin (Haq)',
                'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
            ],
            'designation' => [
                'en' => 'Advocate, Supreme Court of Bangladesh',
                'bn' => 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট',
            ],
            'qualifications' => [
                'en' => 'LL.B. (Honours), LL.M., University of Chittagong',
                'bn' => 'এলএল.বি. (অনার্স), এলএল.এম., চট্টগ্রাম বিশ্ববিদ্যালয়',
            ],
            'bar_council_status' => [
                'en' => 'Enrolled Advocate, Bangladesh Bar Council',
                'bn' => 'এনরোল্ড অ্যাডভোকেট, বাংলাদেশ বার কাউন্সিল',
            ],
        ];

        // 2. Canonical Chambers (Supreme Court Chamber & Chattogram Chamber strictly preserved)
        $chambers = [
            [
                'id' => 'supreme_court',
                'name' => [
                    'en' => 'Supreme Court Chamber',
                    'bn' => 'সুপ্রিম কোর্ট চেম্বার',
                ],
                'address' => [
                    'en' => 'Room 312, Supreme Court Bar Association Building, Dhaka',
                    'bn' => 'কক্ষ ৩১২, সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ভবন, ঢাকা',
                ],
                'map_url' => 'https://maps.google.com/?q=Supreme+Court+Bar+Association+Building+Dhaka',
                'is_primary' => true,
            ],
            [
                'id' => 'chattogram',
                'name' => [
                    'en' => 'Chattogram Chamber',
                    'bn' => 'চট্টগ্রাম চেম্বার',
                ],
                'address' => [
                    'en' => 'Court Hill, Kotwali, Chattogram',
                    'bn' => 'কোর্ট হিল, কোতোয়ালী, চট্টগ্রাম',
                ],
                'map_url' => 'https://maps.google.com/?q=Court+Hill+Kotwali+Chattogram',
                'is_primary' => false,
            ],
        ];

        // 3. Contact & Phone / Email from canonical settings
        $phoneSetting = SiteSetting::where('key', 'phone')->first();
        $emailSetting = SiteSetting::where('key', 'email')->first();
        $whatsappSetting = SiteSetting::where('key', 'whatsapp')->first();

        $phone = '+880 1819-000000';
        $email = 'chambers@nijamuddin.com';

        if ($phoneSetting && !empty($phoneSetting->value)) {
            $val = is_array($phoneSetting->value) ? ($phoneSetting->value['value'] ?? $phoneSetting->value['en'] ?? null) : $phoneSetting->value;
            if ($val) $phone = (string) $val;
        }

        if ($emailSetting && !empty($emailSetting->value)) {
            $val = is_array($emailSetting->value) ? ($emailSetting->value['value'] ?? $emailSetting->value['en'] ?? null) : $emailSetting->value;
            if ($val) $email = (string) $val;
        }

        // Flag suspected placeholders (e.g. 000000 or fake numbers)
        $isPhonePlaceholder = str_contains($phone, '000000') || str_contains($phone, '01700000000');
        $isEmailPlaceholder = str_contains($email, 'example.com');

        // 4. Social Media Settings
        $socialSettings = SiteSetting::where('group', 'social')->get()->keyBy('key');
        $socialProfiles = [
            [
                'platform' => 'facebook',
                'label' => 'Facebook',
                'url' => $socialSettings->get('facebook')?->value['value'] ?? 'https://facebook.com',
                'is_active' => true,
            ],
            [
                'platform' => 'linkedin',
                'label' => 'LinkedIn',
                'url' => $socialSettings->get('linkedin')?->value['value'] ?? 'https://linkedin.com',
                'is_active' => true,
            ],
            [
                'platform' => 'youtube',
                'label' => 'YouTube',
                'url' => $socialSettings->get('youtube')?->value['value'] ?? 'https://youtube.com',
                'is_active' => true,
            ],
        ];

        // 5. Navigation Menus
        $menus = Menu::with(['items' => function ($q) {
            $q->whereNull('parent_id')->orderBy('sort_order');
        }])->get(['id', 'location', 'title']);

        // 6. Published Pages
        $pages = Page::where('status', 'published')->get(['id', 'title', 'slug']);

        // 7. Practice Areas
        $practiceAreas = PracticeArea::where('status', 'published')->orderBy('sort_order')->take(10)->get(['id', 'title', 'slug']);

        return [
            'identity' => $identity,
            'chambers' => $chambers,
            'contacts' => [
                'phone' => $phone,
                'email' => $email,
                'whatsapp' => $whatsappSetting?->value['value'] ?? $phone,
                'is_phone_placeholder' => $isPhonePlaceholder,
                'is_email_placeholder' => $isEmailPlaceholder,
                'verification_notice' => $isPhonePlaceholder
                    ? 'Administrator Notice: The current phone number (+880 1819-000000) appears to be an unverified placeholder. Please verify canonical phone records in Chamber Settings.'
                    : null,
            ],
            'social_profiles' => $socialProfiles,
            'menus' => $menus,
            'pages' => $pages,
            'practice_areas' => $practiceAreas,
        ];
    }

    /**
     * Default institutional layout representing the canonical Supreme Court Chamber footer
     */
    public function getDefaultInstitutionalLayout(): array
    {
        return [
            'settings' => [
                'background_color' => '#0F172A',
                'text_color' => '#94A3B8',
                'heading_color' => '#D97706',
                'accent_color' => '#F59E0B',
                'border_top_color' => '#1E293B',
                'padding_top' => '4rem',
                'padding_bottom' => '3rem',
                'max_width' => '7xl',
            ],
            'rows' => [
                // Row 1: Main 4-column footer body
                [
                    'id' => 'row_main_grid',
                    'settings' => [
                        'margin_bottom' => '3rem',
                        'gap' => '2.5rem',
                    ],
                    'columns' => [
                        // Column 1: Identity & Credentials (Span 4)
                        [
                            'id' => 'col_identity',
                            'span' => 4,
                            'settings' => ['space_y' => '1rem'],
                            'elements' => [
                                [
                                    'id' => 'el_identity_header',
                                    'type' => 'site_identity',
                                    'content' => [
                                        'lawyer_name' => [
                                            'en' => 'Nijam Uddin (Haq)',
                                            'bn' => 'নিজাম উদ্দিন (হক)',
                                        ],
                                        'designation' => [
                                            'en' => 'Advocate, Supreme Court of Bangladesh',
                                            'bn' => 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট',
                                        ],
                                        'has_emblem' => true,
                                    ],
                                    'settings' => [],
                                ],
                                [
                                    'id' => 'el_about_excerpt',
                                    'type' => 'paragraph',
                                    'content' => [
                                        'text' => [
                                            'en' => 'Advocate Nijam Uddin (Haq) is an enrolled Advocate of the Bangladesh Bar Council and practitioner before the Supreme Court of Bangladesh, holding LL.B. (Honours) and LL.M. from the University of Chittagong.',
                                            'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক) বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট বিভাগের আইনজীবী এবং বাংলাদেশ বার কাউন্সিলের তালিকাভুক্ত সদস্য, চট্টগ্রাম বিশ্ববিদ্যালয় থেকে এলএল.বি. (অনার্স) এবং এলএল.এম. সম্পন্ন করেছেন।',
                                        ],
                                    ],
                                    'settings' => [
                                        'font_size' => 'text-xs sm:text-sm',
                                        'text_color' => '#94A3B8',
                                    ],
                                ],
                                [
                                    'id' => 'el_credentials_strip',
                                    'type' => 'custom_link_group',
                                    'content' => [
                                        'items' => [
                                            [
                                                'label' => [
                                                    'en' => 'LL.B. (Honours), LL.M., University of Chittagong',
                                                    'bn' => 'এলএল.বি. (অনার্স), এলএল.এম., চট্টগ্রাম বিশ্ববিদ্যালয়',
                                                ],
                                                'icon' => 'Award',
                                                'url' => '/about',
                                            ],
                                            [
                                                'label' => [
                                                    'en' => 'Enrolled Advocate, Bangladesh Bar Council',
                                                    'bn' => 'এনরোল্ড অ্যাডভোকেট, বাংলাদেশ বার কাউন্সিল',
                                                ],
                                                'icon' => 'ShieldCheck',
                                                'url' => '/about',
                                            ],
                                        ],
                                    ],
                                    'settings' => [],
                                ],
                            ],
                        ],
                        // Column 2: Quick Links (Span 2)
                        [
                            'id' => 'col_quick_links',
                            'span' => 2,
                            'settings' => ['space_y' => '1rem'],
                            'elements' => [
                                [
                                    'id' => 'el_ql_heading',
                                    'type' => 'heading',
                                    'content' => [
                                        'text' => [
                                            'en' => 'QUICK LINKS',
                                            'bn' => 'দ্রুত লিঙ্কসমূহ',
                                        ],
                                    ],
                                    'settings' => [
                                        'font_size' => 'text-xs',
                                        'font_weight' => 'font-semibold',
                                        'letter_spacing' => 'tracking-widest',
                                        'text_transform' => 'uppercase',
                                        'color' => '#D97706',
                                    ],
                                ],
                                [
                                    'id' => 'el_ql_menu',
                                    'type' => 'custom_link_group',
                                    'content' => [
                                        'items' => [
                                            ['label' => ['en' => 'Home', 'bn' => 'হোম'], 'url' => '/'],
                                            ['label' => ['en' => 'About', 'bn' => 'পরিচিতি'], 'url' => '/about'],
                                            ['label' => ['en' => 'Courtroom', 'bn' => 'মামলা পরিচালনা'], 'url' => '/courtroom'],
                                            ['label' => ['en' => 'Judgments', 'bn' => 'রায় ও নজির'], 'url' => '/judgments'],
                                            ['label' => ['en' => 'Research', 'bn' => 'গবেষণা'], 'url' => '/research'],
                                            ['label' => ['en' => 'Publications', 'bn' => 'প্রকাশনা'], 'url' => '/publications'],
                                            ['label' => ['en' => 'Contact', 'bn' => 'যোগাযোগ'], 'url' => '/contact'],
                                        ],
                                    ],
                                    'settings' => [],
                                ],
                            ],
                        ],
                        // Column 3: Legal Practices (Span 3)
                        [
                            'id' => 'col_practices',
                            'span' => 3,
                            'settings' => ['space_y' => '1rem'],
                            'elements' => [
                                [
                                    'id' => 'el_prac_heading',
                                    'type' => 'heading',
                                    'content' => [
                                        'text' => [
                                            'en' => 'CORE PRACTICES',
                                            'bn' => 'প্রধান কর্মক্ষেত্র',
                                        ],
                                    ],
                                    'settings' => [
                                        'font_size' => 'text-xs',
                                        'font_weight' => 'font-semibold',
                                        'letter_spacing' => 'tracking-widest',
                                        'text_transform' => 'uppercase',
                                        'color' => '#D97706',
                                    ],
                                ],
                                [
                                    'id' => 'el_prac_links',
                                    'type' => 'custom_link_group',
                                    'content' => [
                                        'items' => [
                                            [
                                                'label' => [
                                                    'en' => 'Constitutional & Writ Petitions',
                                                    'bn' => 'সাংবিধানিক ও রিট মামলা',
                                                ],
                                                'url' => '/practice-areas',
                                            ],
                                            [
                                                'label' => [
                                                    'en' => 'Civil & Commercial Litigation',
                                                    'bn' => 'দেওয়ানি ও বাণিজ্যিক মোকদ্দমা',
                                                ],
                                                'url' => '/practice-areas',
                                            ],
                                            [
                                                'label' => [
                                                    'en' => 'Corporate & Commercial Advisory',
                                                    'bn' => 'কোম্পানি ও কর্পোরেট পরামর্শ',
                                                ],
                                                'url' => '/practice-areas',
                                            ],
                                            [
                                                'label' => [
                                                    'en' => 'Supreme Court Appellate Review',
                                                    'bn' => 'সুপ্রিম কোর্ট আপিল ও রিভিশন',
                                                ],
                                                'url' => '/practice-areas',
                                            ],
                                            [
                                                'label' => [
                                                    'en' => 'Banking & Financial Securities',
                                                    'bn' => 'ব্যাংকিং ও অর্থঋণ আইন',
                                                ],
                                                'url' => '/practice-areas',
                                            ],
                                        ],
                                    ],
                                    'settings' => [],
                                ],
                            ],
                        ],
                        // Column 4: Chambers & Contact (Span 3)
                        [
                            'id' => 'col_chambers',
                            'span' => 3,
                            'settings' => ['space_y' => '1rem'],
                            'elements' => [
                                [
                                    'id' => 'el_cham_heading',
                                    'type' => 'heading',
                                    'content' => [
                                        'text' => [
                                            'en' => 'CHAMBERS & CONTACT',
                                            'bn' => 'চেম্বার ও যোগাযোগ',
                                        ],
                                    ],
                                    'settings' => [
                                        'font_size' => 'text-xs',
                                        'font_weight' => 'font-semibold',
                                        'letter_spacing' => 'tracking-widest',
                                        'text_transform' => 'uppercase',
                                        'color' => '#D97706',
                                    ],
                                ],
                                [
                                    'id' => 'el_chambers_block',
                                    'type' => 'chambers_list',
                                    'content' => [
                                        'chambers' => [
                                            [
                                                'id' => 'supreme_court',
                                                'name' => [
                                                    'en' => 'Supreme Court Chamber',
                                                    'bn' => 'সুপ্রিম কোর্ট চেম্বার',
                                                ],
                                                'address' => [
                                                    'en' => 'Room 312, Supreme Court Bar Association Building, Dhaka',
                                                    'bn' => 'কক্ষ ৩১২, সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ভবন, ঢাকা',
                                                ],
                                                'map_url' => 'https://maps.google.com/?q=Supreme+Court+Bar+Association+Building+Dhaka',
                                            ],
                                            [
                                                'id' => 'chattogram',
                                                'name' => [
                                                    'en' => 'Chattogram Chamber',
                                                    'bn' => 'চট্টগ্রাম চেম্বার',
                                                ],
                                                'address' => [
                                                    'en' => 'Court Hill, Kotwali, Chattogram',
                                                    'bn' => 'কোর্ট হিল, কোতোয়ালী, চট্টগ্রাম',
                                                ],
                                                'map_url' => 'https://maps.google.com/?q=Court+Hill+Kotwali+Chattogram',
                                            ],
                                        ],
                                    ],
                                    'settings' => [],
                                ],
                                [
                                    'id' => 'el_contacts_strip',
                                    'type' => 'contact_group',
                                    'content' => [
                                        'phone' => '+880 1819-000000',
                                        'email' => 'chambers@nijamuddin.com',
                                        'is_phone_placeholder' => true,
                                    ],
                                    'settings' => [],
                                ],
                            ],
                        ],
                    ],
                ],
                // Row 2: Divider Row
                [
                    'id' => 'row_divider',
                    'settings' => ['margin_bottom' => '1.5rem'],
                    'columns' => [
                        [
                            'id' => 'col_div',
                            'span' => 12,
                            'settings' => [],
                            'elements' => [
                                [
                                    'id' => 'el_gold_divider',
                                    'type' => 'divider',
                                    'content' => ['with_emblem' => true],
                                    'settings' => ['color' => 'rgba(217,119,6,0.3)'],
                                ],
                            ],
                        ],
                    ],
                ],
                // Row 3: Legal Disclaimer & Bottom Strip
                [
                    'id' => 'row_bottom_strip',
                    'settings' => ['space_y' => '1rem'],
                    'columns' => [
                        [
                            'id' => 'col_bottom',
                            'span' => 12,
                            'settings' => [],
                            'elements' => [
                                [
                                    'id' => 'el_disclaimer',
                                    'type' => 'legal_disclaimer',
                                    'content' => [
                                        'text' => [
                                            'en' => 'Legal Disclaimer: The materials provided on this platform are for general informational purposes only and do not constitute formal legal counsel. Prior results do not guarantee a similar outcome.',
                                            'bn' => 'আইনি অস্বীকৃতি: এই প্ল্যাটফর্মে প্রদত্ত তথ্য শুধুমাত্র সাধারণ তথ্যের উদ্দেশ্যে এবং এটি কোনো আনুষ্ঠানিক আইনি পরামর্শ নয়। পূর্ববর্তী ফলাফল ভবিষ্যতে একই ফলাফলের নিশ্চয়তা দেয় না।',
                                        ],
                                    ],
                                    'settings' => [
                                        'font_size' => 'text-[11px]',
                                        'color' => '#64748B',
                                    ],
                                ],
                                [
                                    'id' => 'el_bottom_bar',
                                    'type' => 'legal_links',
                                    'content' => [
                                        'copyright_prefix' => [
                                            'en' => '© {year} Advocate Nijam Uddin (Haq). All rights reserved.',
                                            'bn' => '© {year} অ্যাডভোকেট নিজাম উদ্দিন (হক)। সর্বস্বত্ব সংরক্ষিত।',
                                        ],
                                        'links' => [
                                            [
                                                'label' => ['en' => 'Privacy Policy', 'bn' => 'গোপনীয়তা নীতি'],
                                                'url' => '#privacy',
                                            ],
                                            [
                                                'label' => ['en' => 'Terms of Engagement', 'bn' => 'শর্তাবলী ও নিয়মাবলী'],
                                                'url' => '#terms',
                                            ],
                                        ],
                                    ],
                                    'settings' => [],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
