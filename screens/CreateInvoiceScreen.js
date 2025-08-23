import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getPricesByDate, saveInvoice, getSetting } from '../db';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { shareAsync } from 'expo-sharing';

// Helper to parse purity string to a percentage
const getPurityPercentage = (purity) => {
  if (!purity) return 0;
  if (purity.includes('K')) {
    const karat = parseInt(purity.replace('K', ''));
    return isNaN(karat) ? 0 : karat / 24;
  }
  if (purity.includes('%')) {
    const percent = parseFloat(purity.replace('%', ''));
    return isNaN(percent) ? 0 : percent / 100;
  }
  const asFloat = parseFloat(purity);
  return isNaN(asFloat) ? 0 : asFloat / 100;
};

const CreateInvoiceScreen = ({ navigation }) => {
  // All state remains the same
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [dailyRates, setDailyRates] = useState(null);
  const [storeName, setStoreName] = useState('');
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
  const [mcValue, setMcValue] = useState(0);
  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // All useEffects and handlers remain the same
  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().slice(0, 10);
      try {
        const rates = await getPricesByDate(today);
        if (!rates) {
          Alert.alert('Rates Not Set', 'Please set today\'s gold and silver rates first.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }
        setDailyRates(rates);
        const name = await getSetting('storeName');
        setStoreName(name || 'My Store');
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load initial data.');
      }
    };
    loadData();
  }, [navigation]);

  useEffect(() => {
    const gw = parseFloat(grossWeight);
    const purityPercent = getPurityPercentage(purity);
    setNetWeight(isNaN(gw) ? 0 : gw * purityPercent);
  }, [grossWeight, purity]);

  useEffect(() => {
    if (dailyRates && netWeight > 0) {
      const baseRate = selectedMetal === 'Gold' ? dailyRates.gold_24k_price : dailyRates.silver_price;
      const itemRate = selectedMetal === 'Gold' ? baseRate : baseRate / getPurityPercentage('92.5%');
      setMetalValue(netWeight * itemRate);
    } else {
      setMetalValue(0);
    }
  }, [netWeight, selectedMetal, dailyRates]);

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
      id: Date.now().toString(),
      metal: selectedMetal, name: itemName, grossWeight: parseFloat(grossWeight),
      purity: purity, netWeight: netWeight, metalValue: metalValue,
      makingCharge: mcValue, total: total, discount: total - finalTotal, finalTotal: finalTotal,
    };
    setInvoiceItems(prevItems => [...prevItems, newItem]);
    setItemName(''); setGrossWeight(''); setMakingChargeValue(''); setDiscountValue('');
  };

  const handleGenerateInvoice = async () => {
    if (invoiceItems.length === 0) {
      Alert.alert('No Items', 'Please add at least one item to the invoice.');
      return;
    }
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
    const totalDiscount = invoiceItems.reduce((acc, item) => acc + item.discount, 0);
    const finalPayable = invoiceItems.reduce((acc, item) => acc + item.finalTotal, 0);
    const invoiceData = {
      customerName: customerName, mobile: mobile,
      date: new Date().toISOString().slice(0, 10), totalAmount: finalPayable,
    };
    try {
      const invoiceId = await saveInvoice(invoiceData, invoiceItems);
      const pdfDetails = {
        invoiceNumber: invoiceId, date: invoiceData.date, customerName: customerName,
        items: invoiceItems, storeName: storeName, subtotal: subtotal,
        totalDiscount: totalDiscount, finalPayable: finalPayable,
      };
      const pdfUri = await generateInvoicePdf(pdfDetails);
      if (pdfUri) {
        await shareAsync(pdfUri, { dialogTitle: 'Share Invoice PDF' });
      } else { Alert.alert('Error', 'Failed to create PDF file.'); }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save or generate invoice.');
    }
  };

  const renderHeader = () => (
    <>
      <Text style={styles.title}>Create New Invoice</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <TextInput style={styles.input} placeholder="Customer Name" value={customerName} onChangeText={setCustomerName} />
        <TextInput style={styles.input} placeholder="Mobile (Optional)" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Product</Text>
        <Picker selectedValue={selectedMetal} onValueChange={(v) => setSelectedMetal(v)}>
          <Picker.Item label="Gold" value="Gold" />
          <Picker.Item label="Silver" value="Silver" />
        </Picker>
        <TextInput style={styles.input} placeholder="Item Name (e.g., Ring, Chain)" value={itemName} onChangeText={setItemName} />
        <TextInput style={styles.input} placeholder="Gross Weight (gm)" value={grossWeight} onChangeText={setGrossWeight} keyboardType="numeric" />
        <Picker selectedValue={purity} onValueChange={(v) => setPurity(v)}>
          <Picker.Item label="24K" value="24K" /><Picker.Item label="22K" value="22K" />
          <Picker.Item label="18K" value="18K" /><Picker.Item label="14K" value="14K" />
          <Picker.Item label="92.5%" value="92.5%" />
        </Picker>
        <Text style={styles.calcText}>Net Weight: {netWeight.toFixed(3)} gm</Text>
        <Text style={styles.calcText}>Metal Value: ₹{metalValue.toFixed(2)}</Text>
        <View style={styles.row}>
          <Picker style={{ flex: 1 }} selectedValue={makingChargeBasis} onValueChange={(v) => setMakingChargeBasis(v)}>
            <Picker.Item label="% Basis" value="Percent" /><Picker.Item label="Per Gram" value="PerGram" />
            <Picker.Item label="Per Piece" value="PerPiece" />
          </Picker>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="MC Value" value={makingChargeValue} onChangeText={setMakingChargeValue} keyboardType="numeric" />
        </View>
        <Text style={styles.calcText}>Making Charge: ₹{mcValue.toFixed(2)}</Text>
        <Text style={styles.totalText}>Total: ₹{total.toFixed(2)}</Text>
        <View style={styles.row}>
          <Picker style={{ flex: 1 }} selectedValue={discountType} onValueChange={(v) => setDiscountType(v)}>
            <Picker.Item label="Discount %" value="Percent" /><Picker.Item label="Discount Flat" value="Flat" />
          </Picker>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Discount" value={discountValue} onChangeText={setDiscountValue} keyboardType="numeric" />
        </View>
        <Text style={styles.finalTotalText}>Final Total: ₹{finalTotal.toFixed(2)}</Text>
        <Button title="Add Item to Invoice" onPress={handleAddItem} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Items</Text>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={styles.section}>
      <Button title="Generate Invoice" onPress={handleGenerateInvoice} color="green" />
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={invoiceItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>{item.name} ({item.metal}) - {item.grossWeight}gm @ {item.purity}</Text>
          <Text>Metal Value: ₹{item.metalValue.toFixed(2)} | MC: ₹{item.makingCharge.toFixed(2)}</Text>
          <Text>Discount: ₹{item.discount.toFixed(2)}</Text>
          <Text style={styles.itemTotal}>Item Total: ₹{item.finalTotal.toFixed(2)}</Text>
        </View>
      )}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={<Text style={{textAlign: 'center', padding: 10}}>No items added yet.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  section: { marginBottom: 20, padding: 10, borderColor: '#ccc', borderWidth: 1, borderRadius: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  calcText: { fontSize: 16, marginVertical: 2, color: '#333' },
  totalText: { fontSize: 18, fontWeight: 'bold', marginVertical: 8, color: 'blue' },
  finalTotalText: { fontSize: 20, fontWeight: 'bold', color: 'green', textAlign: 'center', marginVertical: 8 },
  item: { padding: 10, borderBottomColor: '#eee', borderBottomWidth: 1, backgroundColor: '#f9f9f9', marginBottom: 5, borderRadius: 5 },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  itemTotal: { fontWeight: 'bold', color: 'navy', marginTop: 5 },
});

export default CreateInvoiceScreen;
