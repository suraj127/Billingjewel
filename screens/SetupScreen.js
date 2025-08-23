import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
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
      <Text variant="headlineLarge" style={styles.title}>Store Setup</Text>
      <TextInput
        label="Store Name"
        value={storeName}
        onChangeText={setStoreName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="PIN"
        value={pin}
        onChangeText={setPin}
        style={styles.input}
        keyboardType="numeric"
        secureTextEntry
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        icon="content-save"
      >
        Save and Continue
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

export default SetupScreen;
