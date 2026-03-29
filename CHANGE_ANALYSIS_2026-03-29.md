# Change Analysis - 2026-03-29

## Scope

This update refined the multilingual architecture to focus on **English + Chinese only** and changed blog content workflow from browser editing to repository-managed data.

Main goal:
- Support full bidirectional translation between English and Chinese.
- Allow content authoring in either language.
- Remove on-page blog card creation and manage content through the repo.

## What Changed

1. Upgraded runtime translation layer:
- `assets/js/i18n.js`
- Language selector supported on all core pages:
  - `index.html`
  - `pages/about.html`
  - `pages/projects.html`
  - `pages/blog.html`
  - `pages/contact.html`

2. Translation strategy:
- Uses a LibreTranslate-style HTTP endpoint by default.
- Reads from `window.TRANSLATION_ENDPOINT` if provided.
- Supports only `en` and `zh-CN`.
- Translates full content (text nodes + key attributes such as `placeholder`, `title`, `aria-label`, and meta description).
- Supports mixed source language content through `data-source-lang`.
- Caches translated strings in `localStorage`.

3. Blog workflow refactor:
- Added `data/blog_cards.json` as canonical blog card source.
- Added `scripts/add_blog_card.py` helper to append cards from repository workflow.
- Removed browser-side form creation flow.
- Blog cards now store `source_lang` (`en` or `zh-CN`) and translate to the selected display language at runtime.

4. Content architecture changes:
- Removed duplicated Chinese static pages:
  - `zh/index.html`
  - `zh/pages/about.html`
  - `zh/pages/projects.html`
  - `zh/pages/blog.html`
  - `zh/pages/contact.html`
- Updated sitemap to keep only canonical single-source URLs.

## Test Results

### Test 1: Local link and asset integrity
Command:
- Python script validating all local `href`/`src` targets across HTML pages.

Result:
- PASS (`OK: all local href/src targets exist`)

### Test 2: i18n script wiring
Command:
- Python script validating language selector and `i18n.js` inclusion on all core pages.

Result:
- PASS (`OK: language switch + i18n script present on all pages`)

### Test 3: External translation endpoint reachability (environment-level)
Command:
- `curl` POST to default endpoint `https://translate.argosopentech.com/translate`

Result:
- FAIL in this terminal environment (`Could not resolve host`)

Interpretation:
- DNS/network resolution for that host is unavailable in this environment.
- Site remains functional via source-text fallback.
- For production reliability, provide your own translation endpoint.

## Risk Notes

- Runtime machine translation quality depends on the provider.
- Network-based translation adds latency on first render per uncached string.
- For predictable quality and uptime, point `window.TRANSLATION_ENDPOINT` to a controlled backend translation service.

## Recommended Next Step

- Add a first-party translation proxy endpoint (serverless/API route) for stable reliability and quality control.
