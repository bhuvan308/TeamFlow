/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f6f7',
          100: '#e7e9ec',
          200: '#cfd3d9',
          300: '#a7aeb8',
          400: '#78818f',
          500: '#565f6d',
          600: '#3f4753',
          700: '#333941',
          800: '#25292f',
          900: '#181b1f',
        },
        // Accent pair used only for gradients (buttons, active nav, hero,
        // subtle card accents) - everything else stays on the neutral
        // `brand` scale so the UI reads as minimal rather than colorful.
        accent: {
          from: '#6366f1', // indigo-500
          via: '#8b5cf6', // violet-500
          to: '#d946ef', // fuchsia-500
        },
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef 100%)',
        'accent-gradient-soft': 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #fdf4ff 100%)',
        'accent-gradient-text': 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
