import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const PaymentEntryScreen = ({ route, navigation }) => {
  const { senderDetails } = route.params;

  const [recipientName, setRecipientName] = useState('Rapido');
  const [amount, setAmount] = useState('95');
  const [recipientUpiId, setRecipientUpiId] = useState('paytm-76881028@ptybl');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSubmit = () => {
    if (!recipientName || !amount || !recipientUpiId) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const paymentDetails = {
      recipientName,
      amount: parseFloat(amount),
      recipientUpiId,
      dateTime: date.toISOString(),
    };
    navigation.navigate('Receipt', { senderDetails, paymentDetails });
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.title}>Payment Details</Text>
          <TextInput
            label="Recipient Name"
            value={recipientName}
            onChangeText={setRecipientName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            label="Recipient UPI ID"
            value={recipientUpiId}
            onChangeText={setRecipientUpiId}
            style={styles.input}
            mode="outlined"
          />
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            {`Date: ${date.toLocaleDateString()} | Time: ${date.toLocaleTimeString()}`}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="datetime"
              is24Hour={false}
              display="default"
              onChange={handleDateChange}
            />
          )}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            icon="check-circle"
          >
            Submit Payment
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  dateButton: {
    marginBottom: 15,
  },
  actions: {
    justifyContent: 'center',
    paddingTop: 10,
  }
});

export default PaymentEntryScreen;
