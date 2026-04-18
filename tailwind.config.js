/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#16182C',
        'primary-container': '#2B2D42',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#9394AE',
        'secondary': '#A14000',
        'secondary-container': '#FD711F',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#5B2100',
        'surface': '#FBF8FF',
        'surface-dim': '#D7D8F4',
        'surface-bright': '#FBF8FF',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F4F2FF',
        'surface-container': '#EDECFF',
        'surface-container-high': '#E6E6FF',
        'surface-container-highest': '#E0E0FC',
        'on-surface': '#181A2E',
        'on-surface-variant': '#46464D',
        'outline': '#77767D',
        'outline-variant': '#C7C5CD',
        'background': '#FBF8FF',
        'on-background': '#181A2E',
        'error': '#BA1A1A',
        'cta': '#E8620A',
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'label': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
