import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getPricesByDate, savePrices as dbSavePrices } from '../db';

const PriceEntryScreen = ({ navigation }) => {
  const [gold24k, setGold24k] = useState('');
  const [silver, setSilver] = useState('');
  const [selectedKarat, setSelectedKarat] = useState('24K');
  const [calculatedPrice, setCalculatedPrice] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch prices when the component mounts
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const today = getTodayDate();
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

  // Calculate price when gold rate or karat changes
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

  const savePrices = async () => {
    if (gold24k.trim() === '' || silver.trim() === '') {
      Alert.alert('Error', 'Please enter both gold and silver prices.');
      return;
    }
    try {
      const today = getTodayDate();
      await dbSavePrices(today, parseFloat(gold24k), parseFloat(silver));
      Alert.alert('Success', 'Prices saved successfully for today.');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to save prices.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Daily Prices</Text>

      <Text style={styles.label}>Gold 24K Rate (per gm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Gold 24K Rate"
        value={gold24k}
        onChangeText={setGold24k}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Silver Rate (per gm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Silver Rate"
        value={silver}
        onChangeText={setSilver}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Select Gold Karat</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedKarat}
          onValueChange={(itemValue, itemIndex) => setSelectedKarat(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="24K" value="24K" />
          <Picker.Item label="22K" value="22K" />
          <Picker.Item label="18K" value="18K" />
          <Picker.Item label="14K" value="14K" />
        </Picker>
      </View>

      {calculatedPrice ? (
        <Text style={styles.calculatedPrice}>
          Calculated Rate for {selectedKarat}: ₹{calculatedPrice} /gm
        </Text>
      ) : null}

      <Button title="Save Prices" onPress={savePrices} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  calculatedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default PriceEntryScreen;
