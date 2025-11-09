# Quick Start Guide

## Getting Started

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features Overview

### ✨ User Interface
- **Glassmorphic Design**: Modern, frosted glass effect with backdrop blur
- **Drag & Drop**: Intuitive file upload with drag-and-drop support
- **Progress Animation**: Real-time progress bar with smooth animations
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices

### 🔧 Functionality
- **File Upload**: Supports .aab (Android App Bundle) files up to 50MB
- **File Validation**: Automatic validation of file type and size
- **Mock Conversion**: Simulates APK conversion (replace with real logic)
- **Download**: Direct download of converted APK files
- **Error Handling**: Comprehensive error messages and handling

### 🎨 Animations
- **Framer Motion**: Smooth page transitions and component animations
- **Loading States**: Animated loading indicators
- **Progress Tracking**: Animated progress bar with percentage

## Customization

### Changing the Conversion Logic

To implement real conversion logic, edit `app/api/convert/route.ts`:

```typescript
// Replace the mock conversion section (around line 55-70)
// with your actual conversion logic
```

### Styling Customization

- **Colors**: Edit `app/globals.css` to change the color scheme
- **Components**: Modify components in `components/ui/` directory
- **Theme**: Update Tailwind config in `tailwind.config.ts`

### File Size Limits

Default limit is 50MB. To change it, edit `app/api/convert/route.ts`:

```typescript
const maxSize = 50 * 1024 * 1024; // Change this value
```

## Project Structure

```
Abb-to-apk/
├── app/
│   ├── api/convert/route.ts    # API endpoint for conversion
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page component
├── components/ui/               # Reusable UI components
├── lib/utils.ts                 # Utility functions
└── uploads/                     # Upload directory (auto-created)
```

## Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### File Upload Issues
- Check that the `uploads` directory has write permissions
- Verify file size is under 50MB
- Ensure file extension is `.aab` (Android App Bundle)

### API Errors
- Check server console for error messages
- Verify API route is accessible at `/api/convert`
- Ensure FormData is being sent correctly

## Next Steps

1. **Implement Real Conversion**: Replace mock conversion with actual AAB to APK conversion logic (use Google's `bundletool`)
2. **Add Authentication**: Implement user authentication if needed
3. **Add Database**: Store conversion history in a database
4. **Add Analytics**: Track usage and conversions
5. **Deploy**: Deploy to Vercel, Netlify, or your preferred hosting platform

## Support

For issues or questions, please check the README.md or create an issue in the repository.

