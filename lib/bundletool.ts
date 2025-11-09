import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import AdmZip from 'adm-zip';

const execAsync = promisify(exec);

const BUNDLETOOL_DIR = join(process.cwd(), 'tools');
const BUNDLETOOL_JAR = join(BUNDLETOOL_DIR, 'bundletool.jar');
const BUNDLETOOL_VERSION = '1.15.6';
const BUNDLETOOL_URL = `https://github.com/google/bundletool/releases/download/${BUNDLETOOL_VERSION}/bundletool-all-${BUNDLETOOL_VERSION}.jar`;

/**
 * Check if Java is installed and available
 * Returns Java path if found, null otherwise
 */
export async function checkJavaInstallation(): Promise<{ installed: boolean; javaPath?: string; error?: string }> {
  // Try multiple methods to find Java
  const methods = [
    // Method 1: Direct java command
    async () => {
      try {
        const { stderr, stdout } = await execAsync('java -version', {
          timeout: 5000,
        });
        const output = (stderr || stdout || '').toLowerCase();
        if (output.includes('version') || output.includes('openjdk') || output.includes('java')) {
          return { installed: true, javaPath: 'java' };
        }
      } catch (error: any) {
        // Java outputs version to stderr, so this might still be success
        if (error.stderr) {
          const stderr = error.stderr.toLowerCase();
          if (stderr.includes('version') || stderr.includes('openjdk') || stderr.includes('java')) {
            return { installed: true, javaPath: 'java' };
          }
        }
      }
      return null;
    },
    
    // Method 2: Check JAVA_HOME environment variable
    async () => {
      const javaHome = process.env.JAVA_HOME;
      if (javaHome) {
        const isWindows = process.platform === 'win32';
        const javaExe = isWindows ? 'java.exe' : 'java';
        const javaPath = join(javaHome, 'bin', javaExe);
        if (existsSync(javaPath)) {
          try {
            await execAsync(`"${javaPath}" -version`, { timeout: 5000 });
            return { installed: true, javaPath };
          } catch (error: any) {
            // Even if command fails, if file exists, Java is likely installed
            if (error.stderr && error.stderr.toLowerCase().includes('version')) {
              return { installed: true, javaPath };
            }
          }
        }
      }
      return null;
    },
    
    // Method 3: Use Windows 'where' command to find Java
    async () => {
      if (process.platform === 'win32') {
        try {
          const { stdout } = await execAsync('where java', { timeout: 5000 });
          if (stdout && stdout.trim()) {
            const javaPath = stdout.split('\n')[0].trim();
            if (existsSync(javaPath)) {
              try {
                await execAsync(`"${javaPath}" -version`, { timeout: 5000 });
                return { installed: true, javaPath };
              } catch (error: any) {
                if (error.stderr && error.stderr.toLowerCase().includes('version')) {
                  return { installed: true, javaPath };
                }
              }
            }
          }
        } catch (error) {
          // where command failed, continue to next method
        }
      }
      return null;
    },
    
    // Method 4: Try common Java installation paths (Windows)
    async () => {
      if (process.platform === 'win32') {
        // Get common program files paths
        const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
        const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
        
        const commonPaths = [
          // Check Program Files
          join(programFiles, 'Java', 'jdk-17', 'bin', 'java.exe'),
          join(programFiles, 'Java', 'jre-17', 'bin', 'java.exe'),
          join(programFiles, 'Java', 'jdk-11', 'bin', 'java.exe'),
          join(programFiles, 'Java', 'jre-11', 'bin', 'java.exe'),
          join(programFiles, 'Java', 'jdk-8', 'bin', 'java.exe'),
          join(programFiles, 'Java', 'jre-8', 'bin', 'java.exe'),
          // Check Program Files (x86)
          join(programFilesX86, 'Java', 'jdk-17', 'bin', 'java.exe'),
          join(programFilesX86, 'Java', 'jre-17', 'bin', 'java.exe'),
          join(programFilesX86, 'Java', 'jdk-11', 'bin', 'java.exe'),
          join(programFilesX86, 'Java', 'jre-11', 'bin', 'java.exe'),
          join(programFilesX86, 'Java', 'jdk-8', 'bin', 'java.exe'),
          join(programFilesX86, 'Java', 'jre-8', 'bin', 'java.exe'),
        ];
        
        // Also check for any JDK/JRE in Java folder dynamically
        try {
          const javaDir = join(programFiles, 'Java');
          if (existsSync(javaDir)) {
            const dirs = readdirSync(javaDir);
            for (const dir of dirs) {
              const javaExe = join(javaDir, dir, 'bin', 'java.exe');
              if (existsSync(javaExe)) {
                commonPaths.push(javaExe);
              }
            }
          }
        } catch {
          // Ignore errors
        }
        
        for (const javaPath of commonPaths) {
          if (javaPath && existsSync(javaPath)) {
            try {
              await execAsync(`"${javaPath}" -version`, { timeout: 5000 });
              return { installed: true, javaPath };
            } catch (error: any) {
              if (error.stderr && error.stderr.toLowerCase().includes('version')) {
                return { installed: true, javaPath };
              }
            }
          }
        }
      }
      return null;
    },
  ];

  // Try each method
  for (const method of methods) {
    try {
      const result = await method();
      if (result) {
        return result;
      }
    } catch (error) {
      // Continue to next method
      continue;
    }
  }

  // If all methods fail, return error
  return {
    installed: false,
    error: 'Java not found in PATH, JAVA_HOME, or common installation directories. Please ensure Java is installed and accessible.',
  };
}

