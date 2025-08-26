import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getPricesByDate, savePrices } from '../db';
import { getTodayDateString } from '../utils/date';

const PriceEntryScreen = ({ navigation }) => {
  const [gold24k, setGold24k] = useState('');
  const [silver, setSilver] = useState('');
  const [selectedKarat, setSelectedKarat] = useState('24K');
  const [calculatedPrice, setCalculatedPrice] = useState('');

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const today = getTodayDateString();
        const prices = await getPricesByDate(today);
        if (prices) {
          setGold24k(prices.gold_24k_price.toString());
          setSilver(prices.silver_price.toString());
        }
      } catch (err) {
        console.log(err);
        Alert.alert('Error', 'Failed to load prices for today.');
      }
    };
    loadPrices();
  }, []);

  useEffect(() => {
    if (gold24k && selectedKarat) {
      const g24k = parseFloat(gold24k);
      const karatValue = parseInt(selectedKarat.replace('K', ''));
      if (!isNaN(g24k) && !isNaN(karatValue)) {
        const price = (g24k * (karatValue / 24)).toFixed(2);
        setCalculatedPrice(price);
      } else {
        setCalculatedPrice('');
      }
    } else {
      setCalculatedPrice('');
    }
  }, [gold24k, selectedKarat]);

  const handleSavePrices = async () => {
    if (gold24k.trim() === '' || silver.trim() === '') {
      Alert.alert('Error', 'Please enter both gold and silver prices.');
      return;
    }
    try {
      const today = getTodayDateString();
      await savePrices(today, parseFloat(gold24k), parseFloat(silver));
      Alert.alert('Success', 'Prices saved successfully for today.');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to save prices.');
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.title}>Enter Daily Prices</Text>

          <TextInput
            label="Gold 24K Rate (per gm)"
            value={gold24k}
            onChangeText={setGold24k}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            label="Silver Rate (per gm)"
            value={silver}
            onChangeText={setSilver}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
          />

          <Text variant="titleMedium" style={styles.label}>Select Gold Karat</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedKarat}
              onValueChange={(itemValue) => setSelectedKarat(itemValue)}
            >
              <Picker.Item label="24K" value="24K" />
              <Picker.Item label="22K" value="22K" />
              <Picker.Item label="18K" value="18K" />
              <Picker.Item label="14K" value="14K" />
            </Picker>
          </View>

          {calculatedPrice ? (
            <Text variant="bodyLarge" style={styles.calculatedPrice}>
              Calculated Rate for {selectedKarat}: ₹{calculatedPrice} /gm
            </Text>
          ) : null}

        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleSavePrices} icon="content-save">Save Prices</Button>
        </Card.Actions>
      </Card>

      <Divider style={styles.divider} />

      <Button
        mode="elevated"
        onPress={() => navigation.navigate('CreateInvoice')}
        icon="plus-circle"
      >
        Create New Invoice
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    marginLeft: 5
  },
  pickerContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  calculatedPrice: {
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 20,
  }
});

export default PriceEntryScreen;
