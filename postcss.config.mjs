// Tailwind CSS 4 qua PostCSS – dùng cho cả `next dev` (Turbopack) lẫn `next build --webpack`
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
