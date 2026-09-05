# Cloudflare Workers

Two small reverse-proxy Workers used for the Hetzner VPS -> Cloudflare
Pages/Cloud Run migration, since Cloudflare Pages custom domains don't
support path-based routing to a different origin and Cloud Run's own
domain-mapping feature requires interactive Google Search Console
verification.

- **api-proxy**: routes `api.sourcetaster.com/*` to the `source-taster-api`
  Cloud Run service.
- **app-proxy**: routes `sourcetaster.com/app/*` (and `/app`) to
  `sourcetaster-web.pages.dev`, stripping the `/app` prefix — replicates the
  nginx `location /app/` rule from the old VPS setup, since the Cloudflare
  Pages project bound to `sourcetaster.com` (the landing page) can't also
  serve a different project under a sub-path.

Deploy (each is independent):

```bash
npx wrangler deploy --config infra/cloudflare-workers/api-proxy.wrangler.toml
npx wrangler deploy --config infra/cloudflare-workers/app-proxy.wrangler.toml
```

Requires `CLOUDFLARE_API_TOKEN` env var with Workers Scripts Edit + the
zone's Workers Routes Edit permission.
