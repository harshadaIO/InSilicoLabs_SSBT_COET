/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#eef4ed',
        navy: {
          950: '#0b2545',
          900: '#13315c',
          800: '#134074',
        },
        ice: {
          400: '#8da9c4',
          200: '#c2d3e4',
          100: '#dce6ef',
          50: '#f2f6f9',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glass': '0 4px 20px -2px rgba(11, 37, 69, 0.05)',
        'glass-lg': '0 10px 30px -5px rgba(11, 37, 69, 0.08)',
      },
    },
  },
  plugins: [],
}
