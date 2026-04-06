import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { Platform } from 'react-native';

import WordsScreen from '../screens/WordsScreen';
import LedgerScreen from '../screens/LedgerScreen';
import NotesScreen from '../screens/NotesScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === '点读机') {
            iconName = focused ? 'volume-medium' : 'volume-medium-outline';
          } else if (route.name === '记账本') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === '备忘录') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 'auto', // 只有 iOS 使用固定的较高高度以适配安全区
          minHeight: 60,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2, // 增加图标和文字之间的间距
        },
      })}
    >
      <Tab.Screen name="点读机" component={WordsScreen} />
      <Tab.Screen name="记账本" component={LedgerScreen} />
      <Tab.Screen name="备忘录" component={NotesScreen} />
    </Tab.Navigator>
  );
}
