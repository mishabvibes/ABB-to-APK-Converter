# Setup Guide - AAB to APK Converter

## System Requirements

- **Node.js**: 18 or higher
- **Java**: 8 or higher (required for bundletool)
- **Operating System**: Windows, macOS, or Linux
- **Disk Space**: At least 500MB free (for bundletool and temporary files)
- **Internet**: Required for first conversion (to download bundletool)

## Step-by-Step Setup

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/):
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 2. Install Java

#### Windows
1. Download Java from [Java.com](https://www.java.com/download/) or [Adoptium](https://adoptium.net/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```cmd
   java -version
   ```

#### macOS
```bash
# Using Homebrew
brew install openjdk@11

# Or download from Adoptium
# Visit https://adoptium.net/ and download the .pkg installer
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install default-jdk

# Verify installation
java -version
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install java-11-openjdk-devel

# Verify installation
java -version
```

### 3. Clone and Install Project

```bash
# Clone the repository
git clone <repository-url>
cd Abb-to-apk

# Install dependencies
npm install
```

### 4. Verify Java Installation

```bash
java -version
```

You should see output like:
```
openjdk version "11.0.19" 2023-04-18
OpenJDK Runtime Environment (build 11.0.19+9-Ubuntu-0ubuntu122.04.1)
OpenJDK 64-Bit Server VM (build 11.0.19+9-Ubuntu-0ubuntu122.04.1, mixed mode, sharing)
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on [http://localhost:3000](http://localhost:3000)

### 6. First Conversion

1. Open the application in your browser
2. Upload an AAB file
3. Click "Convert to APK"
4. On first conversion, bundletool will be downloaded automatically (requires internet)
5. Wait for conversion to complete
6. Download the converted APK

## Troubleshooting

### Java Not Found

**Error**: `Java is not installed or not found in PATH`

**Solution**:
1. Verify Java is installed: `java -version`
2. If not installed, install Java (see step 2 above)
3. If installed but not found:
   - **Windows**: Add Java to PATH in System Environment Variables
   - **macOS/Linux**: Set JAVA_HOME environment variable:
     ```bash
     export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
     export PATH=$JAVA_HOME/bin:$PATH
     ```

### Bundletool Download Fails

**Error**: `Failed to download bundletool`

**Solution**:
1. Check internet connection
2. Verify GitHub is accessible
3. Manually download bundletool:
   - Visit: https://github.com/google/bundletool/releases
   - Download the latest `bundletool-all-x.x.x.jar`
   - Place it in the `tools/` directory as `bundletool.jar`

### Conversion Fails

**Error**: `Failed to convert AAB to APKS`

**Possible Causes**:
1. **Invalid AAB file**: Ensure the AAB file is not corrupted
2. **Insufficient disk space**: Free up disk space
3. **File too large**: Current limit is 200MB
4. **Java memory issues**: Increase Java heap size (advanced)

### Permission Errors

**Error**: `Permission denied` or `EACCES`

**Solution**:
1. Ensure the `uploads/` and `tools/` directories have write permissions
2. On Linux/Mac, you may need to adjust permissions:
   ```bash
   chmod -R 755 uploads
   chmod -R 755 tools
   ```

## Production Deployment

### Requirements for Production

1. **Java Runtime**: Ensure Java is installed on the production server
2. **Node.js**: Install Node.js 18+ on the production server
3. **Environment Variables**: Set up any required environment variables
4. **Disk Space**: Allocate sufficient disk space for conversions
5. **Memory**: Ensure adequate RAM for Java processes (recommended: 2GB+)

### Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Or deploy to a platform**:
   - **Vercel**: Requires Java in the build environment (may need custom configuration)
   - **Docker**: Create a Dockerfile with Java and Node.js
   - **Self-hosted**: Install Java and Node.js on your server

### Docker Deployment (Recommended)

Create a `Dockerfile`:
```dockerfile
FROM node:18

# Install Java
RUN apt-get update && apt-get install -y openjdk-11-jdk && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t aab-to-apk-converter .
docker run -p 3000:3000 aab-to-apk-converter
```

## Additional Resources

- [Bundletool Documentation](https://developer.android.com/tools/bundletool)
- [Java Installation Guide](https://www.java.com/en/download/help/download_options.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all prerequisites are installed correctly
3. Ensure sufficient disk space and memory
4. Check that the AAB file is valid and not corrupted

