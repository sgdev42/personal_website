# Personal Website

Static personal website starter designed for GitHub Pages.

## What this includes

- Multi-page site: Home, About, Projects, Contact
- Shared responsive styling and reusable layout components
- Lightweight JavaScript for mobile menu, reveal effects, and footer year
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
│   ├── contact.html
│   └── projects.html
├── 404.html
├── index.html
├── robots.txt
└── sitemap.xml
```

## Customize before publishing

1. Replace all `Your Name`, `YN`, and placeholder content in HTML files.
2. Update links on the Contact and Projects pages.
3. Replace sitemap and robots domain:
   - `https://yourusername.github.io/personal_website/...`
   - Use your real GitHub username and repo name.

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main`; the workflow at `.github/workflows/deploy.yml` will deploy.

Your site URL will typically be:

`https://<your-github-username>.github.io/<repo-name>/`
