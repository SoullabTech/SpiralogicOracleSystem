# Sync Logs

This folder contains auto-generated sync status logs from the `sync-to-obsidian.sh` script.

## What Gets Logged

- Timestamp of sync
- Files transferred
- Files skipped (already up to date)
- Transfer statistics
- Destination path

## Log Format

Logs can be manually created here if needed, or you can redirect sync output:

```bash
./scripts/sync-to-obsidian.sh | tee docs/SYNC_LOGS/SYNC_LOG_$(date +%Y%m%d_%H%M%S).md
```

## Retention

- Keep logs for 30 days
- Archive older logs if needed
- Logs help debug sync issues and track documentation updates