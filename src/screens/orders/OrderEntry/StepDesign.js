import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../theme';
import { FormSelect } from '../../../components/forms';

// ─────────────────────────────────────────────
// Design category section configuration
// ─────────────────────────────────────────────
const DESIGN_SECTIONS = [
    {
        key: 'blousePattern',
        label: 'Blouse Pattern',
        icon: 'shirt-outline',
        dataKey: 'blousePatterns',
    },
    {
        key: 'frontNeck',
        label: 'Front Neck Outline',
        icon: 'arrow-up-circle-outline',
        dataKey: 'frontNeckDesigns',
    },
    {
        key: 'backNeck',
        label: 'Back Neck Outline',
        icon: 'arrow-down-circle-outline',
        dataKey: 'backNeckDesigns',
    },
    {
        key: 'aariDesign',
        label: 'Aari Design',
        icon: 'sparkles-outline',
        dataKey: 'aariDesigns',
    },
];

// ─────────────────────────────────────────────
// Single design card in the slider
// ─────────────────────────────────────────────
const DesignCard = ({ item, isSelected, onPress }) => (
    <TouchableOpacity
        style={[
            styles.sliderCard,
            isSelected && styles.sliderCardSelected
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={styles.imageContainer}>
                <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.designImage}
                    resizeMode="contain"
                />
            {isSelected && (
                <View style={styles.selectedOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                </View>
            )}
        </View>
        <Text style={[styles.designName, isSelected && styles.designNameSelected]} numberOfLines={1}>
            {item.name}
        </Text>
    </TouchableOpacity>
);

// ─────────────────────────────────────────────
// Category section with title + horizontal slider
// ─────────────────────────────────────────────
const DesignSection = ({ section, items, selectedId, onSelect }) => {
    const isAnySelected = !!selectedId;
    return (
        <View style={styles.sectionContainer}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name={section.icon} size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>{section.label}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    isAnySelected ? styles.statusBadgeSelected : styles.statusBadgeRequired
                ]}>
                    <Text style={[
                        styles.statusBadgeText,
                        isAnySelected ? styles.statusBadgeTextSelected : styles.statusBadgeTextRequired
                    ]}>
                        {isAnySelected ? 'Selected' : 'Required'}
                    </Text>
                </View>
            </View>

            {/* Horizontal Slider */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sliderContent}
                snapToInterval={140} // Card width (120) + margin (20)
                decelerationRate="fast"
            >
                {items.map((item) => (
                    <DesignCard
                        key={item.id}
                        item={item}
                        isSelected={selectedId === item.id}
                        onPress={() => onSelect(section.key, item.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

// ─────────────────────────────────────────────
// StepDesign — main component
// ─────────────────────────────────────────────
const StepDesign = ({
    form,
    handleDesignCategorySelect,
    handleTailorSelect,
    updateForm,
    designTemplates,
    tailors,
}) => {
    if (!designTemplates) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading design templates...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.stepDescription}>
                Select one design from each category. Swipe horizontally to view more options.
            </Text>

            {DESIGN_SECTIONS.map((section) => (
                <DesignSection
                    key={section.key}
                    section={section}
                    items={designTemplates[section.dataKey] || []}
                    selectedId={form.design[section.key]}
                    onSelect={handleDesignCategorySelect}
                />
            ))}

            <View style={styles.footer}>
                <FormSelect
                    label="Assign Tailor"
                    value={form.tailorId}
                    options={tailors.map(t => ({ label: `${t.name} — ${t.specialty}`, value: t.id }))}
                    onSelect={handleTailorSelect}
                    icon="cut-outline"
                />

                <FormSelect
                    label="Priority"
                    value={form.priority}
                    options={[
                        { label: '🔴 High Priority', value: 'high' },
                        { label: '🟡 Medium Priority', value: 'medium' },
                        { label: '🟢 Low Priority', value: 'low' },
                    ]}
                    onSelect={(v) => updateForm('priority', v)}
                    icon="flag-outline"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    stepDescription: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginBottom: SIZES.lg,
        lineHeight: 20,
    },
    sectionContainer: {
        marginBottom: SIZES.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginBottom: SIZES.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: SIZES.radiusFull,
    },
    statusBadgeRequired: {
        backgroundColor: COLORS.bgElevated,
    },
    statusBadgeSelected: {
        backgroundColor: COLORS.primaryMuted,
    },
    statusBadgeText: {
        fontSize: 10,
        ...FONTS.bold,
        textTransform: 'uppercase',
    },
    statusBadgeTextRequired: {
        color: COLORS.textMuted,
    },
    statusBadgeTextSelected: {
        color: COLORS.primary,
    },
    sliderContent: {
        paddingLeft: 4,
        paddingRight: 20,
    },
    sliderCard: {
        width: 120,
        marginRight: SIZES.md,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.bgCard,
        padding: 6,
        borderWidth: 2,
        borderColor: 'transparent',
        ...SHADOWS.small,
    },
    sliderCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryMuted,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: SIZES.radiusSm,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        position: 'relative',
    },
    designImage: {
        width: '100%',
        height: '100%',
    },
    selectedOverlay: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        ...SHADOWS.small,
    },
    designName: {
        fontSize: 11,
        color: COLORS.textPrimary,
        ...FONTS.medium,
        marginTop: 8,
        textAlign: 'center',
    },
    designNameSelected: {
        color: COLORS.primary,
        ...FONTS.semiBold,
    },
    footer: {
        marginTop: SIZES.sm,
    },
});

export default StepDesign;
