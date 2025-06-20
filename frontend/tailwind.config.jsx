/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Professional slate-based palette like forecasting app
        // Primary slate colors for backgrounds and text
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        
        // Professional blue accent (primary action color)
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Success/positive actions (green)
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        // Warning/attention (yellow/amber)
        yellow: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        // Creative/special features (purple)
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        
        // Danger/destructive actions (red)
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Legacy colors for compatibility (gradually phase out)
        comicInk: "#1e293b", // slate-800
        ocean: { 
          400: "#60a5fa", // blue-400
          500: "#3b82f6", // blue-500
          600: "#2563eb", // blue-600
          700: "#1d4ed8"  // blue-700
        },
        
        adventure: { 
          400: "#4ade80", // green-400
          500: "#22c55e", // green-500
          600: "#16a34a", // green-600
          700: "#15803d"  // green-700
        },
        
        energy: { 
          400: "#fb923c", // yellow-400
          500: "#f59e0b", // yellow-500
          600: "#d97706", // yellow-600
          700: "#b45309"  // yellow-700
        },
        
        hero: { 
          400: "#c084fc", // purple-400
          500: "#a855f7", // purple-500
          600: "#9333ea", // purple-600
          700: "#7c3aed"  // purple-700
        },
        
        sunshine: { 
          400: "#fbbf24", // yellow-400
          500: "#f59e0b", // yellow-500
          600: "#d97706", // yellow-600
          700: "#b45309"  // yellow-700
        }
      },
      
      fontFamily: {
        // Use Inter as primary font like forecasting app
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        // Professional typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      borderRadius: { 
        'lg': '0.5rem',  // 8px like forecasting app
        'xl': '0.75rem', // 12px
        '2xl': '1rem',   // 16px
        '3xl': '1.5rem'  // 24px
      },
      
      boxShadow: {
        // Professional shadows matching forecasting app
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        
        // Subtle glow effects for interactive elements
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15)',
        'glow-yellow': '0 0 20px rgba(245, 158, 11, 0.15)',
      },
      
      animation: {
        // Subtle, professional animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      
      spacing: {
        // Professional spacing scale
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      }
    },
  },
  plugins: [],
};