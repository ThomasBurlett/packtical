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

- React application built with Vite
- Hash-based checklist routes such as `/#/camping` and `/#/backpacking`
- Legacy activity paths such as `/camping/` and `/backpacking/` redirect into the React app
- Per-activity local progress saved in `localStorage`
- Ad-hoc custom items supported per section

## Local development

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## GitHub Pages

This site now deploys through GitHub Actions instead of serving the repository root directly.

Repository settings should use:

- **Build and deployment**: **GitHub Actions**

Expected Pages URL:

`https://<my-github-username>.github.io/camping-checklist/`

Main React routes:

- `/#/camping`
- `/#/trail-running`
- `/#/travel-preparation`
- `/#/backpacking`
- `/#/basic-cycling`
- `/#/mountain-biking`

## If Pages is showing an old custom domain

If your site opens at `http://burlett.xyz/camping-checklist/`, a custom domain is still configured for this repository or your account-level Pages config.

To reset it:

1. Go to **GitHub -> this repository -> Settings -> Pages**.
2. In **Custom domain**, clear `burlett.xyz` and click **Save**.
3. If present, delete any `CNAME` file at the repo root.
4. Confirm source is **GitHub Actions**.
5. Wait a few minutes and reload the GitHub Pages URL.
