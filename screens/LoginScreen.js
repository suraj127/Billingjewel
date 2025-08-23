import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
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
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default LoginScreen;
