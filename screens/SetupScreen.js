import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { saveSettings } from '../db';

const SetupScreen = ({ navigation }) => {
  const [storeName, setStoreName] = useState('');
  const [pin, setPin] = useState('');

  const handleSave = async () => {
    if (storeName.trim() === '' || pin.trim() === '') {
      Alert.alert('Error', 'Please enter both store name and PIN.');
      return;
    }

    try {
      await saveSettings(storeName, pin);
      navigation.replace('Login');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Store Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Store Name"
        value={storeName}
        onChangeText={setStoreName}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
      />
      <Button title="Save" onPress={handleSave} />
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

export default SetupScreen;
