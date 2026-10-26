/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F4',
          100: '#E6ECE7',
          200: '#D2DFD4',
          300: '#B8CDBA', // Primary accent
          400: '#9DB7A0',
          500: '#7E9D82',
          600: '#618066',
          700: '#4A644E',
          800: '#384D3C',
          900: '#28382B',
        },
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F2', // Main background
          200: '#F4EFE5',
          300: '#ECE4D4',
          400: '#DDD2BD',
          500: '#C8B89E',
        },
        slate: {
          muted: '#34443F', // Primary text & headings
          soft: '#536560',  // Body muted
          light: '#728580', // Subtle captions
          border: '#DCE4DC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
