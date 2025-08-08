import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme/themes';
import { Appearance } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Cihazın varsayılan tema tercihini al
  const colorScheme = Appearance.getColorScheme();

  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  // Cihaz teması değişirse bunu yakala
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });
    return () => subscription.remove();
  }, []);

  // Temayı değiştirmek için fonksiyon
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.mode === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
