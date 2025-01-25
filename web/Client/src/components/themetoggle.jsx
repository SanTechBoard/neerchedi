import { useTheme } from './themecontext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="fixed top-4 right-4 p-2 rounded-lg text-4xl z-10"
      onClick={toggleTheme}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

