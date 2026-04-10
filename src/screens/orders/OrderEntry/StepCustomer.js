import React from 'react';
import { View, Text } from 'react-native';
import { FormInput, FormSelect } from '../../../components/forms';

const StepCustomer = ({ form, updateForm, handleCustomerSelect, customers, styles }) => {
    return (
        <View>
            <Text style={styles.stepDescription}>Select an existing customer or enter new details</Text>
            <FormSelect
                label="Existing Customer"
                value={form.customerId}
                options={customers.map(c => ({ label: c.name, value: c.id }))}
                onSelect={handleCustomerSelect}
                icon="person-outline"
            />
            <View style={styles.dividerWrap}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or enter manually</Text>
                <View style={styles.dividerLine} />
            </View>
            <FormInput
                label="Customer Name"
                value={form.customerName}
                onChangeText={(v) => updateForm('customerName', v)}
                placeholder="Enter customer name"
                icon="person-outline"
                required
            />
            <FormInput
                label="Phone Number"
                value={form.phone}
                onChangeText={(v) => updateForm('phone', v)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                icon="call-outline"
            />
        </View>
    );
};

export default StepCustomer;
