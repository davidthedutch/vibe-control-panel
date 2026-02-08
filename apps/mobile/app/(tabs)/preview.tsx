import { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useThemeColors } from '@/lib/theme';
import type { VibeMessage } from '@vibe/shared';

export default function PreviewScreen() {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('http://localhost:3000'); // Change to your site URL
  const webViewRef = useRef<WebView>(null);
  const colors = useThemeColors();

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message: VibeMessage = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'VIBE_SDK_READY':
          console.log('Vibe SDK is ready');
          // Send initial config to the web app
          sendMessageToWebView({
            type: 'VIBE_SET_MODE',
            payload: { mode: 'mobile' },
            source: 'vibe-panel',
          });
          break;

        case 'VIBE_ELEMENT_SELECTED':
          console.log('Element selected:', message.payload);
          Alert.alert(
            'Element Selected',
            `Component: ${message.payload.componentName || 'Unknown'}`
          );
          break;

        case 'VIBE_HEALTH_REPORT':
          console.log('Health report received:', message.payload);
          break;

        case 'VIBE_PONG':
          console.log('Received pong from website');
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const sendMessageToWebView = (message: VibeMessage) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  const injectedJavaScript = `
    (function() {
      // Listen for messages from React Native
      window.addEventListener('message', (event) => {
        if (typeof event.data === 'string') {
          try {
            const message = JSON.parse(event.data);
            if (message.source === 'vibe-panel') {
              window.postMessage(message, '*');
            }
          } catch (e) {
            console.error('Error parsing message from React Native:', e);
          }
        }
      });

      // Forward Vibe SDK messages to React Native
      const originalPostMessage = window.postMessage;
      window.postMessage = function(message, targetOrigin) {
        if (message && message.source === 'vibe-sdk') {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
        return originalPostMessage.apply(this, arguments);
      };

      // Ping to test connection
      setTimeout(() => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'VIBE_PING',
          payload: { timestamp: Date.now() },
          source: 'vibe-panel'
        }));
      }, 1000);
    })();
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading preview...
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert('Error', 'Failed to load the website. Check your URL and connection.');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
