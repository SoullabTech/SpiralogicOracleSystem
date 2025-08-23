#!/usr/bin/env node

/**
 * Dead Letter Queue (DLQ) Replay Script
 * Replays failed events with idempotency key management
 */

import { createClient } from '@supabase/supabase-js';
import { EventBus } from '../backend/src/core/events/EventBus.js';
import { logger } from '../backend/src/utils/logger.js';
import { createHash } from 'crypto';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const eventBus = new EventBus();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  limit: 100,
  filter: null,
  regenerateKeys: false,
  dryRun: false,
};

args.forEach((arg, index) => {
  switch (arg) {
    case '--limit':
      options.limit = parseInt(args[index + 1]) || 100;
      break;
    case '--filter':
      options.filter = args[index + 1];
      break;
    case '--regenerate-keys':
      options.regenerateKeys = true;
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--help':
      printHelp();
      process.exit(0);
  }
});

function printHelp() {
  console.log(`
DLQ Replay Script

Usage: node scripts/replay-dlq.mjs [options]

Options:
  --limit <n>          Number of events to replay (default: 100)
  --filter <query>     Filter events (e.g., "status:5xx", "type:oracle_response")
  --regenerate-keys    Generate new idempotency keys for replay
  --dry-run           Show what would be replayed without executing
  --help              Show this help message

Examples:
  # Replay last 50 failed events
  node scripts/replay-dlq.mjs --limit 50

  # Replay only 5xx errors
  node scripts/replay-dlq.mjs --filter "status:5xx"

  # Dry run with new idempotency keys
  node scripts/replay-dlq.mjs --regenerate-keys --dry-run
`);
}

// Idempotency key generation
function generateIdempotencyKey(event, regenerate = false) {
  const baseKey = `${event.type}:${event.userId}:${event.timestamp}`;
  if (regenerate) {
    // Add timestamp to ensure uniqueness on replay
    return createHash('sha256')
      .update(`${baseKey}:${Date.now()}`)
      .digest('hex');
  }
  return createHash('sha256').update(baseKey).digest('hex');
}

// Check if event was already processed
async function isEventProcessed(idempotencyKey) {
  const key = `idem:${idempotencyKey}`;
  const exists = await redis.exists(key);
  return exists === 1;
}

// Mark event as processed
async function markEventProcessed(idempotencyKey) {
  const key = `idem:${idempotencyKey}`;
  const ttl = parseInt(process.env.IDEMPOTENCY_TTL || '86400');
  await redis.setex(key, ttl, JSON.stringify({ processedAt: new Date().toISOString() }));
}

// Fetch events from DLQ
async function fetchDLQEvents(limit, filter) {
  try {
    // In production, this would fetch from your actual DLQ storage
    // For now, we'll simulate with a Supabase query
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let query = supabase
      .from('dlq_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filter) {
      // Parse filter like "status:5xx" or "type:oracle_response"
      const [field, value] = filter.split(':');
      if (field && value) {
        if (value.includes('*')) {
          query = query.like(field, value.replace('*', '%'));
        } else {
          query = query.eq(field, value);
        }
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch DLQ events', { error });
    return [];
  }
}

// Replay a single event
async function replayEvent(event, idempotencyKey) {
  try {
    // Check idempotency
    if (!options.regenerateKeys && await isEventProcessed(idempotencyKey)) {
      logger.info('Event already processed, skipping', { 
        eventId: event.id, 
        idempotencyKey 
      });
      return { status: 'skipped', reason: 'already_processed' };
    }

    if (options.dryRun) {
      logger.info('DRY RUN: Would replay event', {
        eventId: event.id,
        type: event.type,
        idempotencyKey
      });
      return { status: 'dry_run' };
    }

    // Reconstruct the event for replay
    const replayEvent = {
      ...event.payload,
      id: event.id,
      type: event.type,
      timestamp: new Date().toISOString(),
      metadata: {
        ...event.metadata,
        replay: true,
        originalTimestamp: event.timestamp,
        idempotencyKey
      }
    };

    // Publish through EventBus
    await eventBus.publish(replayEvent);

    // Mark as processed
    await markEventProcessed(idempotencyKey);

    logger.info('Event replayed successfully', {
      eventId: event.id,
      type: event.type,
      idempotencyKey
    });

    return { status: 'success' };
  } catch (error) {
    logger.error('Failed to replay event', {
      eventId: event.id,
      error
    });
    return { status: 'failed', error: error.message };
  }
}

// Main replay function
async function replayDLQ() {
  console.log('🔄 Starting DLQ replay...');
  console.log(`Options: ${JSON.stringify(options, null, 2)}\n`);

  const events = await fetchDLQEvents(options.limit, options.filter);
  console.log(`Found ${events.length} events to replay\n`);

  const results = {
    total: events.length,
    success: 0,
    skipped: 0,
    failed: 0,
    dryRun: 0
  };

  for (const event of events) {
    const idempotencyKey = generateIdempotencyKey(event, options.regenerateKeys);
    console.log(`Processing event ${event.id} (${event.type})...`);
    
    const result = await replayEvent(event, idempotencyKey);
    
    switch (result.status) {
      case 'success':
        results.success++;
        break;
      case 'skipped':
        results.skipped++;
        console.log(`  ⏭️  Skipped: ${result.reason}`);
        break;
      case 'failed':
        results.failed++;
        console.log(`  ❌ Failed: ${result.error}`);
        break;
      case 'dry_run':
        results.dryRun++;
        console.log(`  🔍 Dry run - would replay`);
        break;
    }
  }

  console.log('\n📊 Replay Summary:');
  console.log(`Total events: ${results.total}`);
  console.log(`✅ Success: ${results.success}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  if (options.dryRun) {
    console.log(`🔍 Dry run: ${results.dryRun}`);
  }

  // Cleanup
  await redis.quit();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Error handling
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection in DLQ replay', { error });
  process.exit(1);
});

// Run the replay
replayDLQ().catch((error) => {
  logger.error('DLQ replay failed', { error });
  process.exit(1);
});