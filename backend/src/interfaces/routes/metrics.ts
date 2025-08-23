import { Router } from 'express';
import { toPrometheus } from '../../../../../lib/shared/observability/metrics';
import { logger } from '../../../utils/logger';

const router = Router();

// Get metrics path from environment or use default
const metricsPath = process.env.METRICS_PATH || '/metrics';

// Prometheus metrics endpoint (configurable path)
router.get(metricsPath, (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(toPrometheus());
});

// Also support the default path if custom path is configured
if (metricsPath !== '/metrics') {
  router.get('/metrics', (req, res) => {
    res.redirect(metricsPath);
  });
}

// Log the configured metrics path on startup
logger.info('Metrics endpoint configured', { path: metricsPath });

export default router;