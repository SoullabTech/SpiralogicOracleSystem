const { exec } = require('child_process');
const fs = require('fs');

async function notify(channel, message) {
  const fetch = (await import('node-fetch')).default;
  
  if (channel === 'SLACK_WEBHOOK_URL' && process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🔧 Spiralogic CI/CD: ${message}` })
    });
  }
  
  if (channel === 'TELEGRAM' && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `🔧 Spiralogic CI/CD: ${message}`
      })
    });
  }
}

async function attemptRepair() {
  console.log("🔍 CI/CD failure detected. Attempting hot patch repair...");
  await notify('SLACK_WEBHOOK_URL', 'Build failed. Attempting automated repair...');
  await notify('TELEGRAM', 'Build failed. Attempting automated repair...');

  // Common repair strategies
  const repairs = [
    // Fix package-lock.json issues
    () => {
      console.log("🔧 Attempting package-lock repair...");
      return new Promise(resolve => {
        exec('rm -f package-lock.json && npm install', (err) => {
          if (!err) console.log("✅ Package-lock repaired");
          resolve(!err);
        });
      });
    },
    
    // Fix TypeScript compilation issues
    () => {
      console.log("🔧 Attempting TypeScript repair...");
      return new Promise(resolve => {
        exec('npm run lint:fix', (err) => {
          if (!err) console.log("✅ TypeScript issues fixed");
          resolve(!err);
        });
      });
    },
    
    // Clear cache and rebuild
    () => {
      console.log("🔧 Attempting cache clear and rebuild...");
      return new Promise(resolve => {
        exec('npm cache clean --force && npm ci', (err) => {
          if (!err) console.log("✅ Cache cleared and rebuilt");
          resolve(!err);
        });
      });
    }
  ];

  // Try each repair strategy
  for (const repair of repairs) {
    const success = await repair();
    if (success) {
      console.log("🔍 Retesting build after repair...");
      
      return new Promise(resolve => {
        exec('npm run build && npm test', async (err) => {
          if (err) {
            console.error("❌ Repair attempt failed, continuing to next strategy...");
            resolve(false);
          } else {
            console.log("✅ Repair successful. Build and tests passing.");
            await notify('SLACK_WEBHOOK_URL', 'Automated repair successful! Build recovered.');
            await notify('TELEGRAM', 'Automated repair successful! Build recovered.');
            resolve(true);
          }
        });
      });
    }
  }

  console.error("❌ All repair strategies failed. Triggering rollback...");
  await notify('SLACK_WEBHOOK_URL', 'All repair attempts failed. Triggering rollback...');
  await notify('TELEGRAM', 'All repair attempts failed. Triggering rollback...');
  return false;
}

module.exports = { attemptRepair, notify };

// Run if called directly
if (require.main === module) {
  attemptRepair().then(success => {
    process.exit(success ? 0 : 1);
  });
}