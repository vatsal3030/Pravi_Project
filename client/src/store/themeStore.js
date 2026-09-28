// ============================================
// Theme Store — Light & Dark Mode
// Features smooth top-right to bottom-left circular wave animation
// ============================================

import { create } from 'zustand';

// Check saved theme or default to light mode
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('infravault_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
};

const applyThemeToDOM = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  root.setAttribute('data-theme', theme);
};

// Visual wave burst effect from top right corner
const triggerWaveOverlay = () => {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('theme-wave-burst');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'theme-wave-burst';
  overlay.className = 'theme-wave-overlay';
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 1050);
};

export const useThemeStore = create((set, get) => {
  const initial = getInitialTheme();
  applyThemeToDOM(initial);

  return {
    theme: initial,
    isDark: initial === 'dark',

    toggleTheme: (event) => {
      const current = get().theme;
      const next = current === 'dark' ? 'light' : 'dark';

      // Always show the wave burst overlay
      triggerWaveOverlay();

      // Check for View Transitions API support
      if (typeof document !== 'undefined' && document.startViewTransition) {
        // Origin is top-right corner (100% width, 0px top)
        const x = window.innerWidth;
        const y = 0;
        const endRadius = Math.hypot(window.innerWidth, window.innerHeight) * 1.1;

        const transition = document.startViewTransition(() => {
          localStorage.setItem('infravault_theme', next);
          applyThemeToDOM(next);
          set({ theme: next, isDark: next === 'dark' });
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 950,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        }).catch(() => {
          // Fallback if animation fails
        });
      } else {
        localStorage.setItem('infravault_theme', next);
        applyThemeToDOM(next);
        set({ theme: next, isDark: next === 'dark' });
      }
    },

    setTheme: (newTheme) => {
      if (newTheme !== 'light' && newTheme !== 'dark') return;
      localStorage.setItem('infravault_theme', newTheme);
      applyThemeToDOM(newTheme);
      set({ theme: newTheme, isDark: newTheme === 'dark' });
    },
  };
});

export default useThemeStore;
