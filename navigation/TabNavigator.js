import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesProvider } from '../context/FavoritesContext';

import SwipeScreen from '../screens/home/SwipeScreen';
import FavoritesScreen from '../screens/home/FavoritesScreen';
import ProfileNavigator from '../navigation/ProfileNavigator';
import TopBooksScreen from '../screens/home/TopBooksScreen'; 

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
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
