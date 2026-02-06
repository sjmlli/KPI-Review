import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

const SunIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
  </svg>
);

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`theme-toggle inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${className}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
          !isDark ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'
        }`}
      >
        <SunIcon />
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
          isDark ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'
        }`}
      >
        <MoonIcon />
      </span>
    </button>
  );
};

export default ThemeToggle;
