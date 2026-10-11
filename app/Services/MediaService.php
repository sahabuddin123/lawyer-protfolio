<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService extends BaseService
{
    /**
     * Allowed MIME types and max sizes.
     */
    protected const ALLOWED_IMAGE_MIMES = [
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png'  => ['png'],
        'image/webp' => ['webp'],
        'image/avif' => ['avif'],
    ];

    protected const ALLOWED_DOC_MIMES = [
        'application/pdf' => ['pdf'],
    ];

    protected const DANGEROUS_EXTENSIONS = [
        'php', 'php3', 'php4', 'php5', 'phtml', 'phar',
        'cgi', 'pl', 'py', 'sh', 'bash', 'exe', 'bat',
        'cmd', 'com', 'dll', 'vbs', 'msi', 'js', 'jsp',
        'asp', 'aspx', 'htm', 'html', 'shtml', 'svg'
    ];

    protected const MAX_IMAGE_WIDTH = 2500;
    protected const MAX_IMAGE_HEIGHT = 2500;
    protected const MAX_IMAGE_SIZE_BYTES = 10485760; // 10MB
    protected const MAX_DOC_SIZE_BYTES = 20971520; // 20MB

    /**
     * Upload an asset and register it in the media registry.
     *
     * @throws \InvalidArgumentException
     */
    public function uploadFile(
        UploadedFile $file,
        string $disk = 'public',
        ?string $directory = null,
        ?array $altText = null,
        ?array $caption = null,
        ?int $uploadedBy = null
    ): Media {
        $rawOriginalName = $file->getClientOriginalName();

        // 1. Path traversal & null byte rejection
        if (str_contains($rawOriginalName, '..') || str_contains($rawOriginalName, '/') || str_contains($rawOriginalName, '\\') || str_contains($rawOriginalName, "\0")) {
            throw new \InvalidArgumentException('Path traversal sequence or null byte detected in filename.');
        }

        // 2. Double extension rejection (e.g., shell.php.jpg)
        $nameParts = explode('.', strtolower($rawOriginalName));
        if (count($nameParts) > 2) {
            foreach (array_slice($nameParts, 0, -1) as $part) {
                if (in_array($part, self::DANGEROUS_EXTENSIONS, true)) {
                    throw new \InvalidArgumentException('Embedded executable extensions are strictly forbidden.');
                }
            }
        }

        // 3. Executable & script extension rejection
        $extension = strtolower($file->getClientOriginalExtension());
        if (in_array($extension, self::DANGEROUS_EXTENSIONS, true)) {
            throw new \InvalidArgumentException('Executable files and active scripts are strictly prohibited.');
        }

        // 4. Server-side MIME verification using file signature (magic bytes)
        $realPath = $file->getRealPath();
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo ? finfo_file($finfo, $realPath) : $file->getMimeType();
        if ($finfo) {
            finfo_close($finfo);
        }

        $isImage = array_key_exists($detectedMime, self::ALLOWED_IMAGE_MIMES);
        $isDoc = array_key_exists($detectedMime, self::ALLOWED_DOC_MIMES);

        if (!$isImage && !$isDoc) {
            throw new \InvalidArgumentException("Disallowed MIME type: {$detectedMime}. Only JPEG, PNG, WebP, AVIF, and PDF are permitted.");
        }

        // 5. Verify declared extension matches detected MIME signature
        $allowedExts = $isImage ? self::ALLOWED_IMAGE_MIMES[$detectedMime] : self::ALLOWED_DOC_MIMES[$detectedMime];
        if (!in_array($extension, $allowedExts, true)) {
            throw new \InvalidArgumentException("Extension .{$extension} does not match detected file signature ({$detectedMime}).");
        }

        $sizeBytes = $file->getSize();
        $maxSize = $isImage ? self::MAX_IMAGE_SIZE_BYTES : self::MAX_DOC_SIZE_BYTES;
        if ($sizeBytes > $maxSize) {
            throw new \InvalidArgumentException("File size exceeds maximum permitted limit ({$maxSize} bytes).");
        }

        $uuid = (string) Str::uuid();

        // Determine target directory structure per architecture spec
        if ($directory === null) {
            if ($disk === 'secure') {
                $directory = 'case_documents';
            } elseif ($isImage) {
                $directory = 'media/' . date('Y/m');
            } else {
                $directory = 'media/documents';
            }
        }

        // Use random UUID filename on disk (never trust client filename for storage)
        $filename = "{$uuid}.{$extension}";
        $path = Storage::disk($disk)->putFileAs($directory, $file, $filename);

        // 6. Image dimension bounds & decompression bomb protection
        $width = null;
        $height = null;
        $variants = null;

        if ($isImage) {
            $imageSize = @getimagesize($realPath);
            if (!$imageSize) {
                throw new \InvalidArgumentException('Corrupt or malformed image file signature.');
            }

            $width = $imageSize[0];
            $height = $imageSize[1];

            if ($width > self::MAX_IMAGE_WIDTH || $height > self::MAX_IMAGE_HEIGHT) {
                throw new \InvalidArgumentException("Image dimensions ({$width}x{$height}) exceed maximum permitted dimensions (" . self::MAX_IMAGE_WIDTH . "x" . self::MAX_IMAGE_HEIGHT . ").");
            }

            // Generate variant path map according to Phase 1 Media Architecture spec
            $baseUrl = Storage::disk($disk)->url($directory);
            $variants = [
                'hero'      => "{$baseUrl}/{$uuid}-hero.webp",
                'large'     => "{$baseUrl}/{$uuid}-large.webp",
                'medium'    => "{$baseUrl}/{$uuid}-medium.webp",
                'small'     => "{$baseUrl}/{$uuid}-small.webp",
                'thumbnail' => "{$baseUrl}/{$uuid}-thumb.webp",
            ];
        }

        $safeOriginalName = preg_replace('/[^\w\-\.\ \(\)]/u', '_', basename($rawOriginalName));

        return Media::create([
            'uuid'          => $uuid,
            'disk'          => $disk,
            'directory'     => $directory,
            'filename'      => $filename,
            'original_name' => $safeOriginalName,
            'mime_type'     => $detectedMime,
            'extension'     => $extension,
            'size_bytes'    => $sizeBytes,
            'width'         => $width,
            'height'        => $height,
            'alt_text'      => $altText,
            'caption'       => $caption,
            'variants'      => $variants,
            'uploaded_by'   => $uploadedBy,
        ]);
    }

    /**
     * Delete media record and physically remove file from disk.
     */
    public function deleteMedia(Media $media): bool
    {
        $filePath = $media->directory . '/' . $media->filename;

        if (Storage::disk($media->disk)->exists($filePath)) {
            Storage::disk($media->disk)->delete($filePath);
        }

        return (bool) $media->delete();
    }
}
