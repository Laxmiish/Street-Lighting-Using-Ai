/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        smart: {
          bg: '#0F172A',         // Slate 900
          surface: '#1E293B',    // Slate 800
          card: '#1E293B',
          border: '#334155',     // Slate 700
          primary: '#1E3A8A',    // Deep Blue
          ai: '#38BDF8',         // Sky 400 Neon
          glow: '#FDE047',       // Yellow Light
          emerald: '#10B981',    // Online / Savings
          amber: '#F59E0B',      // Dimmed / Motion
          red: '#EF4444',        // Faults / Critical
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
