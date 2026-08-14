/** @type {import('tailwindcss').Config} */

/*
 * Palette Deeva applicata a tutta la dashboard.
 *
 * Come funziona: invece di riscrivere 2.000 righe di componenti, qui
 * ridefiniamo che cosa SIGNIFICANO i nomi dei colori già usati nel codice.
 * È come cambiare i colori dentro i barattoli lasciando le etichette:
 * `text-pink-400` continua a esistere, ma ora esce coral Deeva.
 *
 * Trucco importante: `white` è rimappato sull'inchiostro caldo. Nel tema
 * scuro `text-white` era il testo dei titoli; sul fondo chiaro deve essere
 * scuro. Tutti gli usi di `bg-white/…` e `border-white/…` sono con
 * trasparenza, quindi diventano veli caldi e continuano a funzionare.
 *
 * Fonte dei valori: Tech/deeva-marketing-hub/theme/deeva-theme.css
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Formiga', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // inchiostro caldo al posto del bianco (vedi nota sopra)
        white: '#1A1410',

        brand: { 400: '#FF7060', 500: '#FF5740', 600: '#F04A33', 700: '#D93E29' },

        // superfici: 900 = sfondo pagina crema, 800 = card bianca
        surface: {
          900: '#FFF7EC',
          800: '#FFFFFF',
          700: '#FFF1DF',
          600: '#FFECD3',
          500: '#EFE4D6',
        },

        // neutri caldi, con la scala invertita rispetto al tema scuro:
        // prima "gray-200" era chiaro su fondo scuro, ora è scuro su fondo chiaro
        gray: {
          50: '#FFF7EC',
          100: '#FFF1DF',
          200: '#2A231D',
          300: '#3A322B',
          400: '#6F655C',
          500: '#6F655C',
          600: '#8B8078',
          700: '#A69B92',
          800: '#C4B9AE',
          900: '#EFE4D6',
        },

        // accento principale: coral Deeva
        pink: {
          300: '#FF7060',
          400: '#FF5740',
          500: '#FF5740',
          600: '#F04A33',
          700: '#D93E29',
          900: '#FFEEEC',
        },
        fuchsia: { 300: '#FF7060', 400: '#FF5740', 500: '#FF5740', 600: '#F04A33' },

        // segnali positivi
        emerald: {
          300: '#3E8E42',
          400: '#2E7D32',
          500: '#2E7D32',
          600: '#25692A',
          700: '#1E5622',
        },
        green: { 300: '#3E8E42', 400: '#2E7D32', 500: '#2E7D32', 600: '#25692A' },

        // segnali di attenzione
        amber: {
          300: '#E8963A',
          400: '#D98324',
          500: '#D98324',
          600: '#B96C18',
        },
        yellow: { 300: '#E8963A', 400: '#D98324', 500: '#D98324', 600: '#B96C18' },

        // segnali negativi
        rose: {
          300: '#E2483C',
          400: '#D92D20',
          500: '#D92D20',
          600: '#B92318',
          700: '#961C13',
        },
        red: { 300: '#E2483C', 400: '#D92D20', 500: '#D92D20', 600: '#B92318' },

        // azzurro Deeva (tinte più scure sui testi, per restare leggibile su crema)
        blue: {
          300: '#5FAFFF',
          400: '#2F86DB',
          500: '#2F86DB',
          600: '#5FAFFF',
          700: '#1F6EBB',
        },
        sky: { 300: '#5FAFFF', 400: '#2F86DB', 500: '#2F86DB', 600: '#5FAFFF' },
        cyan: { 300: '#5FAFFF', 400: '#2F86DB', 500: '#2F86DB', 600: '#5FAFFF' },
        teal: { 300: '#5FAFFF', 400: '#2F86DB', 500: '#2F86DB', 600: '#5FAFFF' },

        // borgogna, l'accento scuro del brand
        violet: { 300: '#A75F5C', 400: '#914C49', 500: '#914C49', 600: '#7B3E3B' },
        purple: { 300: '#A75F5C', 400: '#914C49', 500: '#914C49', 600: '#7B3E3B' },
        indigo: { 300: '#A75F5C', 400: '#914C49', 500: '#914C49', 600: '#7B3E3B' },
      },
      boxShadow: {
        card: '0 14px 44px -22px color-mix(in oklab, #ff5740 28%, transparent)',
        soft: '0 18px 50px -18px color-mix(in oklab, #ff5740 35%, transparent)',
      },
    },
  },
  plugins: [],
}