/**
 * Download bundletool if it doesn't exist
 */
export async function ensureBundletool(): Promise<string> {
  // Ensure tools directory exists
  if (!existsSync(BUNDLETOOL_DIR)) {
    mkdirSync(BUNDLETOOL_DIR, { recursive: true });
  }

  // Check if bundletool already exists
  if (existsSync(BUNDLETOOL_JAR)) {
    return BUNDLETOOL_JAR;
  }

  console.log('Downloading bundletool...');
  
  try {
    // Download bundletool
    const response = await fetch(BUNDLETOOL_URL);
    if (!response.ok) {
      throw new Error(`Failed to download bundletool: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(BUNDLETOOL_JAR, Buffer.from(buffer));
    
    console.log('Bundletool downloaded successfully');
    return BUNDLETOOL_JAR;
  } catch (error) {
    console.error('Error downloading bundletool:', error);
    throw new Error(`Failed to download bundletool: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert AAB to APKS using bundletool
 * @param aabPath Path to the AAB file
 * @param outputDir Directory to save the APKS file
 * @returns Path to the generated APKS file
 */
export async function convertAabToApks(
  aabPath: string,
  outputDir: string
): Promise<string> {
  const bundletoolJar = await ensureBundletool();
  const apksPath = join(outputDir, `output-${Date.now()}.apks`);

  // Determine Java command to use
  const javaCheck = await checkJavaInstallation();
  const javaCommand = javaCheck.javaPath || 'java';
  const isWindows = process.platform === 'win32';
  const javaExec = isWindows && javaCheck.javaPath && !javaCheck.javaPath.includes(' ') 
    ? javaCommand 
    : `"${javaCommand}"`;

  // Build APKS in universal mode (single APK for all devices)
  // For universal APKs, we don't need signing parameters
  // If the AAB is already signed, bundletool will preserve the signature
  let command = `${javaExec} -jar "${bundletoolJar}" build-apks --bundle="${aabPath}" --output="${apksPath}" --mode=universal`;

  try {
    console.log('Converting AAB to APKS...');
    console.log(`Command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 100 * 1024 * 1024, // 100MB buffer for large outputs
      timeout: 600000, // 10 minutes timeout
    });

    // Bundletool often outputs to stderr even on success
    if (stdout) {
      console.log('Bundletool stdout:', stdout);
    }
    
    // Check for actual errors (not warnings)
    if (stderr) {
      const errorLines = stderr.split('\n').filter(line => 
        line.toLowerCase().includes('error') && 
        !line.toLowerCase().includes('warning')
      );
      if (errorLines.length > 0) {
        throw new Error(`Bundletool error: ${errorLines.join('; ')}`);
      }
      // Log warnings but don't fail
      if (stderr.includes('Warning') || stderr.includes('warning')) {
        console.warn('Bundletool warnings:', stderr);
      }
    }

    if (!existsSync(apksPath)) {
      throw new Error('APKS file was not created. Check the error messages above.');
    }

    console.log('APKS file created successfully');
    return apksPath;
  } catch (error: any) {
    console.error('Error converting AAB to APKS:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's a Java/command execution error
      if (errorMessage.includes('Command failed') || errorMessage.includes('spawn')) {
        errorMessage = 'Failed to execute bundletool. Please ensure Java is installed and accessible.';
      }
    } else if (error.stderr) {
      errorMessage = error.stderr.toString();
    } else if (error.stdout) {
      errorMessage = error.stdout.toString();
    }
    
    throw new Error(
      `Failed to convert AAB to APKS: ${errorMessage}`
    );
  }
}

/**
 * Extract universal APK from APKS file
 * APKS files are ZIP archives containing APK files
 * @param apksPath Path to the APKS file
 * @param outputDir Directory to save the extracted APK
 * @returns Path to the extracted universal APK
 */
export async function extractUniversalApk(
  apksPath: string,
  outputDir: string
): Promise<string> {
  try {
    const zip = new AdmZip(apksPath);
    const entries = zip.getEntries();

    console.log(`APKS archive contains ${entries.length} entries`);
    
    // Log all entries for debugging
    entries.forEach(entry => {
      console.log(`  - ${entry.entryName} (${entry.header.size} bytes)`);
    });

    // Find the universal APK entry (could be at root or in a subdirectory)
    let universalApkEntry = entries.find(
      (entry) => entry.entryName === 'universal.apk'
    );

    // Try alternative paths
    if (!universalApkEntry) {
      universalApkEntry = entries.find(
        (entry) => entry.entryName.endsWith('/universal.apk') || 
                   entry.entryName.includes('universal.apk')
      );
    }

    // If no universal.apk, try to find the largest APK file (likely the universal one)
    if (!universalApkEntry) {
      const apkEntries = entries.filter((entry) => entry.entryName.endsWith('.apk'));
      if (apkEntries.length === 0) {
        throw new Error('No APK file found in APKS archive. The archive may be corrupted.');
      }
      
      // Sort by size and take the largest (universal APK is usually the largest)
      apkEntries.sort((a, b) => b.header.size - a.header.size);
      universalApkEntry = apkEntries[0];
      console.log(`Using largest APK found: ${universalApkEntry.entryName} (${universalApkEntry.header.size} bytes)`);
    }

    if (!universalApkEntry) {
      throw new Error('Could not locate universal APK in the APKS archive.');
    }

    const apkPath = join(outputDir, `universal-${Date.now()}.apk`);
    const apkData = universalApkEntry.getData();
    await writeFile(apkPath, apkData);
    
    console.log(`Extracted APK: ${apkPath} (${apkData.length} bytes)`);
    return apkPath;
  } catch (error) {
    console.error('Error extracting APK from APKS:', error);
    throw new Error(
      `Failed to extract APK from APKS archive: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Convert AAB file to APK
 * @param aabPath Path to the AAB file
 * @param outputDir Directory to save temporary files and final APK
 * @returns Path to the converted APK file
 */
export async function convertAabToApk(
  aabPath: string,
  outputDir: string
): Promise<string> {
  // Step 1: Convert AAB to APKS
  const apksPath = await convertAabToApks(aabPath, outputDir);

  try {
    // Step 2: Extract universal APK from APKS
    const apkPath = await extractUniversalApk(apksPath, outputDir);

    // Clean up APKS file
    try {
      await unlink(apksPath);
    } catch (err) {
      console.warn('Failed to delete APKS file:', err);
    }

    return apkPath;
  } catch (error) {
    // Clean up APKS file on error
    try {
      await unlink(apksPath);
    } catch (err) {
      console.warn('Failed to delete APKS file on error:', err);
    }
    throw error;
  }
}

