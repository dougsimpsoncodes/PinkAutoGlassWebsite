/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from design tokens
        'brand-pink': '#E85A8B',
        'brand-navy': '#0B1830',
        brand: {
          pink: '#E85A8B',
          navy: '#0B1830',
          primary: {
            50: '#fef2f6',
            100: '#fde5ed',
            200: '#fbc9da',
            300: '#f8a0bf',
            400: '#f472a0',
            500: '#E85A8B',
            600: '#d93d6f',
            700: '#b82e58',
            800: '#982748',
            900: '#7f233e'
          },
          magenta: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843'
          }
        },
        // Extend pink for compatibility
        pink: { 
          50: '#fef2f6',
          100: '#fde5ed',
          200: '#fbc9da',
          300: '#f8a0bf',
          400: '#f472a0',
          500: '#E85A8B',
          600: '#d93d6f',
          700: '#b82e58',
          800: '#982748',
          900: '#7f233e'
        },
        navy: { 
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0B1830'
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#d97706'
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#dc2626'
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          700: '#1d4ed8'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f0536d 0%, #ee6aa3 60%, #d946ef 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f87171 0%, #f472b6 100%)',
        'gradient-light': 'linear-gradient(135deg, #fbc9da 0%, #fbcfe8 100%)',
        'gradient-dark': 'linear-gradient(135deg, #982748 0%, #831843 100%)',
        'gradient-hero': 'linear-gradient(135deg, #E85A8B 0%, #ee6aa3 50%, #d946ef 100%)',
        'hero-overlay': 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)'
      },
      fontFamily: {
        'display': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'ui': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem'
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(232, 90, 139, 0.2)',
        'brand-hover': '0 8px 25px 0 rgba(232, 90, 139, 0.3)',
        'brand-lg': '0 8px 25px 0 rgba(232, 90, 139, 0.4)'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-left': 'slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideInLeft: {
          'from': {
            opacity: '0',
            transform: 'translateX(-50px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        scaleIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      zIndex: {
        'hide': '-1',
        'auto': 'auto',
        'base': '0',
        'docked': '10',
        'dropdown': '1000',
        'sticky': '1100',
        'banner': '1200',
        'overlay': '1300',
        'modal': '1400',
        'popover': '1500',
        'skip-link': '1600',
        'toast': '1700',
        'tooltip': '1800'
      }
    }
  },
  plugins: []
};