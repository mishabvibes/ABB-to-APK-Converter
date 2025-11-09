import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { convertAabToApk, checkJavaInstallation } from '@/lib/bundletool';

// Configure route for larger file uploads
export const maxDuration = 300; // 5 minutes for large file processing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

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

    // Try to get form data - this might fail if body is too large
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Failed to parse form data:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process file upload. The file might be too large or the request is malformed.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

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

    // Check if Java is installed
    const javaCheck = await checkJavaInstallation();
    if (!javaCheck.installed) {
      console.error('Java check failed:', javaCheck.error);
      return NextResponse.json(
        { 
          error: 'Java is not installed or not found in PATH. Please install Java 8 or higher to convert AAB files.',
          details: javaCheck.error || 'Bundletool requires Java to convert AAB files to APK. Please install Java from https://www.java.com/download/',
          troubleshooting: 'Try: 1) Restart your terminal/IDE, 2) Verify Java with "java -version", 3) Check JAVA_HOME environment variable, 4) Ensure Java is in your system PATH'
        },
        { status: 500 }
      );
    }
    
    console.log(`Java found: ${javaCheck.javaPath || 'java'}`);

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    uploadPath = join(UPLOAD_DIR, `input-${Date.now()}-${file.name}`);
    await writeFile(uploadPath, buffer);

    console.log(`Starting conversion of ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Convert AAB to APK using bundletool
    try {
      apkPath = await convertAabToApk(uploadPath, UPLOAD_DIR);
      console.log(`Conversion successful: ${apkPath}`);
    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      throw new Error(
        `Failed to convert AAB to APK: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}. ` +
        `Please ensure the AAB file is valid and not corrupted.`
      );
    }

    // Read the APK file
    const apkBuffer = await readFile(apkPath);
    const apkFileName = file.name.replace('.aab', '.apk');
    const apkBase64 = apkBuffer.toString('base64');

    console.log(`APK file created: ${apkFileName} (${(apkBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

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

