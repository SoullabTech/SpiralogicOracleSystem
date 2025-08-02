#!/usr/bin/env node

/**
 * Migrate consciousness data from Vercel to sovereign infrastructure
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const VERCEL_API_URL = process.env.VERCEL_API_URL || 'https://spiralogic.vercel.app/api';
const SOVEREIGN_API_URL = process.env.SOVEREIGN_API_URL || 'http://localhost:8080/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spiralogic';

class ConsciousnessDataMigrator {
  constructor() {
    this.migratedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  async migrate() {
    console.log('🔮 Starting Consciousness Data Migration');
    console.log('========================================');
    console.log('');

    try {
      // Connect to MongoDB
      console.log('🔌 Connecting to MongoDB...');
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('spiralogic');

      // Migrate user consciousness patterns
      await this.migrateUserPatterns(db);

      // Migrate archetypal interactions
      await this.migrateArchetypalInteractions(db);

      // Migrate voice synthesis cache
      await this.migrateVoiceCache(db);

      // Migrate session data
      await this.migrateSessionData(db);

      await client.close();

      this.generateMigrationReport();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  async migrateUserPatterns(db) {
    console.log('🧠 Migrating user consciousness patterns...');

    try {
      // Export patterns from Vercel
      const response = await axios.get(`${VERCEL_API_URL}/export/user-patterns`, {
        headers: { 'Authorization': `Bearer ${process.env.MIGRATION_TOKEN}` }
      });

      const patterns = response.data.patterns;
      console.log(`Found ${patterns.length} consciousness patterns`);

      // Insert into sovereign MongoDB
      if (patterns.length > 0) {
        await db.collection('consciousness_patterns').insertMany(patterns);
        this.migratedCount += patterns.length;
        console.log(`✅ Migrated ${patterns.length} consciousness patterns`);
      }

    } catch (error) {
      console.error('Failed to migrate user patterns:', error.message);
      this.errorCount++;
    }
  }

  async migrateArchetypalInteractions(db) {
    console.log('🎭 Migrating archetypal interactions...');

    try {
      const response = await axios.get(`${VERCEL_API_URL}/export/archetypal-interactions`);
      const interactions = response.data.interactions;

      console.log(`Found ${interactions.length} archetypal interactions`);

      if (interactions.length > 0) {
        await db.collection('archetypal_interactions').insertMany(interactions);
        this.migratedCount += interactions.length;
        console.log(`✅ Migrated ${interactions.length} archetypal interactions`);
      }

    } catch (error) {
      console.error('Failed to migrate archetypal interactions:', error.message);
      this.errorCount++;
    }
  }

  async migrateVoiceCache(db) {
    console.log('🎤 Migrating voice synthesis cache...');

    try {
      const response = await axios.get(`${VERCEL_API_URL}/export/voice-cache`);
      const voiceData = response.data.voiceCache;

      console.log(`Found ${voiceData.length} cached voice syntheses`);

      if (voiceData.length > 0) {
        await db.collection('voice_cache').insertMany(voiceData);
        this.migratedCount += voiceData.length;
        console.log(`✅ Migrated ${voiceData.length} voice cache entries`);
      }

    } catch (error) {
      console.error('Failed to migrate voice cache:', error.message);
      this.errorCount++;
    }
  }

  async migrateSessionData(db) {
    console.log('📊 Migrating session data...');

    try {
      const response = await axios.get(`${VERCEL_API_URL}/export/sessions`);
      const sessions = response.data.sessions;

      console.log(`Found ${sessions.length} user sessions`);

      if (sessions.length > 0) {
        await db.collection('user_sessions').insertMany(sessions);
        this.migratedCount += sessions.length;
        console.log(`✅ Migrated ${sessions.length} user sessions`);
      }

    } catch (error) {
      console.error('Failed to migrate session data:', error.message);
      this.errorCount++;
    }
  }

  async validateMigration() {
    console.log('\n🔍 Validating migration...');

    try {
      // Test sovereign API endpoints
      const healthCheck = await axios.get(`${SOVEREIGN_API_URL}/health`);
      console.log('✅ Sovereign API: HEALTHY');

      // Test archetypal query
      const testQuery = await axios.post(`${SOVEREIGN_API_URL}/process-query`, {
        userId: 'migration-test',
        message: 'Test migration query',
        includeVoice: false
      });

      if (testQuery.data.response) {
        console.log('✅ Archetypal processing: WORKING');
      }

      // Test data retrieval
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('spiralogic');

      const patternCount = await db.collection('consciousness_patterns').countDocuments();
      console.log(`✅ Consciousness patterns: ${patternCount} documents`);

      await client.close();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  generateMigrationReport() {
    const duration = (Date.now() - this.startTime) / 1000;

    console.log('\n📋 MIGRATION REPORT');
    console.log('==================');
    console.log(`Duration: ${duration} seconds`);
    console.log(`Records migrated: ${this.migratedCount}`);
    console.log(`Errors: ${this.errorCount}`);
    console.log(`Success rate: ${((this.migratedCount / (this.migratedCount + this.errorCount)) * 100).toFixed(2)}%`);

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      recordsMigrated: this.migratedCount,
      errors: this.errorCount,
      successRate: (this.migratedCount / (this.migratedCount + this.errorCount)) * 100
    };

    fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ Report saved to migration-report.json');
  }
}

// Run migration
const migrator = new ConsciousnessDataMigrator();
migrator.migrate()
  .then(() => migrator.validateMigration())
  .then(() => {
    console.log('\n🎉 Consciousness data migration complete!');
    console.log('Your archetypal wisdom is now sovereign! 🔮');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });