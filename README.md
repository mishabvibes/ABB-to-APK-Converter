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

## Mock Conversion

Currently, the conversion logic is mocked for demonstration purposes. The API route:
1. Validates the file extension (.aab)
2. Saves the uploaded file temporarily
3. Simulates conversion processing
4. Returns a mock APK file

**Note**: To implement real conversion logic, replace the mock conversion in `app/api/convert/route.ts` with your actual conversion algorithm. For real AAB to APK conversion, you would typically use tools like `bundletool` by Google.

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

