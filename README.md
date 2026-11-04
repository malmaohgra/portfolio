# Maram Almaohgra · Portfolio

Personal portfolio of Maram Almaohgra, Product Engineer.

**Live site: [maramalmaohgra.com](https://maramalmaohgra.com)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/screenshot-dark.png">
  <img alt="Portfolio home page: name, role and a particle butterfly" src="assets/readme/screenshot-light.png">
</picture>

## What's on the site

| Section | What it shows |
| --- | --- |
| [Arabic meaning search](https://maramalmaohgra.com/#dictionary) | Case study of a shipped RAG search for an Arabic dictionary: the problem, three design decisions and their trade-offs, and what I'd test next. |
| [InPocket](https://maramalmaohgra.com/#inpocket) | Product case study from a product management program: MVP scope, pricing and launch plan. |
| Selected work | The two case studies, plus a food segmentation notebook and my [Arabic blog](https://blog.maramalmaohgra.com). |

## How it's built

One static page in plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

The site is one page with a few interactions, so a framework would add a build step and dependencies without changing anything a visitor sees.

- **Case studies as views.** `#dictionary` and `#inpocket` open as their own views. The router updates the page title and moves focus to the new heading, so screen readers start in the right place.
- **Light and dark themes.** The page follows the system setting, and a manual toggle is saved per browser. The saved theme is applied before first paint, so there's no light flash.
- **Particle butterfly.** A butterfly shape is drawn off-screen and sampled into points. The points move toward their place, react to the pointer and scatter on tap. The loop stops when the canvas is off-screen or the tab is hidden.
- **Arabic and English.** Arabic text is marked with `lang="ar"` and `dir="rtl"`, and uses its own font stack.
- **Accessibility.** Reduced-motion support, visible focus styles, and labels on icons and the canvas.

## Project structure

```
index.html              Page content: home view and the two case-study views
css/style.css           Theme tokens, layout and responsive rules
js/main.js              Contact links, theme toggle, view router, animations
assets/                 Logo, favicons, social preview image
assets/case-studies/    Full case studies as PDF
assets/readme/          Screenshots used in this README
CNAME                   Custom domain for GitHub Pages
.nojekyll               Serve files as-is on GitHub Pages
```

## Run locally

Clone the repo and serve the folder:

```bash
git clone https://github.com/malmaohgra/portfolio.git
cd portfolio
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

The site is served by GitHub Pages from the `main` branch, at the custom domain set in `CNAME`. Every push to `main` goes live.

## Credits

- Fonts from Google Fonts: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), [Figtree](https://fonts.google.com/specimen/Figtree) and [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic).
- If Thmanyah Sans is installed on the visitor's device, Arabic text uses it. Its license doesn't allow hosting the font files here.

## License

© 2026 Maram Almaohgra. All rights reserved. The content, case studies and design are not licensed for reuse.

## Contact

[Email](mailto:malmaohgra@gmail.com) · [LinkedIn](https://www.linkedin.com/in/malmaohgra) · [Blog](https://blog.maramalmaohgra.com)
