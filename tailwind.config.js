/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#E85A8B',
        'brand-navy': '#0B1830',
        pink: { 500: '#E85A8B' },
        navy: { 900: '#0B1830' }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f0536d 0%, #ee6aa3 60%, #d946ef 100%)'
      }
    }
  },
  plugins: []
};
