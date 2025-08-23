import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';

import { init, getSetting } from './db';
import SetupScreen from './screens/SetupScreen';
import LoginScreen from './screens/LoginScreen';
import PriceEntryScreen from './screens/PriceEntryScreen';

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
        // Handle initialization error, maybe show an error screen
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Setup" component={SetupScreen} options={{ title: 'Setup' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="PriceEntry" component={PriceEntryScreen} options={{ title: 'Daily Prices' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
