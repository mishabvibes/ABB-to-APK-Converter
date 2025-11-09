import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configure route for larger file uploads
export const maxDuration = 300; // 5 minutes for large file processing
export const runtime = 'nodejs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  let uploadPath: string | null = null;
  let apkPath: string | null = null;

  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!file.name.endsWith('.aab')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a .aab (Android App Bundle) file' },
        { status: 400 }
      );
    }

    // Validate file size (max 200MB - AAB files can be large)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 200MB' },
        { status: 400 }
      );
    }

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    uploadPath = join(UPLOAD_DIR, `${Date.now()}-${file.name}`);
    await writeFile(uploadPath, buffer);

    // Simulate conversion process (mock conversion)
    // In a real application, you would use actual conversion tools here
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2s conversion

    // Generate APK file (mock - just copy and rename for demonstration)
    const apkFileName = file.name.replace('.aab', '.apk');
    apkPath = join(UPLOAD_DIR, `${Date.now()}-${apkFileName}`);
    
    // For mock conversion, we'll create a dummy APK file
    // In production, you would use actual conversion logic
    // Here we simulate a real APK by creating a minimal ZIP structure (APK is essentially a ZIP file)
    // Create a simple mock APK file with ZIP header
    const zipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // PK header
    const mockContent = Buffer.from('Mock APK file - Replace with actual conversion logic');
    const mockApkContent = Buffer.concat([zipHeader, mockContent]);
    await writeFile(apkPath, mockApkContent);

    // Read the APK file
    const apkBuffer = await readFile(apkPath);
    const apkBase64 = apkBuffer.toString('base64');

    // Clean up files
    if (uploadPath) {
      try {
        await unlink(uploadPath);
      } catch (err) {
        console.warn('Failed to delete upload file:', err);
      }
    }
    if (apkPath) {
      try {
        await unlink(apkPath);
      } catch (err) {
        console.warn('Failed to delete APK file:', err);
      }
    }

    return NextResponse.json({
      success: true,
      fileName: apkFileName,
      fileData: apkBase64,
      fileSize: apkBuffer.length,
    });
  } catch (error) {
    // Clean up files on error
    if (uploadPath) {
      try {
        await unlink(uploadPath);
      } catch (err) {
        console.warn('Failed to delete upload file on error:', err);
      }
    }
    if (apkPath) {
      try {
        await unlink(apkPath);
      } catch (err) {
        console.warn('Failed to delete APK file on error:', err);
      }
    }

    console.error('Conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Conversion failed. Please try again.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

