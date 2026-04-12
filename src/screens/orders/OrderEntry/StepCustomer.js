import React from 'react';
import { View, Text } from 'react-native';
import { FormInput } from '../../../components/forms';

const StepCustomer = ({ form, updateForm, styles }) => {
    return (
        <View>
            <Text style={styles.stepDescription}>Enter the customer's details for this order</Text>
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
