'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Download, CheckCircle2, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type ConversionState = 'idle' | 'uploading' | 'converting' | 'completed' | 'error';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<ConversionState>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadData, setDownloadData] = useState<{ fileName: string; fileData: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.aab')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a valid .aab (Android App Bundle) file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.aab')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid .aab (Android App Bundle) file');
    }
  }, []);

  const handleConvert = async () => {
    if (!file) return;

    setState('uploading');
    setProgress(0);
    setError(null);
    setDownloadData(null);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 40) {
          clearInterval(uploadInterval);
          return 40;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Conversion failed');
      }

      setState('converting');
      setProgress(40);

      // Simulate conversion progress
      const convertInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(convertInterval);
            return 100;
          }
          return prev + 15;
        });
      }, 300);

      const data = await response.json();

      clearInterval(convertInterval);
      setProgress(100);
      setState('completed');
      setDownloadData({
        fileName: data.fileName,
        fileData: data.fileData,
      });
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!downloadData) return;

    const binaryString = atob(downloadData.fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setState('idle');
    setProgress(0);
    setDownloadData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AAB to APK Converter
          </h1>
          <p className="text-slate-300 text-lg">
            Convert your .aab (Android App Bundle) files to .apk format effortlessly
          </p>
        </motion.div>

        <Card className="glass-light border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Upload Your File</CardTitle>
            <CardDescription className="text-slate-300">
              Drag and drop your .aab file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <motion.div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-all duration-300
                ${isDragging 
                  ? 'border-blue-400 bg-blue-500/20 scale-105' 
                  : 'border-slate-600 hover:border-slate-500 hover:bg-white/5'
                }
                ${file ? 'border-green-500 bg-green-500/10' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".aab"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Upload className="w-16 h-16 mx-auto text-slate-400" />
                    </motion.div>
                    <div>
                      <p className="text-white text-lg font-medium mb-2">
                        Drop your .aab file here
                      </p>
                      <p className="text-slate-400 text-sm">
                        or click to browse from your computer
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <File className="w-16 h-16 mx-auto text-green-400" />
                    <div>
                      <p className="text-white text-lg font-medium mb-1">
                        {file.name}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
                >
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            <AnimatePresence>
              {(state === 'uploading' || state === 'converting') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      {state === 'uploading' ? 'Uploading...' : 'Converting...'}
                    </span>
                    <span className="text-slate-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {state === 'completed' && downloadData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-300 font-medium">Conversion completed!</p>
                    <p className="text-green-400/80 text-sm">{downloadData.fileName}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <AnimatePresence mode="wait">
                {state === 'idle' && file && (
                  <motion.div
                    key="convert"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      onClick={handleConvert}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8"
                    >
                      Convert to APK
                    </Button>
                  </motion.div>
                )}
                {(state === 'uploading' || state === 'converting') && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      disabled
                      size="lg"
                      className="px-8"
                    >
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {state === 'uploading' ? 'Uploading...' : 'Converting...'}
                    </Button>
                  </motion.div>
                )}
                {state === 'completed' && downloadData && (
                  <motion.div
                    key="download"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-4"
                  >
                    <Button
                      onClick={handleDownload}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download APK
                    </Button>
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="outline"
                      className="px-8 border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      Convert Another
                    </Button>
                  </motion.div>
                )}
                {state === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="outline"
                      className="px-8 border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-slate-400 text-sm"
        >
          <p>Secure file conversion • Your files are processed securely</p>
        </motion.div>
      </div>
    </div>
  );
}

