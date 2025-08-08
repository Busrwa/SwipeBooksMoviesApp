import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '../theme/themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Cihazın varsayılan temasını al
  const colorScheme = Appearance.getColorScheme();

  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  // Opsiyonel: cihaz teması değişirse güncelle
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
