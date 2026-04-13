import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import MonitoringScreen from '../screens/monitoring/MonitoringScreen';
import CameraDetailScreen from '../screens/monitoring/CameraDetailScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import {useApp} from '../context/AppContext';
import {colors, fontSizes} from '../theme';

const Tab = createBottomTabNavigator();
const MonitorStack = createNativeStackNavigator();

// ─── Monitoring Stack ──────────────────────────────────────────────────────────
function MonitoringStackNavigator() {
  return (
    <MonitorStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.card},
        headerTintColor: colors.text,
        headerTitleStyle: {fontWeight: '700', color: colors.text},
        headerShadowVisible: false,
        contentStyle: {backgroundColor: colors.primary},
      }}>
      <MonitorStack.Screen
        name="MonitoringList"
        component={MonitoringScreen}
        options={{title: 'Monitoring CCTV'}}
      />
      <MonitorStack.Screen
        name="CameraDetail"
        component={CameraDetailScreen}
        options={({route}) => ({
          title: 'Detail Kamera',
          headerBackTitle: 'Kamera',
        })}
      />
    </MonitorStack.Navigator>
  );
}

// ─── Tab Icon ──────────────────────────────────────────────────────────────────
function TabIcon({emoji, focused, badgeCount}) {
  return (
    <View style={tabIconStyles.wrap}>
      <Text style={[tabIconStyles.emoji, focused && tabIconStyles.emojiFocused]}>
        {emoji}
      </Text>
      {badgeCount > 0 && (
        <View style={tabIconStyles.badge}>
          <Text style={tabIconStyles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {position: 'relative', alignItems: 'center'},
  emoji: {fontSize: 22, opacity: 0.55},
  emojiFocused: {opacity: 1},
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '800',
  },
});

// ─── Tab Navigator ─────────────────────────────────────────────────────────────
export default function TabNavigator() {
  const {unreadCount} = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.cardBorder,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: fontSizes.lg,
        },
        headerTintColor: colors.accent,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: fontSizes.xxs,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>

      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: '🛡️ MobileJaga',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Monitoring"
        component={MonitoringStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Kamera',
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="📷" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Peringatan',
          tabBarLabel: 'Peringatan',
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🔔" focused={focused} badgeCount={unreadCount} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil Saya',
          tabBarLabel: 'Profil',
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
