import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  TextInput, Button, Text, Card,
} from 'react-native-paper';
import { getPricesByDate, saveInvoice, getSetting } from '../db';
import { getTodayDateString } from '../utils/date';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { shareAsync } from 'expo-sharing';
import InvoiceItemForm from './components/InvoiceItemForm';

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

const InvoiceHeader = React.memo(({
  customerName, setCustomerName, mobile, setMobile, dailyRates, onAddItem,
}) => (
  <>
    <Text variant="headlineLarge" style={styles.title}>Create New Invoice</Text>
    <Card style={styles.card}>
      <Card.Title title="Customer Details" titleVariant="titleLarge" />
      <Card.Content>
        <TextInput
          label="Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Mobile (Optional)"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />
      </Card.Content>
    </Card>
    <InvoiceItemForm dailyRates={dailyRates} onAddItem={onAddItem} />
    <Text variant="headlineSmall" style={styles.listHeader}>Invoice Items</Text>
  </>
));

const CreateInvoiceScreen = ({ navigation }) => {
  // State for the overall invoice
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Data fetched from DB
  const [dailyRates, setDailyRates] = useState(null);
  const [storeName, setStoreName] = useState('');

  // Fetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const today = getTodayDateString();
        try {
          const rates = await getPricesByDate(today);
          if (!rates) {
            // Prevent setting state if the component is unmounted
            Alert.alert(
              'Rates Not Set',
              'Please set today\'s rates first.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
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
    }, [navigation]) // Dependencies for useCallback
  );

  // Callback for the memoized form component
  const handleAddItem = useCallback((newItem) => {
    setInvoiceItems(prevItems => [...prevItems, newItem]);
  }, []);

  const handleGenerateInvoice = async () => {
    if (invoiceItems.length === 0) {
      Alert.alert('No Items', 'Please add at least one item.'); return;
    }
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
    const totalDiscount = invoiceItems.reduce((acc, item) => acc + item.discount, 0);
    const finalPayable = invoiceItems.reduce((acc, item) => acc + item.finalTotal, 0);
    const invoiceData = {
      customerName: customerName, mobile: mobile,
      date: getTodayDateString(), totalAmount: finalPayable,
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

  const renderFooter = () => (
    invoiceItems.length > 0 ? (
      <Card style={styles.card}>
        <Card.Actions style={styles.footerActions}>
          <Button mode="contained" onPress={handleGenerateInvoice} icon="file-document">
            Generate Invoice
          </Button>
        </Card.Actions>
      </Card>
    ) : null
  );

  return (
    <FlatList
      style={styles.container}
      data={invoiceItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.itemCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.itemTitle}>{item.name} ({item.metal}) - {item.grossWeight}gm @ {item.purity}</Text>
            <Text>Metal Value: ₹{item.metalValue.toFixed(2)} | MC: ₹{item.makingCharge.toFixed(2)}</Text>
            <Text>Discount: ₹{item.discount.toFixed(2)}</Text>
            <Text style={styles.itemTotal}>Item Total: ₹{item.finalTotal.toFixed(2)}</Text>
          </Card.Content>
        </Card>
      )}
      ListHeaderComponent={(
        <InvoiceHeader
          customerName={customerName}
          setCustomerName={setCustomerName}
          mobile={mobile}
          setMobile={setMobile}
          dailyRates={dailyRates}
          onAddItem={handleAddItem}
        />
      )}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={<Card style={styles.card}><Card.Content><Text style={{textAlign: 'center'}}>No items added yet.</Text></Card.Content></Card>}
    />
  );
};

export default CreateInvoiceScreen;
