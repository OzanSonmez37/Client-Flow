/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bcfc',
          400: '#8196f8',
          500: '#6172f3',
          600: '#4f54e8',
          700: '#4240cf',
          800: '#3636a7',
          900: '#313384',
          950: '#1e1d4d',
        },
        surface: {
          0: '#ffffff',
          50: '#f8f9fc',
          100: '#f1f3f8',
          200: '#e4e8f2',
          300: '#d1d8e8',
        },
        ink: {
          DEFAULT: '#0f1117',
          muted: '#6b7280',
          subtle: '#9ca3af',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.05)',
        dialog: '0 20px 60px -12px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
