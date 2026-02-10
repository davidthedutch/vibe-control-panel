'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import PreviewFrame from './components/PreviewFrame';
import ModeSwitch, { type PreviewMode } from './components/ModeSwitch';
import DeviceSwitch, { DEVICE_SIZES, type DeviceType } from './components/DeviceSwitch';
import EditPanel from './components/EditPanel';
import { useVibeSDK } from './hooks/useVibeSDK';
import { getProject } from '@vibe/shared/lib/api';

// For demo purposes, you can configure the project ID here
// In a real app, this would come from a context provider or route params
const PROJECT_ID = 'demo-project-id';

export default function PreviewPage() {
  const [projectUrl, setProjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PreviewMode>('preview');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showEditPanel, setShowEditPanel] = useState(false);

  const {
    isReady,
    currentMode,
    selectedComponent,
    latency,
    iframeRef,
    setMode: setSDKMode,
    updateToken,
    updateText,
    clearSelection,
  } = useVibeSDK({
    onElementSelected: (info) => {
      console.log('Component selected:', info);
      if (mode === 'edit') {
        setShowEditPanel(true);
      }
    },
    onSdkReady: () => {
      console.log('SDK is ready for interaction');
    },
  });

  // Load project data
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const response = await getProject(PROJECT_ID);

        if (response.error || !response.data) {
          // Fallback: use current origin or configured URL
          const fallbackUrl =
            typeof window !== 'undefined'
              ? window.location.origin
              : 'http://localhost:3000';
          setProjectUrl(fallbackUrl);
          setLoading(false);
          return;
        }

        // Get the preview URL from project
        const url =
          response.data?.urls.development ||
          response.data?.urls.staging ||
          response.data?.urls.production;

        if (!url) {
          const fallbackUrl =
            typeof window !== 'undefined'
              ? window.location.origin
              : 'http://localhost:3000';
          setProjectUrl(fallbackUrl);
          setLoading(false);
          return;
        }

        setProjectUrl(url);
        setLoading(false);
      } catch (err) {
        // Fallback on any error
        const fallbackUrl =
          typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:3000';
        setProjectUrl(fallbackUrl);
        setLoading(false);
      }
    }

    loadProject();
  }, []);

  // Sync mode changes with SDK
  useEffect(() => {
    if (isReady && mode !== currentMode) {
      setSDKMode(mode as any); // Cast to VibeMode (they're compatible)
    }
  }, [mode, currentMode, isReady, setSDKMode]);

  // Handle mode changes
  const handleModeChange = (newMode: PreviewMode) => {
    setMode(newMode);
    if (newMode === 'preview') {
      setShowEditPanel(false);
      clearSelection();
    }
  };

  // Handle text updates
  const handleUpdateText = (fieldId: string, value: string) => {
    if (!selectedComponent) return;
    updateText(selectedComponent.vibeId, fieldId, value);
  };

  // Handle token updates
  const handleUpdateToken = (name: string, value: string) => {
    updateToken(name, value);
  };

  // Handle AI suggestion
  const handleAISuggestion = () => {
    // In a real implementation, this would:
    // 1. Gather current component state
    // 2. Send to an AI endpoint
    // 3. Apply suggestions
    alert(
      'AI Suggestion would analyze the selected component and provide design improvements based on best practices and design tokens.'
    );
  };

  // Handle save
  const handleSave = () => {
    if (!selectedComponent) return;

    // In a real implementation, this would:
    // 1. Collect all changes made
    // 2. Generate a prompt describing the changes
    // 3. Save to the database via the API
    const prompt = generatePromptFromChanges(selectedComponent);
    console.log('Generated prompt:', prompt);

    alert(`Changes saved! Generated prompt:\n\n${prompt}\n\nThis would be sent to the Prompts API.`);
  };

  // Generate prompt from changes
  const generatePromptFromChanges = (component: any) => {
    return `Update ${component.name || component.tagName} component:
- File: ${component.file}:${component.line}
- Modified text fields and styling
- Applied design token updates for consistency

Changes made via Vibe Control Panel Preview tab.`;
  };

  // Handle close edit panel
  const handleCloseEditPanel = () => {
    setShowEditPanel(false);
    clearSelection();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500 dark:border-slate-600 dark:border-t-blue-400"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !projectUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Unable to Load Preview
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error || 'No preview URL configured'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Configure a development, staging, or production URL in your project settings.
          </p>
        </div>
      </div>
    );
  }

  const deviceSize = DEVICE_SIZES[device];

  return (
    <div className="flex h-full flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <ModeSwitch mode={mode} onChange={handleModeChange} />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <DeviceSwitch device={device} onChange={setDevice} />
        </div>

        <div className="flex items-center gap-4">
          {/* SDK Status */}
          <div className="flex items-center gap-2 text-sm">
            {isReady ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  Connected {latency !== null && `(${latency}ms)`}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Connecting...</span>
              </>
            )}
          </div>

          {/* Project URL */}
          <div className="hidden lg:flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 dark:bg-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">URL:</span>
            <span className="text-xs text-slate-700 dark:text-slate-300">{projectUrl}</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview frame */}
        <div className="flex-1">
          <PreviewFrame
            url={projectUrl}
            deviceWidth={deviceSize.width}
            deviceHeight={deviceSize.height}
            onMessage={(event) => {
              // Messages are handled by the useVibeSDK hook
            }}
            onReady={(ready) => {
              console.log('Preview frame ready:', ready);
            }}
          />
        </div>

        {/* Edit panel (shown in edit mode when component is selected) */}
        {showEditPanel && mode === 'edit' && (
          <EditPanel
            selectedComponent={selectedComponent}
            onClose={handleCloseEditPanel}
            onUpdateText={handleUpdateText}
            onUpdateToken={handleUpdateToken}
            onAISuggestion={handleAISuggestion}
            onSave={handleSave}
          />
        )}
      </div>

      {/* Bottom info bar */}
      {mode !== 'preview' && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {mode === 'select' && 'Hover over components to highlight them'}
          {mode === 'edit' && 'Click on a component to edit its properties'}
          {selectedComponent && (
            <span className="ml-4 font-medium">
              Selected: {selectedComponent.name || selectedComponent.tagName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
