/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors based on your palette
        primary: {
          50: '#E6EFFF',   // medium light blue
          100: '#F2F5FB',  // light blue
          200: '#E6EFFF',  // medium light blue
          300: '#D83713',  // orange for accents
          400: '#D83713',  // orange
          500: '#D83713',  // orange
          600: '#B8300F',  // darker orange
          700: '#9A280D',  // even darker orange
          800: '#7C200A',  // very dark orange
          900: '#5E1808',  // darkest orange
        },
        // Dark theme colors based on your palette
        dark: {
          // Main dark background
          900: '#122941',  // dark blue - main dark background
          800: '#1a3650',  // slightly lighter dark blue
          700: '#22435f',  // lighter dark blue
          600: '#2a506e',  // even lighter
          500: '#325d7d',  // medium dark blue
          // Text colors for dark theme
          text: {
            primary: '#FAFAFA',   // off white for main text
            secondary: '#FFFFFF', // pure white for emphasis
            muted: '#E6EFFF',     // medium light blue for muted text
          }
        },
        // Light theme colors
        light: {
          // Backgrounds
          50: '#FFFFFF',   // pure white
          100: '#FAFAFA',  // off white
          200: '#F2F5FB',  // light blue
          300: '#E6EFFF',  // medium light blue
          // Text colors for light theme
          text: {
            primary: '#000000',   // black for main text
            secondary: '#122941', // dark blue for secondary text
            muted: '#5A6B7D',     // muted gray-blue
          }
        },
        // Accent colors
        accent: {
          orange: '#D83713',     // orange for buttons and highlights
          'orange-hover': '#B8300F', // darker orange for hover states
          'orange-light': '#E6451A', // lighter orange variant
        },
        // Semantic colors that work in both themes
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
