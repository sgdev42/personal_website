# Personal Website

Personal website for Simon Guo, deployed with GitHub Pages.

## What this includes

- Multi-page site: Home, About, Projects, Blog, Contact
- Chinese mirror pages under `zh/` with EN/中文 page switching
- Futuristic, minimal visual style with subtle motion accents
- Lightweight JavaScript for mobile menu, reveal effects, footer year, and blog cards
- 404 page, `robots.txt`, `sitemap.xml`, `.nojekyll`
- GitHub Actions workflow to deploy to GitHub Pages on push to `main`

## Project structure

```text
.
├── .github/workflows/deploy.yml
├── assets/
│   ├── css/styles.css
│   └── js/main.js
├── pages/
│   ├── about.html
│   ├── blog.html
│   ├── contact.html
│   └── projects.html
├── zh/
│   ├── index.html
│   └── pages/
│       ├── about.html
│       ├── blog.html
│       ├── contact.html
│       └── projects.html
├── 404.html
├── index.html
├── robots.txt
└── sitemap.xml
```

## Current customization status

Already configured:
- Name and branding updated to Simon Guo (`SG`)
- Site domain configured to `https://sgdev42.github.io/personal_website/`
- Contact email and LinkedIn links configured
- GitHub profile link configured to `https://github.com/sgdev42`

Still recommended to customize:
1. Replace `Coming Soon` project slots in `pages/projects.html` and `zh/pages/projects.html` with real project details later.
2. Refine hero/about copy in `index.html` and `pages/about.html` with your final bio and focus areas.
3. Keep EN and zh content synchronized when you update text.

## Blog cards

- Blog cards are created from `pages/blog.html` and saved to browser `localStorage`.
- English and Chinese blog cards are stored separately.
- Cards are client-side only (per browser/device); they are not synced to GitHub automatically.

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main`; the workflow at `.github/workflows/deploy.yml` will deploy.

Live site URL:

`https://sgdev42.github.io/personal_website/`
