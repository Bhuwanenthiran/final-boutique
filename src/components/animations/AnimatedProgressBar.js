import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { COLORS, SIZES } from '../../theme';

/**
 * Premium Animated Progress Bar
 * Uses React Native's built-in Animated API — works with Expo Go, no extra deps.
 */
const AnimatedProgressBar = ({ progress, totalSteps }) => {
    const widthAnim = useRef(new Animated.Value(0)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const targetWidth = (progress / (totalSteps - 1)) * 100;
        Animated.parallel([
            Animated.spring(widthAnim, {
                toValue: targetWidth,
                damping: 20,
                stiffness: 90,
                useNativeDriver: false,
            }),
            Animated.spring(colorAnim, {
                toValue: targetWidth,
                damping: 20,
                stiffness: 90,
                useNativeDriver: false,
            }),
        ]).start();
    }, [progress, totalSteps]);

    const widthInterpolated = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    const backgroundColorInterpolated = colorAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [COLORS.primaryLight || '#a78bfa', COLORS.success || '#22c55e'],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <View style={styles.track}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            width: widthInterpolated,
                            backgroundColor: backgroundColorInterpolated,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 6,
        paddingHorizontal: SIZES.lg,
        marginVertical: SIZES.md,
    },
    track: {
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    },
});

export default AnimatedProgressBar;
