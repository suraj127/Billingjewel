import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';

// Function to convert number to words
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
};

// Function to generate random UPI ref no
const generateUpiRefNo = () => {
    return Math.floor(Math.random() * (10**15 - 10**12 + 1) + 10**12).toString();
};

const ReceiptScreen = ({ route }) => {
  const { senderDetails, paymentDetails } = route.params;
  const upiRefNo = generateUpiRefNo();

  const formattedDate = new Date(paymentDetails.dateTime).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const formattedTime = new Date(paymentDetails.dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const copyToClipboard = () => {
    Clipboard.setString(upiRefNo);
    Alert.alert('Copied', 'UPI Reference No. copied to clipboard.');
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Icon name="arrow-left" size={24} color="#111827" />
            <Text style={styles.headerTitle}>Paid Successfully</Text>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.headerLink}>Share</Text>
                <Text style={styles.headerLink}>Help</Text>
            </View>
        </View>

        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.grayText}>Amount</Text>
                <View style={styles.amountContainer}>
                    <Text style={styles.amount}>₹{paymentDetails.amount}</Text>
                    <Icon name="check-circle" size={28} color="#1BB76E" />
                </View>
                <Text style={styles.amountInWords}>Rupees {numberToWords(paymentDetails.amount)} Only</Text>

                <View style={styles.tagContainer}>
                    <View style={styles.tag}>
                        <Icon name="airplane" size={16} color="#066B79" />
                        <Text style={styles.tagText}>Travel</Text>
                    </View>
                    <Text style={styles.editLink}>Edit</Text>
                </View>

                <TouchableOpacity style={styles.splitButton}>
                    <Text style={styles.splitButtonText}>Split this Payment</Text>
                </TouchableOpacity>

                <View style={styles.hr} />

                <View style={styles.section}>
                    <View style={{flex: 1}}>
                        <Text style={styles.grayText}>To</Text>
                        <Text style={styles.name}>{paymentDetails.recipientName}</Text>
                        <Text style={styles.upiIdLabel}>UPI ID:</Text>
                        <Text style={styles.upiId}>{paymentDetails.recipientUpiId}</Text>
                        <TouchableOpacity style={styles.historyButton}>
                            <Text style={styles.historyButtonText}>View History</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.iconBg}>
                        <Icon name="taxi" size={30} color="#F4B84D" />
                    </View>
                </View>

                <View style={styles.hr} />

                <View style={styles.section}>
                    <View>
                        <Text style={styles.grayText}>From</Text>
                        <Text style={styles.name}>{senderDetails.name}</Text>
                        <Text style={styles.upiId}>UPI ID: {senderDetails.upiId}</Text>
                        <Text style={styles.bankDetails}>{senderDetails.bankName} - {senderDetails.accountLast4} 🧾</Text>
                        <Text style={styles.dateTimeText}>Paid at {formattedTime}, {formattedDate}</Text>
                        <View style={styles.refContainer}>
                            <Text style={styles.upiId}>UPI Ref No: <Text style={{fontWeight: 'bold'}}>{upiRefNo}</Text></Text>
                            <TouchableOpacity onPress={copyToClipboard}>
                                <Text style={styles.copyLink}>Copy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Powered by</Text>
                    <Text style={styles.footerBrand}>UPI</Text>
                    <Text style={styles.footerBrand}>SBI</Text>
                </View>

            </Card.Content>
        </Card>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FBFF',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    headerLink: {
        color: '#06A6D0',
        marginLeft: 16,
    },
    card: {
        borderRadius: 12,
        backgroundColor: 'white',
    },
    grayText: {
        color: 'gray',
        fontSize: 14,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountInWords: {
        color: '#374151',
        marginTop: 4,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E7F7F9',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    tagText: {
        color: '#066B79',
        marginLeft: 6,
        fontWeight: '500',
    },
    editLink: {
        color: '#06A6D0',
        marginLeft: 12,
    },
    splitButton: {
        borderColor: '#06C2D6',
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    splitButtonText: {
        color: '#06C2D6',
        fontWeight: '500',
    },
    hr: {
        borderBottomColor: '#F3F4F6',
        borderBottomWidth: 1,
        marginVertical: 16,
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 4,
    },
    upiIdLabel: {
        color: 'gray',
        fontSize: 12,
        marginTop: 4,
    },
    upiId: {
        color: '#374151',
        marginTop: 2,
    },
    historyButton: {
        borderColor: '#C7F0F6',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    historyButtonText: {
        color: '#06C2D6',
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF5E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankDetails: {
        color: '#374151',
        marginTop: 2,
    },
    dateTimeText: {
        color: 'gray',
        marginTop: 16,
    },
    refContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    copyLink: {
        color: '#06A6D0',
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        color: 'gray',
        fontSize: 12,
    },
    footerBrand: {
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 8,
    }
});

export default ReceiptScreen;
