# camping-checklist

Interactive checklist hub for multiple outdoor activities and travel prep.

## Included checklists

- Camping
- Trail running
- Travel preparation
- Backpacking
- Basic cycling
- Mountain biking

## Current app shape

- Static multi-page site for GitHub Pages
- Activity-specific URLs such as `/camping/` and `/backpacking/`
- Per-activity local progress saved in `localStorage`
- Ad-hoc custom items supported per section

## Local development

Because this uses ES modules, run it behind a local static server instead of opening files directly:

```bash
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## GitHub Pages

This site is designed to work with the existing Pages setup:

- **Deploy from a branch**
- branch **main**
- folder **/(root)**

Expected Pages URL:

`https://<my-github-username>.github.io/camping-checklist/`

## If Pages is showing an old custom domain

If your site opens at `http://burlett.xyz/camping-checklist/`, a custom domain is still configured for this repository or your account-level Pages config.

To reset it:

1. Go to **GitHub → this repository → Settings → Pages**.
2. In **Custom domain**, clear `burlett.xyz` and click **Save**.
3. If present, delete any `CNAME` file at the repo root.
4. Confirm source is **Deploy from a branch**, branch **main**, folder **/(root)**.
5. Wait a few minutes and reload the GitHub Pages URL.
