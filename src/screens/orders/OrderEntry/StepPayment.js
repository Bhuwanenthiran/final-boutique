import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme';
import { FormInput } from '../../../components/forms';
import { Card } from '../../../components/common';

const StepPayment = ({ form, updateForm, styles }) => {
    return (
        <View>
            <Text style={styles.stepDescription}>Enter payment details and delivery date</Text>

            <FormInput
                label="Delivery Date"
                value={form.deliveryDate}
                onChangeText={(v) => updateForm('deliveryDate', v)}
                placeholder="YYYY-MM-DD"
                icon="calendar-outline"
                required
            />

            <Card style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                    <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.paymentTitle}>Payment Details</Text>
                </View>

                <FormInput
                    label="Total Amount"
                    value={form.totalAmount}
                    onChangeText={(v) => updateForm('totalAmount', v)}
                    placeholder="₹ 0"
                    keyboardType="decimal-pad"
                    required
                />
                <FormInput
                    label="Advance Amount"
                    value={form.advanceAmount}
                    onChangeText={(v) => updateForm('advanceAmount', v)}
                    placeholder="₹ 0"
                    keyboardType="decimal-pad"
                />

                {form.totalAmount && (
                    <View style={styles.balanceSummary}>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Total</Text>
                            <Text style={styles.balanceValue}>₹{parseFloat(form.totalAmount || 0).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Advance</Text>
                            <Text style={[styles.balanceValue, { color: COLORS.success }]}>−₹{parseFloat(form.advanceAmount || 0).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={[styles.balanceRow, styles.balanceFinal]}>
                            <Text style={styles.balanceFinalLabel}>Balance Due</Text>
                            <Text style={styles.balanceFinalValue}>
                                ₹{((parseFloat(form.totalAmount || 0)) - (parseFloat(form.advanceAmount || 0))).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </View>
                )}
            </Card>
        </View>
    );
};

export default StepPayment;
