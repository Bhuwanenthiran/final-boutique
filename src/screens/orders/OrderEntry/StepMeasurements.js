import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../theme';
import { FormInput } from '../../../components/forms';

/**
 * Boutique-specific measurement fields, grouped logically.
 */
const MEASUREMENT_GROUPS = [
    {
        title: 'Upper Body',
        icon: 'body-outline',
        fields: [
            { key: 'length', label: 'Length', required: true },
            { key: 'shoulder', label: 'Shoulder', required: true },
            { key: 'bust', label: 'Bust', required: true },
            { key: 'upperChest', label: 'Upper Chest' },
            { key: 'hip', label: 'Hip' },
            { key: 'frontLength', label: 'Front Length' },
            { key: 'dart', label: 'Dart' },
            { key: 'armhole', label: 'Armhole' },
            { key: 'biceps', label: 'Biceps' },
        ],
    },
    {
        title: 'Sleeve',
        icon: 'resize-outline',
        fields: [
            { key: 'sleeveLength', label: 'Sleeve Length', required: true },
            { key: 'sleeveFit', label: 'Sleeve Fit' },
        ],
    },
    {
        title: 'Neck',
        icon: 'ellipse-outline',
        fields: [
            { key: 'frontNeckDeep', label: 'Front Neck Deep' },
            { key: 'backNeckDeep', label: 'Back Neck Deep' },
        ],
    },
];

/**
 * Returns a flat list of all required measurement keys.
 */
export const REQUIRED_MEASUREMENT_KEYS = MEASUREMENT_GROUPS
    .flatMap(g => g.fields)
    .filter(f => f.required)
    .map(f => f.key);

/**
 * Returns an empty measurement object with all keys initialized.
 */
export const getEmptyMeasurements = () => {
    const m = {};
    MEASUREMENT_GROUPS.forEach(g => g.fields.forEach(f => { m[f.key] = ''; }));
    return m;
};

/**
 * Sanitizes input to only allow valid decimal numbers.
 */
const sanitizeNumeric = (value) => {
    // Allow digits and at most one decimal point
    let sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    return sanitized;
};

const StepMeasurements = ({ form, handleMeasurementChange, updateForm, styles }) => {
    return (
        <View>
            <Text style={styles.stepDescription}>
                Enter measurements in inches. Fields marked with * are required.
            </Text>

            {MEASUREMENT_GROUPS.map((group) => (
                <View key={group.title} style={groupStyles.section}>
                    {/* Group Header */}
                    <View style={groupStyles.sectionHeader}>
                        <Ionicons name={group.icon} size={18} color={COLORS.primary} />
                        <Text style={groupStyles.sectionTitle}>{group.title}</Text>
                    </View>

                    {/* Fields Grid */}
                    <View style={styles.measurementGrid}>
                        {group.fields.map((field) => (
                            <View key={field.key} style={styles.measurementItem}>
                                <FormInput
                                    label={field.required ? `${field.label} *` : field.label}
                                    value={form.measurements[field.key] || ''}
                                    onChangeText={(v) => handleMeasurementChange(field.key, sanitizeNumeric(v))}
                                    placeholder="0"
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            <FormInput
                label="Special Notes"
                value={form.notes}
                onChangeText={(v) => updateForm('notes', v)}
                placeholder="Any special instructions..."
                multiline
                icon="document-text-outline"
            />
        </View>
    );
};



const groupStyles = StyleSheet.create({
    section: {
        marginBottom: SIZES.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
        paddingBottom: SIZES.xs,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    sectionTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginLeft: SIZES.sm,
    },
});

export default StepMeasurements;
