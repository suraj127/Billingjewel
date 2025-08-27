import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  TextInput, Button, Text, Card, Divider,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getPurityPercentage } from '../../utils/calculations';

const InvoiceItemForm = ({ dailyRates, onAddItem }) => {
  const [selectedMetal, setSelectedMetal] = useState('Gold');
  const [itemName, setItemName] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [purity, setPurity] = useState('22K');
  const [makingChargeBasis, setMakingChargeBasis] = useState('Percent');
  const [makingChargeValue, setMakingChargeValue] = useState('');
  const [discountType, setDiscountType] = useState('Percent');
  const [discountValue, setDiscountValue] = useState('');
  const [netWeight, setNetWeight] = useState(0);
  const [metalValue, setMetalValue] = useState(0);
  const [displayRate, setDisplayRate] = useState(0);
  const [mcValue, setMcValue] = useState(0);
  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const gw = parseFloat(grossWeight);
    const purityPercent = getPurityPercentage(purity);
    setNetWeight(isNaN(gw) ? 0 : gw * purityPercent);
  }, [grossWeight, purity]);

  useEffect(() => {
    if (dailyRates && grossWeight) {
      const gw = parseFloat(grossWeight) || 0;
      const purityPercent = getPurityPercentage(purity);
      const baseRate = selectedMetal === 'Gold' ? dailyRates.gold_24k_price : dailyRates.silver_price;

      const adjustedRate = baseRate * purityPercent;
      const currentNetWeight = gw * purityPercent;

      setNetWeight(currentNetWeight);
      setMetalValue(gw * adjustedRate);
      setDisplayRate(adjustedRate);
    } else {
      setNetWeight(0);
      setMetalValue(0);
      setDisplayRate(0);
    }
  }, [grossWeight, purity, selectedMetal, dailyRates]);

  useEffect(() => {
    const mcInput = parseFloat(makingChargeValue);
    if (isNaN(mcInput)) { setMcValue(0); return; }
    if (makingChargeBasis === 'Percent') {
      setMcValue(metalValue * (mcInput / 100));
    } else if (makingChargeBasis === 'PerGram') {
      const gw = parseFloat(grossWeight) || 0;
      setMcValue(gw * mcInput);
    } else { setMcValue(mcInput); }
  }, [makingChargeBasis, makingChargeValue, metalValue, grossWeight]);

  useEffect(() => { setTotal(metalValue + mcValue); }, [metalValue, mcValue]);

  useEffect(() => {
    const discountInput = parseFloat(discountValue);
    if (isNaN(discountInput)) { setFinalTotal(total); return; }
    if (discountType === 'Percent') {
      setFinalTotal(total - total * (discountInput / 100));
    } else { setFinalTotal(total - discountInput); }
  }, [total, discountType, discountValue]);

  const handleAddItem = () => {
    if (!itemName.trim() || !grossWeight.trim()) {
      Alert.alert('Missing Info', 'Please enter item name and gross weight.');
      return;
    }
    const newItem = {
      id: Date.now().toString(), metal: selectedMetal, name: itemName,
      grossWeight: parseFloat(grossWeight), purity: purity, netWeight: netWeight,
      metalValue: metalValue, makingCharge: mcValue, total: total,
      discount: total - finalTotal, finalTotal: finalTotal, displayRate: displayRate,
    };
    onAddItem(newItem); // Pass the new item to the parent
    // Reset form
    setItemName(''); setGrossWeight(''); setMakingChargeValue(''); setDiscountValue('');
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Add Product" titleVariant="titleLarge" />
      <Card.Content>
        <View style={styles.pickerContainer}><Picker selectedValue={selectedMetal} onValueChange={(v) => setSelectedMetal(v)}>
          <Picker.Item label="Gold" value="Gold" /><Picker.Item label="Silver" value="Silver" />
        </Picker></View>
        <TextInput label="Item Name (e.g., Ring, Chain)" value={itemName} onChangeText={setItemName} mode="outlined" style={styles.input} />
        <TextInput label="Gross Weight (gm)" value={grossWeight} onChangeText={setGrossWeight} keyboardType="numeric" mode="outlined" style={styles.input} />
        <View style={styles.pickerContainer}><Picker selectedValue={purity} onValueChange={(v) => setPurity(v)}>
          <Picker.Item label="24K" value="24K" /><Picker.Item label="22K" value="22K" />
          <Picker.Item label="18K" value="18K" /><Picker.Item label="14K" value="14K" />
          <Picker.Item label="92.5%" value="92.5%" />
        </Picker></View>
        <Text style={styles.calcText}>Net Weight: {netWeight.toFixed(3)} gm</Text>
        <Text style={styles.calcText}>Metal Value: ₹{metalValue.toFixed(2)}</Text>
        <Divider style={styles.divider} />
        <View style={styles.row}>
          <Picker style={{ flex: 1 }} selectedValue={makingChargeBasis} onValueChange={(v) => setMakingChargeBasis(v)}>
            <Picker.Item label="% Basis" value="Percent" /><Picker.Item label="Per Gram" value="PerGram" />
            <Picker.Item label="Per Piece" value="PerPiece" />
          </Picker>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="MC Value" value={makingChargeValue} onChangeText={setMakingChargeValue} keyboardType="numeric" mode="outlined" />
        </View>
        <Text style={styles.calcText}>Making Charge: ₹{mcValue.toFixed(2)}</Text>
        <Text style={styles.totalText}>Total: ₹{total.toFixed(2)}</Text>
        <Divider style={styles.divider} />
        <View style={styles.row}>
          <Picker style={{ flex: 1 }} selectedValue={discountType} onValueChange={(v) => setDiscountType(v)}>
            <Picker.Item label="Discount %" value="Percent" /><Picker.Item label="Discount Flat" value="Flat" />
          </Picker>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Discount" value={discountValue} onChangeText={setDiscountValue} keyboardType="numeric" mode="outlined" />
        </View>
        <Text style={styles.finalTotalText}>Final Total: ₹{finalTotal.toFixed(2)}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={handleAddItem} icon="plus-circle">Add Item</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
    card: { marginBottom: 20, },
    input: { marginBottom: 10, },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
    pickerContainer: { borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 10, },
    calcText: { fontSize: 16, marginVertical: 4, },
    totalText: { fontSize: 18, fontWeight: 'bold', marginVertical: 8, },
    finalTotalText: { fontSize: 20, fontWeight: 'bold', color: 'green', textAlign: 'center', marginVertical: 8, },
    divider: { marginVertical: 10, },
});

export default React.memo(InvoiceItemForm);
