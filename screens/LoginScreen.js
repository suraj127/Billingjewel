import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('Suraj Bhan Gupta');
  const [upiId, setUpiId] = useState('8383809579@ptsbi');
  const [bankName, setBankName] = useState('Bank of Baroda');
  const [accountLast4, setAccountLast4] = useState('5058');

  const handleLogin = () => {
    if (!name || !upiId || !bankName || !accountLast4) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const senderDetails = { name, upiId, bankName, accountLast4 };
    navigation.navigate('PaymentEntry', { senderDetails });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Your Details</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="UPI ID"
        value={upiId}
        onChangeText={setUpiId}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Bank Name"
        value={bankName}
        onChangeText={setBankName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Last 4 digits of bank account"
        value={accountLast4}
        onChangeText={setAccountLast4}
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        icon="arrow-right-circle-outline"
      >
        Continue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default LoginScreen;
