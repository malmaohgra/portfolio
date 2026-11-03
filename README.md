# Maram · Portfolio

Personal portfolio of **Maram**, Product Engineer focused on Arabic AI and search.
It's one static page with two case studies. There's no framework, no build step and no dependencies.

## Structure

```
index.html                 Page content (home + two case-study views)
css/style.css              Styles: theme tokens, layout, responsive rules
js/main.js                 Contact links (CONFIG), theme toggle, view router, animations
assets/favicon.svg
assets/case-studies/       Full case studies as PDF
.nojekyll                  Tells GitHub Pages to serve files as-is
```

## Editing

- **Contact links**: edit `CONFIG` at the top of `js/main.js` (email, LinkedIn, GitHub, blog). If a value is empty, its button shows "Link coming soon".
- **Colors**: edit the tokens at the top of `css/style.css`. Dark-mode values appear twice: once for the system setting and once for the manual toggle. Keep both copies the same.
- **Case studies**: each one is an `<article>` in `index.html`. It opens at `#dictionary` or `#inpocket`.

## Run locally

Open `index.html` in a browser. To serve it locally instead, run:

```bash
python3 -m http.server
```

## Deploy (GitHub Pages)

1. Go to **Settings → Pages**.
2. Set **Source** to *Deploy from a branch*. Choose `main` and `/ (root)`.
3. The site goes live at `https://<username>.github.io/<repo>/`.

If the repo is named `<username>.github.io`, the site is served from the root URL instead.

## Notes

- **Fonts**: the page uses Bricolage Grotesque, Figtree and IBM Plex Sans Arabic from Google Fonts. Thmanyah Sans is used if it's installed on the visitor's device. Its license doesn't allow hosting the font files here.
- **Accessibility**: the page supports reduced motion, has visible focus styles, and labels its icons and canvas.
- **Performance**: there are no images except the favicon. The animations pause when they're off-screen or the tab is hidden.

© Maram . All rights reserved.
