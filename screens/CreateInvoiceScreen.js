import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  TextInput, Button, Text, Card,
} from 'react-native-paper';
import { getPricesByDate, saveInvoice, getSetting } from '../db';
import { generateInvoicePdf, generateInvoiceHtml } from '../utils/pdfGenerator';
import { shareAsync } from 'expo-sharing';
import * as Print from 'expo-print';
import InvoiceItemForm from './components/InvoiceItemForm';

const InvoiceHeader = React.memo(({
  customerName, setCustomerName, mobile, setMobile, dailyRates, onAddItem, styles,
}) => (
  <>
    <Text variant="headlineLarge" style={styles.title}>Create New Invoice</Text>
    <Card style={styles.card}>
      <Card.Title title="Customer Details" titleVariant="titleLarge" />
      <Card.Content>
        <TextInput label="Customer Name" value={customerName} onChangeText={setCustomerName} mode="outlined" style={styles.input} />
        <TextInput label="Mobile (Optional)" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" mode="outlined" style={styles.input} />
      </Card.Content>
    </Card>
    <InvoiceItemForm dailyRates={dailyRates} onAddItem={onAddItem} />
    <Text variant="headlineSmall" style={styles.listHeader}>Invoice Items</Text>
  </>
));

const InvoiceFooter = React.memo(({
  itemsCount, onGenerate, onPrint, isProcessing, styles,
}) => {
  if (itemsCount === 0) return null;
  return (
    <Card style={styles.card}>
      <Card.Actions style={styles.footerActions}>
        <Button mode="outlined" onPress={onPrint} icon="printer" style={{ marginRight: 10 }} disabled={isProcessing}>
          {isProcessing ? 'Printing...' : 'Print'}
        </Button>
        <Button mode="contained" onPress={onGenerate} icon="share-variant" disabled={isProcessing}>
          {isProcessing ? 'Sharing...' : 'Share PDF'}
        </Button>
      </Card.Actions>
    </Card>
  );
});

const InvoiceItem = React.memo(({ item, styles }) => (
  <Card style={styles.itemCard}>
    <Card.Content>
      <Text variant="titleMedium" style={styles.itemTitle}>{item.name} ({item.metal}) - {item.grossWeight}gm @ {item.purity}</Text>
      <Text>Metal Value: ₹{item.metalValue.toFixed(2)} | MC: ₹{item.makingCharge.toFixed(2)}</Text>
      <Text>Discount: ₹{item.discount.toFixed(2)}</Text>
      <Text style={styles.itemTotal}>Item Total: ₹{item.finalTotal.toFixed(2)}</Text>
    </Card.Content>
  </Card>
));

const CreateInvoiceScreen = ({ navigation }) => {
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [dailyRates, setDailyRates] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().slice(0, 10);
      try {
        const rates = await getPricesByDate(today);
        if (!rates) {
          Alert.alert('Rates Not Set', 'Please set today\'s rates first.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
          return;
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

  const handleAddItem = useCallback((newItem) => {
    setInvoiceItems(prevItems => [...prevItems, newItem]);
  }, []);

  const handleGenerateInvoice = useCallback(async () => {
    if (isProcessing) return;
    if (invoiceItems.length === 0) {
      Alert.alert('No Items', 'Please add at least one item.');
      return;
    }
    setIsProcessing(true);
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
    const totalDiscount = invoiceItems.reduce((acc, item) => acc + item.discount, 0);
    const finalPayable = invoiceItems.reduce((acc, item) => acc + item.finalTotal, 0);
    const invoiceData = {
      customerName, mobile,
      date: new Date().toISOString().slice(0, 10),
      totalAmount: finalPayable,
    };
    try {
      const invoiceId = await saveInvoice(invoiceData, invoiceItems);
      const pdfDetails = {
        invoiceNumber: invoiceId,
        date: invoiceData.date,
        customerName,
        items: invoiceItems,
        storeName,
        subtotal,
        totalDiscount,
        finalPayable,
      };
      const pdfUri = await generateInvoicePdf(pdfDetails);
      if (pdfUri) {
        await shareAsync(pdfUri, { dialogTitle: 'Share Invoice PDF' });
      } else {
        Alert.alert('Error', 'Failed to create PDF file.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save or generate invoice.');
    } finally {
      setIsProcessing(false);
    }
  }, [invoiceItems, customerName, mobile, storeName, isProcessing]);

  const renderItem = useCallback(({ item }) => <InvoiceItem item={item} styles={styles} />, []);

  const header = <InvoiceHeader
    customerName={customerName} setCustomerName={setCustomerName}
    mobile={mobile} setMobile={setMobile}
    dailyRates={dailyRates} onAddItem={handleAddItem} styles={styles}
  />;

  const handlePrintInvoice = useCallback(async () => {
    if (isProcessing) return;
    if (invoiceItems.length === 0) {
      Alert.alert('No Items', 'Please add at least one item to print.');
      return;
    }
    setIsProcessing(true);
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
    const totalDiscount = invoiceItems.reduce((acc, item) => acc + item.discount, 0);
    const finalPayable = invoiceItems.reduce((acc, item) => acc + item.finalTotal, 0);

    const pdfDetails = {
      invoiceNumber: 'N/A (Rough Bill)',
      date: new Date().toISOString().slice(0, 10),
      customerName,
      items: invoiceItems,
      storeName,
      subtotal,
      totalDiscount,
      finalPayable,
    };

    try {
      const html = generateInvoiceHtml(pdfDetails);
      await Print.printAsync({ html });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to open print dialog.');
    } finally {
      setIsProcessing(false);
    }
  }, [invoiceItems, customerName, storeName, isProcessing]);

  const footer = <InvoiceFooter itemsCount={invoiceItems.length} onGenerate={handleGenerateInvoice} onPrint={handlePrintInvoice} isProcessing={isProcessing} styles={styles} />;

  return (
    <FlatList
      style={styles.container}
      data={invoiceItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={<Card style={styles.card}><Card.Content><Text style={{ textAlign: 'center' }}>No items added yet.</Text></Card.Content></Card>}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 20, },
  title: { textAlign: 'center', marginVertical: 10, },
  listHeader: { textAlign: 'center', marginVertical: 10, },
  input: { marginBottom: 10, },
  itemCard: { marginVertical: 5, },
  itemTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5, },
  itemTotal: { fontWeight: 'bold', color: 'navy', marginTop: 5, fontSize: 16, },
  footerActions: { justifyContent: 'center', paddingVertical: 10, },
});

export default CreateInvoiceScreen;
