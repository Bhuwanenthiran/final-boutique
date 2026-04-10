import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';
import { FormInput, FormButton } from '../../components/forms';
import { useAuthStore } from '../../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorOverlay, ScreenWrapper } from '../../components/common';

const LoginScreen = () => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const insets = useSafeAreaInsets();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [fieldError, setFieldError] = React.useState(null);
    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);
    const error = useAuthStore((s) => s.error);
    const clearError = useAuthStore((s) => s.clearError);

    const handleLogin = async () => {
        if (isLoading) return;
        setFieldError(null);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setFieldError('Please enter both email and password.');
            return;
        }

        try {
            await login(trimmedEmail, trimmedPassword);
        } catch {
            // Error is displayed via the store's ErrorOverlay
        }
    };

    return (
        <ScreenWrapper useSafeTop>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: C.bg }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ErrorOverlay
                    visible={!!(error || fieldError)}
                    error={error || fieldError}
                    onRetry={error ? handleLogin : null}
                    onClose={() => { clearError(); setFieldError(null); }}
                />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo & Branding */}
                    <View style={styles.header}>
                        <View style={[styles.logoWrap, { backgroundColor: C.primaryMuted }]}>
                            <Ionicons name="diamond-outline" size={48} color={C.primary} />
                        </View>
                        <Text style={[styles.title, { color: C.textPrimary }]}>Mellinam Designer Studio</Text>
                        <Text style={[styles.subtitle, { color: C.textMuted }]}>Management System</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.form}>
                        <FormInput
                            label="Email Address"
                            value={email}
                            onChangeText={(v) => { setEmail(v); setFieldError(null); }}
                            placeholder="admin@mellinamdesignerstudio.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon="mail-outline"
                            editable={!isLoading}
                        />
                        <FormInput
                            label="Password"
                            value={password}
                            onChangeText={(v) => { setPassword(v); setFieldError(null); }}
                            placeholder="••••••••"
                            secureTextEntry
                            icon="lock-closed-outline"
                            editable={!isLoading}
                        />

                        <TouchableOpacity style={styles.forgotPass} disabled={isLoading}>
                            <Text style={[styles.forgotPassText, { color: C.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <FormButton
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginBtn}
                        />

                        <View style={styles.dividerWrap}>
                            <View style={[styles.divider, { backgroundColor: C.border }]} />
                            <Text style={[styles.dividerText, { color: C.textMuted }]}>OR</Text>
                            <View style={[styles.divider, { backgroundColor: C.border }]} />
                        </View>

                        <View style={styles.demoLoginWrap}>
                            <Text style={[styles.demoText, { color: C.textMuted }]}>Testing Credentials:</Text>
                            <View style={styles.demoRow}>
                                <TouchableOpacity
                                    style={[styles.demoChip, { backgroundColor: C.bgElevated, borderColor: C.border }]}
                                    onPress={() => { setEmail('admin@atelier.com'); setPassword('admin123'); setFieldError(null); clearError(); }}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.demoChipText, { color: C.textSecondary }]}>Admin Login</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.demoChip, { backgroundColor: C.bgElevated, borderColor: C.border }]}
                                    onPress={() => { setEmail('staff@mellinamdesignerstudio.com'); setPassword('staff123'); setFieldError(null); clearError(); }}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.demoChipText, { color: C.textSecondary }]}>Staff Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Footer - No longer absolute, moves with content */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: C.textMuted }]}>Secure Login Powered by</Text>
                        <Text style={[styles.footerBrand, { color: C.textSecondary }]}>Studio Excellence</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: SIZES.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SIZES.xxxl,
    },
    logoWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.lg,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 4,
    },
    form: {
        width: '100%',
    },
    forgotPass: {
        alignSelf: 'flex-end',
        marginBottom: SIZES.xl,
    },
    forgotPassText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
    },
    loginBtn: {
        height: 56,
        borderRadius: SIZES.radiusLg,
    },
    dividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SIZES.xxl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        marginHorizontal: SIZES.md,
        ...FONTS.medium,
    },
    demoLoginWrap: {
        alignItems: 'center',
    },
    demoText: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        marginBottom: SIZES.sm,
        ...FONTS.regular,
    },
    demoRow: {
        flexDirection: 'row',
    },
    demoChip: {
        backgroundColor: COLORS.bgElevated,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs + 2,
        borderRadius: SIZES.radiusMd,
        marginHorizontal: SIZES.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    demoChipText: {
        fontSize: 10,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    footer: {
        marginTop: SIZES.xxxl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 10,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    footerBrand: {
        fontSize: 12,
        color: COLORS.textSecondary,
        ...FONTS.semiBold,
        marginTop: 2,
    },
});

export default LoginScreen;
