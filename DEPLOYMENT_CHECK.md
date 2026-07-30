# Deployment verification

Verified on 30 July 2026.

## Production build

- Command: `npm run check`
- JavaScript syntax check: passed
- Static build output: `dist/`
- Required runtime environment variables: none
- Node.js packages required at runtime: none

## Functional browser checks

- Question bank list and question cards render correctly
- Create a new question bank
- Create a single MC question
- Bulk text import
- CSV import using Excel-compatible columns
- Quiz answer selection and question navigation
- Timer and progress display
- Submit quiz and display score / correct answers / explanations
- Settings save, large font and dark mode
- JSON backup download
- 390 px mobile viewport has no horizontal overflow
- Browser console/page errors during tested flows: none

## Hosting configurations

- Vercel: `vercel.json` runs `npm run build` and publishes `dist`
- GitHub Pages: `.github/workflows/deploy-pages.yml` builds and deploys `dist`
