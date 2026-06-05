# Deploy Print Check to GitHub Pages

The live link only works **after** the repo is pushed to GitHub and Pages is enabled.

## One-time setup (about 2 minutes)

### 1. Log in to GitHub CLI

```bash
gh auth login
```

Choose:
- **GitHub.com**
- **HTTPS**
- **Login with a web browser** (easiest)

### 2. Create repo and deploy

```bash
cd ~/Projects/print-check
./scripts/setup-github.sh
```

### 3. Enable GitHub Pages (if the script didn't)

1. Open https://github.com/andmarquez/print-check/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Wait 2–3 minutes for the workflow to finish

### 4. Your live URL

https://andmarquez.github.io/print-check/

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 on the URL | Repo not created yet — run steps above |
| Blank page | Check Actions tab for failed build |
| Assets missing | Ensure `GITHUB_PAGES=true` in the deploy workflow (already configured) |

## Manual alternative (no `gh` CLI)

1. Create a new public repo named `print-check` at https://github.com/new
2. Run:

```bash
cd ~/Projects/print-check
git remote add origin https://github.com/andmarquez/print-check.git
git push -u origin main
```

3. Enable **GitHub Actions** as the Pages source in repo Settings → Pages
