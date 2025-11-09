# AAB to APK Converter

A modern, full-stack Next.js application that allows users to upload .aab (Android App Bundle) files and convert them to .apk format. Built with the latest Next.js, TypeScript, TailwindCSS, shadcn/ui, and Framer Motion for a beautiful, responsive user experience.

## Features

- 🎨 **Modern UI**: Glassmorphic design with smooth animations
- 📤 **Drag & Drop**: Easy file upload with drag-and-drop support
- 📊 **Progress Tracking**: Real-time conversion progress animation
- 📥 **Download**: Direct download of converted APK files
- 🔒 **Secure**: File validation and secure processing
- 📱 **Responsive**: Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Java 8 or higher installed (required for bundletool)
  - Download from [Java.com](https://www.java.com/download/) or [OpenJDK](https://openjdk.org/)
  - Verify installation: `java -version`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Abb-to-apk
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Abb-to-apk/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts      # API route for file conversion
│   ├── globals.css           # Global styles and CSS variables
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── progress.tsx
├── lib/
│   └── utils.ts              # Utility functions
└── uploads/                  # Upload directory (created automatically)
```

## Usage

1. **Upload File**: Drag and drop a .aab file or click to browse
2. **Convert**: Click the "Convert to APK" button
3. **Wait**: Monitor the progress bar during conversion
4. **Download**: Click the "Download APK" button when conversion completes

## API Route

The `/api/convert` endpoint handles file uploads and conversion:

- **Method**: POST
- **Body**: FormData with a 'file' field
- **Response**: JSON with file data (base64 encoded)

### Example Request

```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/convert', {
  method: 'POST',
  body: formData,
});
```

## Real AAB to APK Conversion

This application uses **Google's bundletool** to convert AAB files to APK format. The conversion process:

1. **Validates** the file extension (.aab) and file size (max 200MB)
2. **Downloads bundletool** automatically on first use (if not already present)
3. **Converts AAB to APKS** using bundletool in universal mode (single APK for all devices)
4. **Extracts the universal APK** from the APKS archive
5. **Returns the converted APK** file for download

### Requirements

- **Java 8 or higher** must be installed and accessible in your PATH
- The server must have internet access to download bundletool on first use
- Sufficient disk space for temporary files during conversion

### How It Works

The conversion uses Google's official [bundletool](https://github.com/google/bundletool) which:
- Converts Android App Bundle (AAB) files to APK Set (APKS) format
- Generates universal APKs that work on all Android devices
- Preserves app signatures from the original AAB file
- Handles both signed and unsigned AAB files

### Troubleshooting

If conversion fails:
1. **Check Java installation**: Run `java -version` in your terminal
2. **Verify file validity**: Ensure the AAB file is not corrupted
3. **Check server logs**: Look for detailed error messages in the console
4. **Disk space**: Ensure sufficient space for temporary files
5. **Network access**: First conversion requires internet to download bundletool

## Styling

The app uses a glassmorphic design with:
- Dark theme with gradient backgrounds
- Glass-like cards with backdrop blur
- Smooth animations and transitions
- Responsive design for all screen sizes

## Development

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Deployment

### ⚠️ Important: Vercel Limitations

**This application CANNOT run on Vercel** because:
- Vercel serverless functions don't support Java
- No system dependencies can be installed
- Ephemeral file system (files deleted after execution)
- Timeout limits (10-60 seconds, but conversion needs 5+ minutes)

### ✅ Recommended Deployment Options

1. **Railway** (Easiest) - Supports Docker with Java
2. **Render** - Supports Docker, free tier available
3. **Self-Hosted** - Full control on your own server
4. **Docker** - Deploy anywhere Docker is supported

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Docker Deployment

```bash
# Build Docker image
docker build -t aab-to-apk-converter .

# Run container
docker run -p 3000:3000 aab-to-apk-converter
```

Or use Docker Compose:
```bash
docker-compose up -d
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

