import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        arcade: {
          orange: '#cc6b35',
          deep: '#b8531e',
          cream: '#fcfaf7',
          peach: '#f7ece1',
          ink: '#18181b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        arcade: ['var(--font-arcade)', 'var(--font-pixel)', 'monospace'],
        pixel: ['var(--font-pixel)', 'monospace'],
        serif: ['var(--font-arcade)', 'var(--font-pixel)', 'monospace'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        arcade: '4px 4px 0px #cc6b35',
        'arcade-sm': '2px 2px 0px #cc6b35',
        'arcade-ink': '4px 4px 0px #18181b',
        'arcade-lg': '6px 6px 0px #b8531e',
      },
    },
  },
  plugins: [],
};

export default config;
