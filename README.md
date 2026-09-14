# Inside Playwright — architecture explained, compared with Selenium

A single-page, scrollable blog built with **React + Vite** that explains Playwright's
architecture in plain language, traces one real test through the layers step by step,
and compares it with Selenium. Includes four hand-drawn SVG diagrams, a light/dark
theme, a sticky table of contents, and a reading-progress bar.

Written by Animesh Sharma for LinkedIn / Medium. Feel free to fork.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build for production

```bash
npm run build      # static output in dist/
npm run preview    # serve dist/ locally to check it
```

## Deploy to GitHub Pages (free hosting → shareable link)

1. Push this repo to GitHub.
2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the site and publishes it.
4. Your page will be live at `https://<your-username>.github.io/<repo-name>/`.

`vite.config.js` sets `base: './'`, so the build uses relative paths and works from any sub-path
without further changes.

## Project structure

```
index.html                     – page shell, fonts, meta tags
src/main.jsx                   – React entry point
src/App.jsx                    – the article (all content lives here)
src/styles.css                 – design tokens (light + dark) and layout
src/components/Chrome.jsx      – top bar, theme toggle, progress bar, TOC, back-to-top
src/components/Blocks.jsx      – Section, Analogy callout, CodeBlock, Step card
src/components/Diagrams.jsx    – the four SVG diagrams
.github/workflows/deploy.yml   – GitHub Pages deployment
```

## Editing the content

Everything a reader sees is in `src/App.jsx`. Sections are plain JSX, so you can
rewrite paragraphs, add steps to the trace, or change rows in the comparison table
without touching any logic. Colour coding is driven by two CSS variables in
`src/styles.css`: `--pw` (Playwright, green) and `--se` (Selenium, amber).

## Licence

MIT — reuse the code freely. Please credit the article text if you republish it.
