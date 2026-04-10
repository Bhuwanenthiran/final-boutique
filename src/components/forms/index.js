import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Platform, Modal, ScrollView, Keyboard, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';

// Optional Haptics
let Haptics;
try {
    Haptics = require('expo-haptics');
} catch (e) {
    Haptics = null;
}

export const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, error, icon, required, editable = true, secureTextEntry = false, autoCapitalize = 'sentences' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.inputGroup}>
            {label && (
                <View style={styles.labelRow}>
                    {icon && <Ionicons name={icon} size={14} color={C.primary} style={{ marginRight: 6 }} />}
                    <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
                    {required && <Text style={[styles.required, { color: C.error }]}>*</Text>}
                </View>
            )}
            <View style={[
                styles.inputWrap,
                { backgroundColor: C.bgElevated, borderColor: C.border },
                error && { borderColor: C.error },
                !editable && styles.inputDisabled
            ]}>
                <TextInput
                    style={[styles.input, { color: C.textPrimary }, multiline && styles.inputMultiline]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={C.textLight}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    editable={editable}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: C.error }]}>{error}</Text>}
        </View>
    );
};

export const FormButton = ({ title, onPress, variant = 'primary', icon, disabled, loading, size = 'medium', haptic = 'light' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isSmall = size === 'small';

    const handlePress = () => {
        if (Haptics && Platform.OS !== 'web') {
            if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (haptic === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onPress && onPress();
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary && [styles.buttonPrimary, { backgroundColor: C.primary }],
                isOutline && [styles.buttonOutline, { borderColor: C.primary }],
                isGhost && styles.buttonGhost,
                isSmall && styles.buttonSmall,
                disabled && styles.buttonDisabled,
            ]}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.buttonText, { color: isPrimary ? C.textOnPrimary : C.primary, marginRight: 8 }]}>Processing</Text>
                </View>
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={isSmall ? 16 : 18} color={isPrimary ? C.textOnPrimary : C.primary} style={{ marginRight: SIZES.sm }} />}
                    <Text style={[
                        styles.buttonText,
                        isPrimary && { color: C.textOnPrimary },
                        isOutline && { color: C.primary },
                        isGhost && { color: C.primary },
                        isSmall && styles.buttonTextSmall,
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export const FormSelect = ({ label, value, options, onSelect, icon, required, addNewLabel, onAddNew }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [triggerLayout, setTriggerLayout] = React.useState(null);
    const triggerRef = React.useRef(null);

    const isSearchable = options.length > 5;
    const selectedLabel = options.find(o => o.value === value)?.label || 'Select...';
    const filtered = isSearchable && search.trim()
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    const openDropdown = () => {
        Keyboard.dismiss();
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            // Adjust y for Android status bar if needed, 
            // but statusBarTranslucent in Modal usually handles this.
            setTriggerLayout({ x, y, width, height });
            setOpen(true);
        });
    };

    const handleSelect = (val) => {
        onSelect(val);
        setOpen(false);
        setSearch('');
    };

    const handleClose = () => {
        setOpen(false);
        setSearch('');
    };

    return (
        <View style={styles.inputGroup}>
            {label && (
                <View style={styles.labelRow}>
                    {icon && <Ionicons name={icon} size={14} color={C.primary} style={{ marginRight: 6 }} />}
                    <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
                    {required && <Text style={[styles.required, { color: C.error }]}>*</Text>}
                </View>
            )}

            <TouchableOpacity
                ref={triggerRef}
                style={[styles.selectWrap, { backgroundColor: C.bgCard, borderColor: C.border }]}
                onPress={openDropdown}
                activeOpacity={0.8}
            >
                <Text style={[styles.selectText, { color: C.textPrimary }, !value && { color: C.textLight }]} numberOfLines={1}>
                    {selectedLabel}
                </Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={C.textMuted} />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
                statusBarTranslucent
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.dropdownContainer,
                            { backgroundColor: C.bgCard, borderColor: C.border },
                            triggerLayout && (() => {
                                const dropdownMaxHeight = 280; // Estimated max height
                                const spaceBelow = screenHeight - (triggerLayout.y + triggerLayout.height) - insets.bottom - 20;
                                const showAbove = spaceBelow < dropdownMaxHeight;

                                return {
                                    position: 'absolute',
                                    left: triggerLayout.x,
                                    width: triggerLayout.width,
                                    ...(showAbove ? {
                                        bottom: screenHeight - triggerLayout.y + 6,
                                    } : {
                                        top: triggerLayout.y + triggerLayout.height + 6,
                                    })
                                };
                            })(),
                        ]}
                    >
                        {isSearchable && (
                            <View style={[styles.dropdownSearch, { borderBottomColor: C.border, backgroundColor: C.bgCard }]}>
                                <Ionicons name="search-outline" size={16} color={C.textMuted} />
                                <TextInput
                                    style={[styles.dropdownSearchInput, { color: C.textPrimary }]}
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Search..."
                                    placeholderTextColor={C.textLight}
                                    autoFocus
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch('')}>
                                        <Ionicons name="close-circle" size={16} color={C.textMuted} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <ScrollView
                            style={{ maxHeight: 220 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                        >
                            {filtered.length === 0 ? (
                                <View style={styles.dropdownEmpty}>
                                    <Ionicons name="search-outline" size={24} color={COLORS.textMuted} />
                                    <Text style={styles.dropdownEmptyText}>No results found</Text>
                                </View>
                            ) : (
                                filtered.map((opt, idx) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.dropdownItem,
                                            { borderBottomColor: C.borderLight },
                                            value === opt.value && [styles.dropdownItemActive, { backgroundColor: C.primaryMuted }],
                                            idx === filtered.length - 1 && !addNewLabel && styles.dropdownItemLast,
                                        ]}
                                        onPress={() => handleSelect(opt.value)}
                                        activeOpacity={0.65}
                                    >
                                        <Text
                                            style={[styles.dropdownText, { color: C.textPrimary }, value === opt.value && [styles.dropdownTextActive, { color: C.primary }]]}
                                            numberOfLines={1}
                                        >
                                            {opt.label}
                                        </Text>
                                        {value === opt.value && (
                                            <Ionicons name="checkmark-circle" size={16} color={C.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>

                        {addNewLabel && onAddNew && (
                            <TouchableOpacity
                                style={[styles.dropdownAddNew, { borderTopColor: C.border, backgroundColor: C.primaryMuted }]}
                                onPress={() => { handleClose(); onAddNew(); }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add-circle-outline" size={16} color={C.primary} />
                                <Text style={[styles.dropdownAddNewText, { color: C.primary }]}>{addNewLabel}</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export const FormToggle = ({ label, value, onToggle, description }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: C.textPrimary }]}>{label}</Text>
                {description && <Text style={[styles.toggleDesc, { color: C.textMuted }]}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: C.border, true: C.primarySoft }}
                thumbColor={value ? C.primary : C.textLight}
            />
        </View>
    );
};

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={[styles.searchBar, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <Ionicons name="search-outline" size={18} color={C.textMuted} />
            <TextInput
                style={[styles.searchInput, { color: C.textPrimary }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={C.textLight}
            />
            {value ? (
                <TouchableOpacity onPress={() => onChangeText('')}>
                    <Ionicons name="close-circle" size={18} color={C.textMuted} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export const FilterChip = ({ label, active, onPress }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
            bounciness: 4
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 4
        }).start();
    };

    const handlePress = () => {
        if (Haptics && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress && onPress();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                style={[
                    styles.chip,
                    { backgroundColor: C.bgElevated, borderColor: C.border },
                    active && [styles.chipActive, { backgroundColor: C.primary, borderColor: C.primary }]
                ]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <Text style={[
                    styles.chipText,
                    { color: C.textSecondary },
                    active && [styles.chipTextActive, { color: '#1A1612' }]
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: SIZES.base,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    label: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    required: {
        color: COLORS.error,
        marginLeft: 4,
        fontSize: SIZES.body,
    },
    inputWrap: {
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    input: {
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.md,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.regular,
    },
    inputMultiline: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: SIZES.caption,
        color: COLORS.error,
        marginTop: 4,
        ...FONTS.regular,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.md + 2,
        paddingHorizontal: SIZES.xl,
        borderRadius: SIZES.radiusMd,
        marginVertical: SIZES.xs,
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.golden,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    buttonGhost: {
        backgroundColor: 'transparent',
    },
    buttonSmall: {
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.base,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: SIZES.body,
        ...FONTS.semiBold,
    },
    buttonTextPrimary: {
        color: COLORS.textOnPrimary,
    },
    buttonTextOutline: {
        color: COLORS.primary,
    },
    buttonTextGhost: {
        color: COLORS.primary,
    },
    buttonTextSmall: {
        fontSize: SIZES.small,
    },
    selectWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SIZES.base,
        paddingVertical: 14,
        marginBottom: 2,
    },
    selectText: {
        flex: 1,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        fontWeight: '500',
        letterSpacing: 0.1,
        marginRight: SIZES.sm,
    },
    // Modal Dropdown
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(45, 35, 25, 0.15)',
    },
    dropdownContainer: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: `0px 12px 28px rgba(45, 35, 25, 0.1)` },
            default: {
                shadowColor: COLORS.shadowColor,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.1,
                shadowRadius: 28,
                elevation: 12,
            }
        }),
    },
    dropdownSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.base,
        paddingVertical: SIZES.md,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.bgCard,
    },
    dropdownSearchInput: {
        flex: 1,
        marginLeft: SIZES.sm,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        paddingVertical: SIZES.xs,
        fontWeight: '400',
        letterSpacing: 0.2,
    },
    dropdownEmpty: {
        alignItems: 'center',
        paddingVertical: SIZES.xl,
        paddingHorizontal: SIZES.lg,
    },
    dropdownEmptyText: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: SIZES.sm,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.base,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.borderLight,
    },
    dropdownItemActive: {
        backgroundColor: COLORS.primaryMuted,
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownText: {
        flex: 1,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        fontWeight: '400',
        letterSpacing: 0.15,
        marginRight: SIZES.sm,
    },
    dropdownTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
    dropdownAddNew: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.base,
        paddingVertical: 15,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.primaryMuted,
    },
    dropdownAddNewText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        fontWeight: '600',
        letterSpacing: 0.2,
        marginLeft: SIZES.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SIZES.md,
        marginBottom: SIZES.sm,
    },
    toggleLabel: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    toggleDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginHorizontal: SIZES.lg,
        marginVertical: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        marginLeft: SIZES.sm,
        paddingVertical: SIZES.xs,
        ...FONTS.regular,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 22,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 10,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        ...FONTS.medium,
        letterSpacing: 0.1,
    },
    chipTextActive: {
        color: '#1A1612',
        ...FONTS.semiBold,
    },
});
