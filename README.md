# nature miscommunications

This is my personal academic portfolio. A minimal landing page leads to my resume, which is written as a journal article.

**Live site:** [pritamsaha.co.in](https://pritamsaha.co.in)
**Previous portfolio:** [old.pritamsaha.co.in](https://old.pritamsaha.co.in)

The resume page is laid out like a research paper. Education becomes the Introduction, publications become the Results with a figure and in-text citations, technical skills become the Methods and a table, and the funding, acknowledgements and "competing interests" sections carry the jokes.

> **Satire notice:** The resume page is a satirical personal portfolio. It is not affiliated with, endorsed by, or connected to Springer Nature Limited or the journal *Nature Communications*. All trademarks belong to their respective owners.

## Features

* Minimal monospace landing page with profile links, a short bio, an obfuscated email address and a publications list
* Article-style resume layout with a sticky article bar, a reading-progress bar and a sidebar with **Sections**, **Figures** and **References** tabs
* Numbered in-text citations with hover cards, linked to a full reference list
* Interactive publication-output chart (Fig. 1) with tooltips, a sidebar thumbnail and a full-size viewer
* Animated article metrics, plus dialogs for citing the article, the journal info and the open access policy
* Light and dark themes with an accessible toggle
* Responsive layout. On mobile the sidebar is replaced by a sticky Download PDF bar
* Print stylesheet for a clean paper copy
* Accessibility: skip link, keyboard-navigable tabs and dialogs, labelled landmarks and reduced-motion support
* SEO and sharing metadata: Open Graph, Twitter cards, Highwire `citation_*` tags for scholarly indexers, JSON-LD, a sitemap and a web manifest
* A custom 404 page that redirects old portfolio URLs to the previous site

## Tech stack

Plain **HTML, CSS and vanilla JavaScript**, with no framework, no build step and no dependencies. The only external resource is [Google Fonts](https://fonts.google.com) (JetBrains Mono on the landing page, Merriweather and PT Serif on the resume page).

## Project structure

```
.
├── index.html           Landing page (name, links, bio, publications)
├── resume.html          Resume, written as a journal article
├── resume.css           Resume styles (light/dark themes, responsive, print)
├── resume.js            Resume behaviour (tabs, citations, figure viewer, theme, dialogs)
├── 404.html             Not-found page; redirects old portfolio URLs
├── site.webmanifest     Web app manifest
├── robots.txt           Crawler rules
├── sitemap.xml          Sitemap
├── CNAME                Custom domain for GitHub Pages
└── assets/
    ├── download.pdf     Downloadable PDF of the CV
    ├── og-image.png     Social sharing preview for the resume page (1200x630)
    ├── og-home.png      Social sharing preview for the landing page (1200x630)
    └── favicon and app icons
```

## Deployment

The site is hosted on **GitHub Pages**, deployed from the `main` branch root, with the custom domain `pritamsaha.co.in` (DNS at GoDaddy).

The previous portfolio lives in a separate repository and is served from the `old.` subdomain. `404.html` redirects the old page URLs (`/about`, `/game` and so on) to it.

## Built with Claude

This website was designed and written with help from [**Claude**](https://claude.ai). Claude produced the code, styling, metadata, and the supporting files such as the landing page, 404 page, web manifest and social preview image, working from Pritam's content, direction and review.

## License

The content of the resume page is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/), as stated in the article's "Rights and permissions" section. © 2026 Pritam Saha.

