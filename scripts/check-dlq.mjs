#!/usr/bin/env node

/**
 * DLQ Health Check Script
 * Monitors DLQ depth and event age
 */

import { createClient } from '@supabase/supabase-js';
import { incCounter } from '../lib/shared/observability/metrics.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDLQ() {
  try {
    // Get DLQ stats
    const { data: events, error } = await supabase
      .from('dlq_events')
      .select('id, type, created_at, retry_count')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = {
      total: events.length,
      byType: {},
      oldestEvent: null,
      highRetryCount: 0,
      ageDistribution: {
        '< 1h': 0,
        '1h - 6h': 0,
        '6h - 24h': 0,
        '> 24h': 0
      }
    };

    const now = new Date();
    
    events.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      
      // Track high retry counts
      if (event.retry_count > 3) {
        stats.highRetryCount++;
      }
      
      // Age distribution
      const age = now - new Date(event.created_at);
      const hours = age / (1000 * 60 * 60);
      
      if (hours < 1) stats.ageDistribution['< 1h']++;
      else if (hours < 6) stats.ageDistribution['1h - 6h']++;
      else if (hours < 24) stats.ageDistribution['6h - 24h']++;
      else stats.ageDistribution['> 24h']++;
      
      // Track oldest
      if (!stats.oldestEvent || new Date(event.created_at) < new Date(stats.oldestEvent.created_at)) {
        stats.oldestEvent = event;
      }
    });

    // Update metrics
    incCounter('oracle_dlq_depth', stats.total);
    
    // Display results
    console.log('📊 DLQ Health Check\n');
    console.log(`Total events: ${stats.total}`);
    console.log(`High retry count (>3): ${stats.highRetryCount}`);
    
    if (stats.oldestEvent) {
      const age = Math.floor((now - new Date(stats.oldestEvent.created_at)) / (1000 * 60 * 60));
      console.log(`Oldest event: ${age} hours old`);
    }
    
    console.log('\nEvents by type:');
    Object.entries(stats.byType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    
    console.log('\nAge distribution:');
    Object.entries(stats.ageDistribution).forEach(([range, count]) => {
      if (count > 0) {
        console.log(`  ${range}: ${count}`);
      }
    });
    
    // Alert conditions
    const maxSize = parseInt(process.env.DLQ_MAX_SIZE || '10000');
    if (stats.total > maxSize) {
      console.log(`\n⚠️  WARNING: DLQ size (${stats.total}) exceeds threshold (${maxSize})`);
    }
    
    if (stats.ageDistribution['> 24h'] > 0) {
      console.log(`\n⚠️  WARNING: ${stats.ageDistribution['> 24h']} events older than 24 hours`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ DLQ check failed:', error.message);
    process.exit(1);
  }
}

checkDLQ();