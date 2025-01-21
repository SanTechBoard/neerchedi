import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or default to true (dark)
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  useEffect(() => {
    // Save theme preference to localStorage whenever it changes
    localStorage.setItem('theme', JSON.stringify(isDark));
    
    // Apply theme classes separately
    document.body.className = `root  ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`;
    
    // Apply theme-change class to a different element
    const themeElement = document.querySelector('.theme-change');
    if (themeElement) {
      themeElement.className = `theme-change ${
        isDark 
          ? 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg' 
          : 'bg-gray-300 text-black p-6 rounded-lg shadow-lg'
      }`;
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}