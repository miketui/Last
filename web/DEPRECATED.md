# ⛔ RETIRED — do not deploy

**Decision (2026-05-30):** This Bun + `server.ts` web app is **retired**. The
canonical, live Curls & Contemplation site is the **Next.js app** at
`github.com/miketui/curls-and-contemplation-site`.

Do **not** build, deploy, or point DNS at anything in this `web/` directory.

## To fully decommission (owner actions — hosting/DNS)
1. **Take down the live deployment** of this app (Railway — see `web/railway.toml`
   / `web/nixpacks.toml`): delete the service / stop the deployment.
2. **Remove any Stripe webhook endpoints** that point at this app, so refunds /
   purchases aren't double-processed against the wrong database.
3. **Repoint DNS** for the production domain to the Next.js site on Vercel.
4. Revoke any API keys/tokens that were scoped only to this app.

The code is left in place for reference/history; it is not maintained.
