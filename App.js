import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import TabNavigator from './navigation/TabNavigator';

import { FavoritesProvider } from './context/FavoritesContext';

import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

export default function App() {
  useEffect(() => {
    // Navigation bar'ı gizle
    NavigationBar.setVisibilityAsync("hidden");

    // Arka planı şeffaf yap
    NavigationBar.setBackgroundColorAsync("transparent");

    // Sistem arka planını da şeffaf yap
    SystemUI.setBackgroundColorAsync("transparent");
  }, []);

  return (
      <AppNavigator />
  );
}
