/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          'dark-primary': 'var(--color-dark-primary)',
          'light-primary': 'var(--color-light-primary)',
          'primary': 'var(--color-primary)',
          'text-icons': 'var(--color-text-icons)',
          'primary-text': 'var(--color-primary-text)',
          'secondary-text': 'var(--color-secondary-text)',
          'accent': 'var(--color-accent)',
          'divider': 'var(--color-divider)',
        },
      },
    },
  },
  plugins: [],
}
