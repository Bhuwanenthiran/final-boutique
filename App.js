/**
 * Web-only: Suppress react-native-web internal "pointerEvents" deprecation.
 * RNW 0.21.x emits this from its own TouchableOpacity/Image internals.
 * Our project code does NOT use pointerEvents as a prop.
 * Safe to remove when react-native-web publishes a fix upstream.
 */
if (typeof document !== 'undefined') {
    const origWarn = console.warn;
    console.warn = (...args) => {
        if (typeof args[0] === 'string' && (
            args[0].includes('pointerEvents is deprecated') ||
            args[0].includes('Cannot record touch end')
        )) return;
        origWarn.apply(console, args);
    };
    const origError = console.error;
    console.error = (...args) => {
        if (typeof args[0] === 'string' && (
            args[0].includes('pointerEvents is deprecated') ||
            args[0].includes('Cannot record touch end')
        )) return;
        origError.apply(console, args);
    };
}

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, View, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import AppInitializer from './src/components/AppInitializer';
import { getColors } from './src/theme';
import { useThemeStore } from './src/store/themeStore';

export default function App() {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Preload fonts/icons to prevent "Slow Network" impact & flickers
                await Font.loadAsync(Ionicons.font);

            } catch (e) {
                console.warn('Font loading error:', e);
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);

    if (!isReady) return null; // Or a splash screen

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <StatusBar
                    barStyle={isDark ? "light-content" : "dark-content"}
                    backgroundColor={C.bg}
                    translucent
                />
                <AppInitializer>
                    <AppNavigator />
                </AppInitializer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Safe fall-back
        // On web, we need to ensure the root takes full height and prevent collapse
        ...Platform.select({
            web: {
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
                // Fix "Cannot record touch end" by preventing browser text selection during gestures
                userSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none',
            },
            default: {
                height: '100%',
            }
        })
    }
});

