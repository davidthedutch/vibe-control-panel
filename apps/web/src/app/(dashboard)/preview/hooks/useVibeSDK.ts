'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  MESSAGE_TYPES,
  createSetModeMessage,
  createUpdateTokenMessage,
  createUpdateTokensBatchMessage,
  createUpdateTextMessage,
  createHighlightComponentMessage,
  createPingMessage,
  isVibeMessage,
  isMessageType,
  type VibeMode,
  type SelectedComponentInfo,
  type TokenUpdate,
} from '@vibe/sdk';

interface UseVibeSDKOptions {
  onElementSelected?: (info: SelectedComponentInfo) => void;
  onSdkReady?: () => void;
}

export function useVibeSDK(options: UseVibeSDKOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [currentMode, setCurrentMode] = useState<VibeMode>('preview');
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponentInfo | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Send a message to the SDK
  const sendMessage = useCallback((message: unknown) => {
    if (!iframeRef.current?.contentWindow) {
      console.warn('Cannot send message: iframe not ready');
      return;
    }

    try {
      // In production, you should specify the target origin explicitly
      iframeRef.current.contentWindow.postMessage(message, '*');
    } catch (error) {
      console.error('Failed to send message to SDK:', error);
    }
  }, []);

  // Set the interaction mode
  const setMode = useCallback(
    (mode: VibeMode) => {
      setCurrentMode(mode);
      sendMessage(createSetModeMessage(mode));
    },
    [sendMessage]
  );

  // Update a single design token
  const updateToken = useCallback(
    (name: string, value: string) => {
      sendMessage(createUpdateTokenMessage(name, value));
    },
    [sendMessage]
  );

  // Update multiple design tokens at once
  const updateTokensBatch = useCallback(
    (tokens: TokenUpdate[]) => {
      sendMessage(createUpdateTokensBatchMessage(tokens));
    },
    [sendMessage]
  );

  // Update text content
  const updateText = useCallback(
    (vibeId: string, fieldId: string, value: string) => {
      if (!selectedComponent) return;
      sendMessage(createUpdateTextMessage(vibeId, fieldId, value));
    },
    [sendMessage, selectedComponent]
  );

  // Highlight a component
  const highlightComponent = useCallback(
    (vibeId: string, highlight: boolean) => {
      sendMessage(createHighlightComponentMessage(vibeId, highlight));
    },
    [sendMessage]
  );

  // Ping the SDK to check connectivity
  const ping = useCallback(() => {
    const startTime = Date.now();
    sendMessage(createPingMessage());
    return startTime;
  }, [sendMessage]);

  // Handle incoming messages from the SDK
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data;

      // Validate that this is a Vibe message
      if (!isVibeMessage(data)) {
        return;
      }

      // Handle different message types
      if (isMessageType(data, MESSAGE_TYPES.SDK_READY)) {
        console.log('Vibe SDK ready:', data.payload);
        setIsReady(true);
        setCurrentMode(data.payload.mode);
        options.onSdkReady?.();
      } else if (isMessageType(data, MESSAGE_TYPES.ELEMENT_SELECTED)) {
        console.log('Element selected:', data.payload);
        setSelectedComponent(data.payload);
        options.onElementSelected?.(data.payload);
      } else if (isMessageType(data, MESSAGE_TYPES.PONG)) {
        const roundTripTime = Date.now() - data.payload.sentAt;
        setLatency(roundTripTime);
        console.log('SDK latency:', roundTripTime, 'ms');
      } else if (isMessageType(data, MESSAGE_TYPES.HEALTH_REPORT)) {
        console.log('Health report received:', data.payload);
        // You could store this in state or pass to a callback
      }
    },
    [options]
  );

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Auto-ping every 10 seconds to check connectivity
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      ping();
    }, 10000);

    return () => clearInterval(interval);
  }, [isReady, ping]);

  return {
    isReady,
    currentMode,
    selectedComponent,
    latency,
    iframeRef,
    setMode,
    updateToken,
    updateTokensBatch,
    updateText,
    highlightComponent,
    ping,
    clearSelection: () => setSelectedComponent(null),
  };
}
