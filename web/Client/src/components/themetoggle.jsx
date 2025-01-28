import { useTheme } from './themecontext';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const isAdminPage = location.pathname === '/admin';
      const isMobile = window.innerWidth <= 480;
      // Check if any window is open by looking for mobile-section
      const isWindowOpen = document.querySelector('.mobile-section');
      
      setShouldHide(isAdminPage && isMobile && isWindowOpen);
    };

    checkVisibility();
    window.addEventListener('resize', checkVisibility);

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    return () => {
      window.removeEventListener('resize', checkVisibility);
      observer.disconnect();
    };
  }, [location]);

  if (shouldHide) return null;

  return (
    <button
      className="fixed top-4 right-4 p-2 rounded-lg text-4xl z-10"
      onClick={toggleTheme}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

