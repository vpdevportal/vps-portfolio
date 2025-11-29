/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          surface: '#0a0a0a',
          card: '#111111',
        },
        accent: {
          primary: '#00ff88',
          secondary: '#00d4ff',
        },
        green: {
          gradient: {
            start: '#00ff88',
            end: '#00a855',
            dark: '#003d1f',
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
      }
    },
  },
  plugins: [],
}

