# Secrets Playbook

## Where secrets live
- **GitHub Actions → Secrets**: CI only (e.g., SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD).
- **Vercel/Render env vars**: runtime only (NEXT_PUBLIC_* anon key is fine; never service_role).
- **Local `.env`**: developer machines only; never committed.

## Never commit
- Tokens like `sbp_…` (Supabase PAT)
- Supabase **service_role** key (JWT), DB passwords, personal access tokens
- Any `.env*` files

## Rotation
- Personal Access Tokens: rotate on compromise or quarterly.
- DB password: rotate on compromise or role change.
- Invalidate old creds, update CI/runtime secrets, re-deploy.

## Incident response
1) **Revoke** exposed token/password immediately.
2) **Reset** impacted passwords/keys.
3) **Purge** from chat/issues/PRs and force-push removal if needed.
4) **Audit** recent deploys/logins.