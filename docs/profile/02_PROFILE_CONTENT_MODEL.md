# 02 — Profile Content Model & Verification Standard

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 6: Profile & About Module

---

## 1. Strict Source of Truth & Legal Ethics

As a legal authority platform representing a Supreme Court Advocate, all professional content is subject to strict ethical and statutory constraints.

### 1.1 Prohibited Fabrications
The engineering team strictly enforces the rule that no facts may be guessed or generated:
- **No fabricated enrollment numbers or admission dates**: Left `NULL` until certified paperwork is uploaded.
- **No unapproved court hierarchy expansions**: The approved title is strictly **"Advocate, Supreme Court of Bangladesh"**. Terms such as "Senior Advocate", "Appellate Division", or "Senior Counsel" are excluded until confirmed by the Project Director.
- **No unverified metrics**: No claims of "20+ years of practice", "500+ successful cases", "99% success rate", or "1000+ clients".
- **No fabricated bar associations**: Memberships (such as SCBA or District Bar) are not seeded or assumed; they remain in draft until administrative entry.

---

## 2. Approved Baseline Facts

The system baseline seeds and accepts only the following verified facts:

| Field | Approved Value (EN) | Approved Value (BN) |
| :--- | :--- | :--- |
| **Full Name** | Nijam Uddin (Haq) | নিজাম উদ্দিন (হক) |
| **Professional Title** | Advocate, Supreme Court of Bangladesh | অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট |
| **Bar Council Status** | Enrolled / Certified with Bangladesh Bar Council | বাংলাদেশ বার কাউন্সিল প্রত্যয়িত আইনজীবী |
| **Postgraduate Degree**| Master of Laws (LL.M.), University of Chittagong | মাস্টার অব লজ (এলএল.এম.), চট্টগ্রাম বিশ্ববিদ্যালয় |
| **Undergraduate Degree**| Bachelor of Laws (LL.B. Honours), University of Chittagong | ব্যাচেলর অব লজ (এলএল.বি. অনার্স), চট্টগ্রাম বিশ্ববিদ্যালয় |

---

## 3. Database Schema Details

### 3.1 `profiles`
```sql
CREATE TABLE `profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` json NOT NULL,
  `title` json NOT NULL,
  `subtitle` json DEFAULT NULL,
  `short_bio` json NOT NULL,
  `long_bio` json NOT NULL,
  `status` enum('draft','published','hidden') NOT NULL DEFAULT 'published',
  `profile_photo_id` bigint unsigned DEFAULT NULL,
  `court_robes_photo_id` bigint unsigned DEFAULT NULL,
  `signature_photo_id` bigint unsigned DEFAULT NULL,
  `bar_council_enrollment` varchar(255) DEFAULT NULL,
  `high_court_enrollment` varchar(255) DEFAULT NULL,
  `appellate_division_enrollment` varchar(255) DEFAULT NULL,
  `chambers_address` json NOT NULL,
  `office_address` json NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `philosophy` json DEFAULT NULL,
  `legal_approach` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profiles_status_index` (`status`),
  CONSTRAINT `profiles_profile_photo_id_foreign` FOREIGN KEY (`profile_photo_id`) REFERENCES `media` (`id`) ON DELETE SET NULL,
  CONSTRAINT `profiles_court_robes_photo_id_foreign` FOREIGN KEY (`court_robes_photo_id`) REFERENCES `media` (`id`) ON DELETE SET NULL,
  CONSTRAINT `profiles_signature_photo_id_foreign` FOREIGN KEY (`signature_photo_id`) REFERENCES `media` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 `credentials`
```sql
CREATE TABLE `credentials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` enum('academic','professional','court','certification') NOT NULL DEFAULT 'professional',
  `title` json NOT NULL,
  `institution` json NOT NULL,
  `description` json DEFAULT NULL,
  `year` varchar(50) DEFAULT NULL,
  `credential_id` varchar(100) DEFAULT NULL,
  `certificate_media_id` bigint unsigned DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `credentials_is_active_sort_order_index` (`is_active`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 `educations`
```sql
CREATE TABLE `educations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `degree` json NOT NULL,
  `institution` json NOT NULL,
  `department` json DEFAULT NULL,
  `description` json DEFAULT NULL,
  `year_completed` varchar(20) DEFAULT NULL,
  `distinction` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `educations_is_active_sort_order_index` (`is_active`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.4 `career_timelines`
```sql
CREATE TABLE `career_timelines` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `period` varchar(100) NOT NULL,
  `title` json NOT NULL,
  `organization` json NOT NULL,
  `description` json DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `career_timelines_is_active_sort_order_index` (`is_active`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.5 `professional_memberships`
```sql
CREATE TABLE `professional_memberships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization` json NOT NULL,
  `role` json NOT NULL,
  `description` json DEFAULT NULL,
  `membership_number` varchar(100) DEFAULT NULL,
  `year_joined` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `professional_memberships_is_active_sort_order_index` (`is_active`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
