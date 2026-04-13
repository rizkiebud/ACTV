import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useApp} from '../context/AppContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const {isAuthenticated} = useApp();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.primary},
        animation: 'fade',
      }}>
      {!isAuthenticated ? (
        // ── Auth Stack ──────────────────────────────────────────────────────────
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{animation: 'slide_from_right'}}
          />
        </Stack.Group>
      ) : (
        // ── App Stack ───────────────────────────────────────────────────────────
        <Stack.Group>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{animation: 'fade'}}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
