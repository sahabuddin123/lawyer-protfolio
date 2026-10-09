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

    /**
     * Upload an asset and register it in the media registry.
     */
    public function uploadFile(
        UploadedFile $file,
        string $disk = 'public',
        ?string $directory = null,
        ?array $altText = null,
        ?array $caption = null,
        ?int $uploadedBy = null
    ): Media {
        $mimeType = $file->getMimeType();
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = strtolower($file->getClientOriginalExtension());
        $sizeBytes = $file->getSize();
        $uuid = (string) Str::uuid();

        // Determine target directory structure per architecture spec
        if ($directory === null) {
            if ($disk === 'secure') {
                $directory = 'case_documents';
            } elseif (array_key_exists($mimeType, self::ALLOWED_IMAGE_MIMES)) {
                $directory = 'media/' . date('Y/m');
            } else {
                $directory = 'media/documents';
            }
        }

        $filename = "{$uuid}.{$extension}";
        $path = Storage::disk($disk)->putFileAs($directory, $file, $filename);

        // Read image dimensions if applicable
        $width = null;
        $height = null;
        $variants = null;

        if (array_key_exists($mimeType, self::ALLOWED_IMAGE_MIMES)) {
            $imageSize = @getimagesize($file->getRealPath());
            if ($imageSize) {
                $width = $imageSize[0];
                $height = $imageSize[1];
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

        return Media::create([
            'uuid'          => $uuid,
            'disk'          => $disk,
            'directory'     => $directory,
            'filename'      => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $mimeType,
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
