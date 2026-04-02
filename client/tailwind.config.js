/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neo: {
                    bg: '#0f172a', // slate-900
                    card: '#1e293b', // slate-800
                    primary: '#3b82f6', // blue-500
                    accent: '#06b6d4', // cyan-500
                    glow: 'rgba(6, 182, 212, 0.5)'
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
