const ui = require('@supabase/ui/dist/config/ui.config.js')

module.exports = ui({
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/index.html',
    './node_modules/@supabase/ui/dist/config/default-theme.js', // add this
  ],
  theme: {
    extend: {},
  },
  plugins: [],
})