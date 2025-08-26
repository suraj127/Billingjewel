import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getSetting } from '../db';

const LoginScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');

  const handleLogin = async () => {
    try {
      const storedPin = await getSetting('pin');
      if (pin === storedPin) {
        navigation.replace('PriceEntry');
      } else {
        Alert.alert('Error', 'Invalid PIN.');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to login.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Login</Text>
      <TextInput
        label="PIN"
        value={pin}
        onChangeText={setPin}
        style={styles.input}
        keyboardType="numeric"
        secureTextEntry
        mode="outlined"
        testID="pin-input"
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        icon="login"
        testID="login-button"
      >
        Login
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
