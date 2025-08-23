# ONCALL_RUNBOOK.md

## Fast checks
- **p95 & error dashboards**: Grafana → "Core" dashboard
- **Metrics health**: `curl http://svc:3003${METRICS_PATH:-/metrics}`
- **Service health**: `curl http://svc:3003/api/health`
- **Event processing**: Check DLQ size in monitoring

## Hot paths
- **Restart service**: `docker compose restart oracle-system`
- **Rollback deployment**: 
  ```bash
  docker compose pull spiralogic:beta-green
  docker compose up -d
  ```
- **Replay DLQ**: `node ./scripts/replay-dlq.mjs --limit 100`
- **Emergency cache clear**: `redis-cli FLUSHDB`

## Common faults

### 5xx Error Spikes
1. Check agent timeouts in logs: `grep "timeout" /var/log/oracle-system.log`
2. Verify EventBus health: `curl http://svc:3003/api/health/events`
3. Replay failed events: `node ./scripts/replay-dlq.mjs --filter "status:5xx"`
4. Check idempotency violations: `grep "duplicate event" logs`

### High p95 Latency
1. Tail slow routes: `tail -f logs/slow-queries.log`
2. Check cache hit rates: `redis-cli INFO stats | grep hit`
3. Verify provider latencies:
   ```bash
   curl http://svc:3003/api/health/providers
   ```
4. Review trace sampling: `curl http://svc:3003${METRICS_PATH:-/metrics} | grep latency`

### Event Processing Issues
1. Check DLQ depth: `node ./scripts/check-dlq.mjs`
2. Verify idempotency keys: `redis-cli KEYS "idem:*" | wc -l`
3. Review event handler errors: `grep "EventHandler error" logs`
4. Force replay with new keys: `node ./scripts/replay-dlq.mjs --regenerate-keys`

## Configuration

### Environment Variables
- `METRICS_PATH`: Custom metrics endpoint (default: `/metrics`)
- `ENABLE_PII_REDACTION`: Enable PII redaction in logs (default: `true`)
- `DLQ_MAX_SIZE`: Maximum DLQ size before alerts (default: `10000`)
- `IDEMPOTENCY_TTL`: TTL for idempotency keys in seconds (default: `86400`)

## Monitoring Queries

### Prometheus
```promql
# 5xx rate by route
rate(http_requests_total{status=~"5.."}[5m]) by (route)

# p95 latency trending up
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2

# DLQ depth
oracle_dlq_depth > 1000
```

### Logs
```bash
# Recent errors with trace IDs
jq 'select(.level=="error") | {time, traceId, message, error}' logs/oracle.json

# Slow queries
jq 'select(.duration > 1000) | {time, route, duration, traceId}' logs/oracle.json
```