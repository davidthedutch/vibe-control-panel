'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Camera, AlertCircle } from 'lucide-react';

interface PreviewFrameProps {
  url: string;
  deviceWidth: number;
  deviceHeight: number;
  onMessage: (message: MessageEvent) => void;
  onReady: (ready: boolean) => void;
}

export default function PreviewFrame({
  url,
  deviceWidth,
  deviceHeight,
  onMessage,
  onReady,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenshotting, setScreenshotting] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic origin validation - in production you'd want to validate the origin
      if (event.data && typeof event.data === 'object' && event.data.type) {
        onMessage(event);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
    onReady(true);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load preview. Check if the URL is correct and accessible.');
    onReady(false);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setLoading(true);
      setError(null);
      iframeRef.current.src = url;
    }
  };

  const handleScreenshot = async () => {
    setScreenshotting(true);
    try {
      // In a real implementation, you would:
      // 1. Send a message to the SDK to prepare for screenshot
      // 2. Use html2canvas or similar library
      // 3. Or use a server-side screenshot service

      // For now, we'll just simulate the action
      await new Promise(resolve => setTimeout(resolve, 500));

      // You could also use the browser's built-in screenshot API if available
      alert('Screenshot functionality would capture the current preview state. Integration with screenshot library required.');
    } finally {
      setScreenshotting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 overflow-auto">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          title="Refresh preview"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={handleScreenshot}
          disabled={screenshotting || loading}
          className="flex items-center gap-2 rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          title="Take screenshot"
        >
          <Camera className="h-4 w-4" />
          Screenshot
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500 dark:border-slate-600 dark:border-t-blue-400"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading preview...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white dark:bg-slate-900 p-8">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Preview Error
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Device frame */}
      <div
        className="relative bg-white shadow-2xl"
        style={{
          width: `${deviceWidth}px`,
          height: `${deviceHeight}px`,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <iframe
          ref={iframeRef}
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          className="h-full w-full"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Device dimensions indicator */}
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {deviceWidth} × {deviceHeight}px
      </div>
    </div>
  );
}
