import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, DefaultTheme } from 'react-native-paper';

import LoginScreen from './screens/LoginScreen';
import PaymentEntryScreen from './screens/PaymentEntryScreen';
import ReceiptScreen from './screens/ReceiptScreen';

// Define a custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00695C', // A nice teal color
    accent: '#FFC107', // A complementary amber/yellow
  },
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Your Details' }} />
          <Stack.Screen name="PaymentEntry" component={PaymentEntryScreen} options={{ title: 'Payment Details' }} />
          <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
