# 06. Video Platform Handling & URL Parsing

**Module:** Videos & Broadcast Archive (Phase 13)  
**Lead Coordinator:** API Architect & Senior Security Engineer  
**Component:** `App\Services\VideoPlatformService`

---

## 1. Overview

The platform allows administrators to input video links from diverse sources (YouTube watch URLs, YouTube Shorts, YouTube Embeds, YouTu.be shortlinks, Vimeo links, and direct external streaming links). 

Rather than relying on unvalidated manual inputs, `VideoPlatformService` automates:
1. Protocol verification (HTTP/HTTPS only).
2. Host security checks (blocking `localhost`, private IPv4/IPv6 ranges, and non-routable hostnames).
3. Deterministic platform identification (`youtube`, `vimeo`, `external`).
4. Canonical video ID extraction.
5. Canonical watch URL normalization.
6. Privacy-conscious embed URL generation.

---

## 2. Platform Detection & Extraction Matrix

| Platform | Supported URL Patterns | Canonical Video ID Extraction | Generated Embed URL | Canonical Watch URL |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube** | `https://www.youtube.com/watch?v={ID}`<br>`https://youtube.com/watch?v={ID}&t=30s`<br>`https://youtu.be/{ID}`<br>`https://www.youtube.com/embed/{ID}`<br>`https://www.youtube.com/shorts/{ID}` | `^[a-zA-Z0-9_-]{11}$` | `https://www.youtube-nocookie.com/embed/{ID}` | `https://www.youtube.com/watch?v={ID}` |
| **Vimeo** | `https://vimeo.com/{ID}`<br>`https://player.vimeo.com/video/{ID}`<br>`https://vimeo.com/channels/staffpicks/{ID}`<br>`https://vimeo.com/groups/motion/videos/{ID}` | `^[0-9]{6,12}$` | `https://player.vimeo.com/video/{ID}` | `https://vimeo.com/{ID}` |
| **External** | Any valid HTTPS/HTTP link (e.g. `https://legal-broadcast.tv/feed/session1`) | `null` (or custom ID) | `null` (embedded iframe disallowed by default) | Untouched input URL |

---

## 3. Regular Expression Specifications

### 3.1 YouTube Regular Expression
```php
public const YOUTUBE_REGEX = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i';
```
- Matches standard query parameters `?v=...`, path-based `/embed/...`, `/v/...`, `/shorts/...`, and shortlinks `youtu.be/...`.
- Matches exact 11-character base64-style YouTube alphanumeric identifiers (`[a-zA-Z0-9_-]{11}`).

### 3.2 Vimeo Regular Expression
```php
public const VIMEO_REGEX = '/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i';
```
- Extracts numeric video IDs across all standard and grouped Vimeo URL structures.

---

## 4. Normalization Pipeline

When an administrator inputs a URL in `VideoRequest`:
1. `validateUrlSecurity($url)` verifies scheme is `http` or `https`, ensures domain resolves and is not in private/reserved network blocks (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`).
2. `parse($url)` inspects the host and path:
   - If YouTube pattern matches: platform is set to `youtube`, video ID is extracted, `embed_url` is forged using `youtube-nocookie.com`, and clean canonical watch URL is built.
   - If Vimeo pattern matches: platform is set to `vimeo`, video ID is extracted, `player.vimeo.com` embed URL is forged, and canonical watch URL is built.
   - If external: platform is set to `external`, video ID is `null`, embed URL is `null`, and raw URL is preserved.
3. Form Request injects normalized `platform` and `video_id` into the validated request data before persisting to the database.
