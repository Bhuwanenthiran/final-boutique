import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, getColors } from '../../../theme';
import { useThemeStore } from '../../../store/themeStore';
import { useOrderStore } from '../../../store/orderStore';
import { FormButton } from '../../../components/forms';
import { LoadingOverlay, ErrorOverlay, ScreenWrapper } from '../../../components/common';

// Sub-components
import StepCustomer from './StepCustomer';
import StepDesign from './StepDesign';
import StepMeasurements, { getEmptyMeasurements, REQUIRED_MEASUREMENT_KEYS } from './StepMeasurements';
import StepPayment from './StepPayment';
import styles from './orderEntryStyles';
import AnimatedProgressBar from '../../../components/animations/AnimatedProgressBar';

const STEPS = ['Customer', 'Design', 'Measurements', 'Payment & Delivery'];

const OrderEntryContainer = ({ navigation }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0);
    const designTemplates = useOrderStore((s) => s.designTemplates);
    const tailors = useOrderStore((s) => s.tailors);

    const addOrder = useOrderStore((s) => s.addOrder);
    const saveDraft = useOrderStore((s) => s.saveDraft);
    const draftOrder = useOrderStore((s) => s.draftOrder);
    const isLoading = useOrderStore((s) => s.isLoading);
    const error = useOrderStore((s) => s.error);
    const clearError = useOrderStore((s) => s.clearError);

    const [form, setForm] = useState(draftOrder || {
        customerId: '',
        customerName: '',
        phone: '',
        design: {
            blousePattern: null,
            frontNeck: null,
            backNeck: null,
            aariDesign: null,
        },
        measurements: getEmptyMeasurements(),
        deliveryDate: '',
        totalAmount: '',
        advanceAmount: '',
        notes: '',
        tailorId: '',
        tailorName: '',
        priority: 'medium',
    });

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCustomerSelect = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            // Batch all three in one update so form state is always consistent
            setForm(prev => ({
                ...prev,
                customerId,
                customerName: customer.name || '',
                phone: customer.phone || '',
            }));
        }
    };

    const handleDesignCategorySelect = (category, itemId) => {
        setForm(prev => ({
            ...prev,
            design: { ...prev.design, [category]: itemId },
        }));
    };

    const handleTailorSelect = (tailorId) => {
        const tailor = tailors.find(t => t.id === tailorId);
        if (tailor) {
            updateForm('tailorId', tailorId);
            updateForm('tailorName', tailor.name);
        }
    };

    const handleMeasurementChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            measurements: { ...prev.measurements, [field]: value },
        }));
    };

    const canProceed = () => {
        if (isLoading) return false;
        switch (step) {
            case 0: return form.customerName.length > 0;
            case 1: {
                const { blousePattern, frontNeck, backNeck, aariDesign } = form.design;
                return !!(blousePattern && frontNeck && backNeck && aariDesign);
            }
            case 2: {
                const m = form.measurements;
                return REQUIRED_MEASUREMENT_KEYS.every(key => m[key] && m[key].trim().length > 0);
            }
            case 3: return form.totalAmount.length > 0 && form.deliveryDate.length > 0;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        const totalAmt = parseFloat(form.totalAmount) || 0;
        const advanceAmt = parseFloat(form.advanceAmount) || 0;
        const order = {
            ...form,
            totalAmount: totalAmt,
            advanceAmount: advanceAmt,
            balanceAmount: totalAmt - advanceAmt,
            status: 'Pending',
            productionStage: 'pending',
        };

        try {
            await addOrder(order);
            if (Platform.OS === 'web') {
                window.alert('Order created successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Success', 'Order created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            // Error overlay handled by store state
        }
    };

    const handleSaveDraft = () => {
        saveDraft(form);
        if (Platform.OS === 'web') {
            window.alert('Draft saved successfully!');
        } else {
            Alert.alert('Saved', 'Draft saved successfully!');
        }
    };



    const renderStepContent = () => {
        const commonProps = { form, updateForm, styles, isLoading };
        switch (step) {
            case 0:
                return (
                    <StepCustomer
                        {...commonProps}
                    />
                );
            case 1:
                return (
                    <StepDesign
                        {...commonProps}
                        designTemplates={designTemplates}
                        tailors={tailors}
                        handleDesignCategorySelect={handleDesignCategorySelect}
                        handleTailorSelect={handleTailorSelect}
                    />
                );
            case 2:
                return (
                    <StepMeasurements
                        {...commonProps}
                        handleMeasurementChange={handleMeasurementChange}
                    />
                );
            case 3:
                return <StepPayment {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <ScreenWrapper useSafeTop useSafeBottom={false}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: C.bg }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LoadingOverlay visible={isLoading && !error} message="Creating order..." />
                <ErrorOverlay
                    visible={!!error}
                    error={error}
                    onRetry={handleSubmit}
                    onClose={clearError}
                />
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isLoading}>
                        <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: C.textPrimary }]}>New Order</Text>
                    <TouchableOpacity onPress={handleSaveDraft} style={styles.draftBtn} disabled={isLoading}>
                        <Ionicons name="bookmark-outline" size={18} color={C.primary} />
                        <Text style={[styles.draftText, { color: C.primary }]}>Draft</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Indicator */}
                <AnimatedProgressBar progress={step} totalSteps={STEPS.length} />

                <View style={styles.progressContainer}>
                    {STEPS.map((s, idx) => (
                        <View key={idx} style={styles.progressStep}>
                            <View style={[
                                styles.progressDot,
                                { backgroundColor: C.bgElevated, borderColor: C.border },
                                idx < step && [styles.progressDotCompleted, { backgroundColor: C.success, borderColor: C.success }],
                                idx === step && [styles.progressDotActive, { backgroundColor: C.primary, borderColor: C.primary }],
                            ]}>
                                {idx < step ? (
                                    <Ionicons name="checkmark" size={12} color={C.textOnPrimary} />
                                ) : (
                                    <Text style={[styles.progressNum, { color: C.textMuted }, idx === step && { color: C.textOnPrimary }]}>{idx + 1}</Text>
                                )}
                            </View>
                            <Text style={[styles.progressLabel, { color: C.textMuted }, idx === step && [styles.progressLabelActive, { color: C.primary }]]}>{s}</Text>
                        </View>
                    ))}
                </View>

                {/* Step Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentInner}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.stepTitle}>{STEPS[step]}</Text>
                    {renderStepContent()}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom Bar */}
                <View style={[styles.bottomBar, { backgroundColor: C.bgCard, borderTopColor: C.borderLight, paddingBottom: insets.bottom > 0 ? insets.bottom : SIZES.md }]}>
                    {step > 0 && (
                        <FormButton
                            title="Back"
                            variant="outline"
                            icon="arrow-back-outline"
                            onPress={() => setStep(step - 1)}
                            size="medium"
                            disabled={isLoading}
                        />
                    )}
                    <View style={{ flex: 1, marginLeft: step > 0 ? SIZES.sm : 0 }}>
                        {step < STEPS.length - 1 ? (
                            <FormButton
                                title="Continue"
                                icon="arrow-forward-outline"
                                onPress={() => setStep(step + 1)}
                                disabled={!canProceed()}
                            />
                        ) : (
                            <FormButton
                                title="Create Order"
                                icon="checkmark-circle-outline"
                                onPress={handleSubmit}
                                disabled={!canProceed()}
                                loading={isLoading}
                            />
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default OrderEntryContainer;
