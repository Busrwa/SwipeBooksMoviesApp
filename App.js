import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import TabNavigator from './navigation/TabNavigator';

import { FavoritesProvider } from './context/FavoritesContext';

import { StatusBar } from 'react-native';


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
    <>
      <StatusBar
        barStyle="dark-content"  // Saat ve simgelerin rengini koyu yapar, sayfaya göre ayarla
        translucent={true}       // Üst status bar sayfaya dahil olur, arka plan sayfa ile uyumlu
        backgroundColor="transparent" // Arka plan transparan yap
        hidden={false}           // StatusBar görünür kalsın
      />
      <AppNavigator />
    </>
  );
}
