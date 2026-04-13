import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {AppProvider} from './context/AppContext';
import AppNavigator from './navigation/AppNavigator';
import {colors} from './theme';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary}
          translucent={false}
        />
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
