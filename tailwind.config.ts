import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: '#00ffff',
        neonPink: '#ff00ff',
        neonGreen: '#00ff88',
        neonAmber: '#ffaa00',
        neonRed: '#ff3366',
        darkBg: '#0a0a1a',
        panelBg: 'rgba(15,15,40,0.9)',
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at center, #12122a 0%, #0a0a1a 70%)',
        'radial-neon': 'radial-gradient(ellipse at top, rgba(0,255,255,0.05) 0%, transparent 60%)',
      },
      animation: {
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-pet': 'petBounce 0.5s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        neonPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        petBounce: {
          '0%, 100%': { transform: 'translateY(0px) scaleY(1)' },
          '40%': { transform: 'translateY(-8px) scaleY(1.05)' },
          '60%': { transform: 'translateY(-8px) scaleY(1.05)' },
        },
        petEat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1) translateY(-5px)' },
        },
        petPlay: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        petSleep: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '1' },
          '50%': { transform: 'translateY(3px)', opacity: '0.8' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00ffff, 0 0 20px rgba(0,255,255,0.5)',
        'neon-pink': '0 0 10px #ff00ff, 0 0 20px rgba(255,0,255,0.5)',
        'neon-green': '0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.5)',
        'neon-amber': '0 0 10px #ffaa00, 0 0 20px rgba(255,170,0,0.5)',
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
