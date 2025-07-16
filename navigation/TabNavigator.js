import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesProvider } from '../context/FavoritesContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import SwipeScreen from '../screens/home/SwipeScreen';
import FavoritesScreen from '../screens/home/FavoritesScreen';
import ProfileNavigator from '../navigation/ProfileNavigator';
import TopBooksScreen from '../screens/home/TopBooksScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <FavoritesProvider>
      <Tab.Navigator
        initialRouteName="Swipe"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Swipe') iconName = 'home';
            else if (route.name === 'Favorites') iconName = 'heart';
            else if (route.name === 'Profile') iconName = 'person';
            else if (route.name === 'TopBooks') iconName = 'star';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'red',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 60 + insets.bottom, // güvenli alanı da ekle
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 6,
            paddingTop: 4,
            borderTopWidth: 1,
            borderTopColor: '#ddd',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 2,
          },
        })}
      >
        <Tab.Screen
          name="Swipe"
          component={SwipeScreen}
          options={{ title: 'Keşfet' }}
        />
        <Tab.Screen
          name="TopBooks"
          component={TopBooksScreen}
          options={{ title: 'En Popüler' }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: 'Favoriler' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          options={{ title: 'Profil' }}
        />
      </Tab.Navigator>
    </FavoritesProvider>
  );
}
