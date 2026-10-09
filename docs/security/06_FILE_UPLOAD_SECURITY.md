# File Upload Security Architecture & Implementation

## 1. Executive Summary
File uploads in legal and judicial management platforms represent a critical attack surface. A malicious upload can lead to Remote Code Execution (RCE), Stored Cross-Site Scripting (XSS), Local File Inclusion (LFI), Server-Side Request Forgery (SSRF), directory traversal, or denial of service through decompression bombs.

In Phase 18, the file upload system in `MediaService.php` was subjected to rigorous penetration testing and fortified with an immutable **Defense-in-Depth** pipeline.

---

## 2. Threat Vectors & Defense Architecture

### 2.1 Threat Vector Matrix

| Threat Vector | Attack Scenario | Implemented Mitigation | Verification |
| :--- | :--- | :--- | :--- |
| **Server-Side Execution (RCE)** | Uploading `.php`, `.phtml`, `.phar`, `.sh`, `.exe`, `.py` | 24-extension strict blacklist + MIME type validation + Randomized UUID naming | Rejected with 422 `INVALID_FILE_TYPE` |
| **Double Extension Bypass** | `payload.php.jpg` or `shell.phtml.png` to trick web servers | Multi-segment extension inspection: `preg_match('/\.(php[0-9]?\|phtml\|phar\|cgi\|pl\|py\|sh\|exe\|bat\|cmd\|com\|dll\|js)\./i', ...)` | Rejected with 422 `POTENTIAL_DOUBLE_EXTENSION` |
| **Path / Directory Traversal** | Filename like `../../etc/passwd` or `..\..\..\windows\win.ini` | Basename sanitization + explicit path traversal pattern matching (`..`, `/`, `\`) | Rejected with 422 `INVALID_FILENAME` |
| **MIME / Content-Type Spoofing** | Attacker sets HTTP header `Content-Type: image/jpeg` for PHP payload | Server-side `finfo_file` magic-byte inspection against allowed MIME list | Rejected if binary bytes do not match declared MIME |
| **Stored XSS via SVG** | SVG containing `<script>alert(1)</script>` or XML entity expansion | Complete SVG upload prohibition for general media | Rejected with 422 `SVG_NOT_ALLOWED` |
| **Decompression Bomb (Pixel Flood)** | 100KB JPEG that decompresses into an oversized bitmap in GD | Dimension bounds checking: `MAX_IMAGE_WIDTH = 2500`, `MAX_IMAGE_HEIGHT = 2500` | Rejected with 422 `IMAGE_DIMENSIONS_EXCEED_MAXIMUM` |
| **Header Injection on Download** | Filename with CRLF `\r\nSet-Cookie: evil=1` or quote breakout | Filename stripped of control characters, spaces replaced, quotes escaped | Safe ASCII disposition header |

---

## 3. Implementation Details (`MediaService.php`)

### 3.1 Prohibited Extensions
The file upload service strictly forbids all executable, script, and system extensions:
```php
private const DANGEROUS_EXTENSIONS = [
    'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
    'cgi', 'pl', 'py', 'sh', 'bash', 'exe', 'bat', 'cmd', 'com',
    'dll', 'bin', 'vbs', 'js', 'jar', 'app', 'msi'
];
```

### 3.2 Multi-Segment & Double Extension Detection
Attackers commonly exploit Apache/Nginx configuration oversights where `.php.jpg` might be executed by PHP-FPM if the handler matches regex inappropriately:
```php
if (preg_match('/\.(php[0-9]?|phtml|phar|cgi|pl|py|sh|exe|bat|cmd|com|dll|js)\./i', $originalName)) {
    throw new \InvalidArgumentException('Files with executable secondary extensions are strictly prohibited.');
}
```

### 3.3 Server-Side Magic Byte Verification
PHP's native `finfo` engine is utilized directly on the temporary uploaded file on disk:
```php
$finfo = new \finfo(FILEINFO_MIME_TYPE);
$detectedMime = $finfo->file($file->getPathname());

$allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

if (!in_array($detectedMime, $allowedMimes, true)) {
    throw new \InvalidArgumentException("Invalid or disallowed MIME type detected: {$detectedMime}");
}
```

### 3.4 Image Dimension & Memory Bomb Protection
For raster images, dimensions are inspected prior to processing or permanent storage:
```php
if (str_starts_with($detectedMime, 'image/')) {
    [$width, $height] = @getimagesize($file->getPathname());
    if ($width > 2500 || $height > 2500) {
        throw new \InvalidArgumentException('Image dimensions exceed the maximum allowed limits of 2500x2500 pixels.');
    }
}
```

---

## 4. Storage Architecture & Isolation
- **Storage Path Randomization:** Files are stored under UUID-based directories:
  `/uploads/{year}/{month}/{uuid}.{sanitized_ext}`
- **Web Execution Prevention:** The upload directory contains an `.htaccess` configuration preventing script execution:
  ```apache
  <FilesMatch "(?i)\.(php|phtml|phar|pl|py|cgi)$">
      Order Deny,Allow
      Deny from all
  </FilesMatch>
  ```
- **Direct Access Isolation:** Sensitive documents (e.g. courtroom confidential evidence, internal drafts) are stored on the `secure_docs` disk outside the public `storage/app/public` symlink.

---

## 5. Verification & Test Evidence
Validated by automated test suite `backend/tests/Feature/Security/FileUploadAndMediaSecurityTest.php`:
1. `it_blocks_direct_executable_file_uploads` -> PASS
2. `it_blocks_double_extension_file_uploads` -> PASS
3. `it_blocks_path_traversal_in_file_uploads` -> PASS
4. `it_blocks_svg_uploads_due_to_xss_risk` -> PASS
5. `it_blocks_decompression_bombs_with_oversized_pixel_dimensions` -> PASS
6. `it_generates_randomized_uuid_storage_names_and_safe_extension` -> PASS
