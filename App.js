import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider, DefaultTheme } from 'react-native-paper';

import { init, getSetting } from './db';
import SetupScreen from './screens/SetupScreen';
import LoginScreen from './screens/LoginScreen';
import PriceEntryScreen from './screens/PriceEntryScreen';
import CreateInvoiceScreen from './screens/CreateInvoiceScreen';

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
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Setup');

  useEffect(() => {
    const initialize = async () => {
      try {
        await init();
        const pin = await getSetting('pin');
        if (pin) {
          setInitialRoute('Login');
        } else {
          setInitialRoute('Setup');
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Setup" component={SetupScreen} options={{ title: 'Setup' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="PriceEntry" component={PriceEntryScreen} options={{ title: 'Daily Prices' }} />
          <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} options={{ title: 'Create Invoice' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
