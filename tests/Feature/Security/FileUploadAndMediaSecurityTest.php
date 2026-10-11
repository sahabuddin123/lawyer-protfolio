<?php

namespace Tests\Feature\Security;

use App\Models\GalleryAlbum;
use App\Models\User;
use App\Services\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FileUploadAndMediaSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected MediaService $mediaService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $this->mediaService = app(MediaService::class);
        Storage::fake('public');
        Storage::fake('secure');
    }

    public function test_executable_file_extensions_are_strictly_rejected(): void
    {
        $dangerousFiles = [
            'exploit.php',
            'shell.php3',
            'backdoor.phtml',
            'payload.phar',
            'script.py',
            'malware.exe',
            'command.bat',
            'service.dll',
            'run.sh',
        ];

        foreach ($dangerousFiles as $filename) {
            $file = UploadedFile::fake()->create($filename, 100);

            $rejected = false;
            try {
                $this->mediaService->uploadFile($file, 'public');
            } catch (\InvalidArgumentException $e) {
                $rejected = true;
            }

            $this->assertTrue($rejected, "Failed to reject dangerous executable file: {$filename}");
        }
    }

    public function test_double_extension_files_are_rejected(): void
    {
        $doubleExtensions = [
            'image.php.jpg',
            'avatar.phtml.png',
            'document.phar.webp',
            'photo.exe.jpg',
        ];

        foreach ($doubleExtensions as $filename) {
            $file = UploadedFile::fake()->image($filename, 100, 100);

            $rejected = false;
            try {
                $this->mediaService->uploadFile($file, 'public');
            } catch (\InvalidArgumentException $e) {
                $rejected = true;
            }

            $this->assertTrue($rejected, "Failed to reject double extension file: {$filename}");
        }
    }

    public function test_path_traversal_filenames_are_rejected(): void
    {
        $traversalNames = [
            'evil..jpg',
            '..test.png',
            'traversal..payload.jpg',
        ];

        $jpegBytes = base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');

        foreach ($traversalNames as $filename) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'sec');
            file_put_contents($tmpFile, $jpegBytes);
            $file = new UploadedFile($tmpFile, $filename, 'image/jpeg', null, true);

            $rejected = false;
            try {
                $this->mediaService->uploadFile($file, 'public');
            } catch (\InvalidArgumentException $e) {
                $rejected = true;
            }
            @unlink($tmpFile);

            $this->assertTrue($rejected, "Failed to reject path traversal in filename: {$filename}");
        }
    }

    public function test_svg_files_are_rejected(): void
    {
        $svgContent = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
        $file = UploadedFile::fake()->createWithContent('vector.svg', $svgContent);

        $rejected = false;
        try {
            $this->mediaService->uploadFile($file, 'public');
        } catch (\InvalidArgumentException $e) {
            $rejected = true;
        }

        $this->assertTrue($rejected, 'Failed to reject SVG file upload');
    }

    public function test_decompression_bomb_oversized_dimensions_rejected(): void
    {
        // 2501x2501px image exceeds maximum allowed 2500x2500px
        $file = UploadedFile::fake()->image('huge.jpg', 2501, 2501);

        $this->expectException(\InvalidArgumentException::class);
        $this->mediaService->uploadFile($file, 'public');
    }

    public function test_valid_image_is_stored_with_random_uuid_name(): void
    {
        $file = UploadedFile::fake()->image('innocent_photo.jpg', 800, 600);

        $media = $this->mediaService->uploadFile($file, 'public');

        $this->assertNotNull($media);
        $this->assertEquals('image/jpeg', $media->mime_type);
        // Stored filename must NEVER equal client filename
        $this->assertNotEquals('innocent_photo.jpg', $media->filename);
        $this->assertTrue(str_ends_with($media->filename, '.jpg'));
        // Must exist on public disk under generated UUID
        Storage::disk('public')->assertExists($media->directory . '/' . $media->filename);
    }

    public function test_confidential_document_stored_on_secure_disk_isolated_from_public(): void
    {
        $pdf = UploadedFile::fake()->createWithContent('confidential_affidavit.pdf', "%PDF-1.4\n%mock PDF content\n%%EOF");

        $media = $this->mediaService->uploadFile($pdf, 'secure', 'case_documents');

        $this->assertEquals('secure', $media->disk);
        // Stored on secure disk
        Storage::disk('secure')->assertExists("case_documents/{$media->filename}");
        // NOT on public disk
        Storage::disk('public')->assertMissing("case_documents/{$media->filename}");
    }
}
