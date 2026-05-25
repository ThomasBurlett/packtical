# Packtical

Packtical is an interactive prep and packing hub for outdoor activities and travel.

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
- Optional Supabase auth and synced progress storage
- Ad-hoc custom items supported per section

## Local development

Install dependencies and start the Vite dev server:

```bash
pnpm install
pnpm dev
```

Then open the local URL printed by Vite.

## Supabase sync

The app works without Supabase and falls back to local saves. To enable sign-in and synced checklist progress:

1. Create a Supabase project.
2. Run [docs/supabase.sql](docs/supabase.sql) in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In Supabase Auth URL settings, add your local dev URL and GitHub Pages URL, for example:
   - `http://localhost:5173`
   - `https://<my-github-username>.github.io/packtical/`

Only the public anon key belongs in the frontend. Keep the service role key out of GitHub Pages.

## GitHub Pages

This site now deploys through GitHub Actions instead of serving the repository root directly.

Repository settings should use:

- **Build and deployment**: **GitHub Actions**

Expected Pages URL:

`https://<my-github-username>.github.io/packtical/`

Main React routes:

- `/#/camping`
- `/#/trail-running`
- `/#/travel-preparation`
- `/#/backpacking`
- `/#/basic-cycling`
- `/#/mountain-biking`

## If Pages is showing an old custom domain

If your site opens at `http://burlett.xyz/packtical/`, a custom domain is still configured for this repository or your account-level Pages config.

To reset it:

1. Go to **GitHub -> this repository -> Settings -> Pages**.
2. In **Custom domain**, clear `burlett.xyz` and click **Save**.
3. If present, delete any `CNAME` file at the repo root.
4. Confirm source is **GitHub Actions**.
5. Wait a few minutes and reload the GitHub Pages URL.
