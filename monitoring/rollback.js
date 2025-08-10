const { exec } = require('child_process');

async function notify(channel, message) {
  const fetch = (await import('node-fetch')).default;
  
  if (channel === 'SLACK_WEBHOOK_URL' && process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `⏪ Spiralogic CI/CD: ${message}` })
    });
  }
  
  if (channel === 'TELEGRAM' && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `⏪ Spiralogic CI/CD: ${message}`
      })
    });
  }
}

async function rollback() {
  console.log("⏪ Repair failed. Rolling back to last stable commit...");
  await notify('SLACK_WEBHOOK_URL', 'Rolling back to last stable commit...');
  await notify('TELEGRAM', 'Rolling back to last stable commit...');

  return new Promise((resolve) => {
    // Find the last commit that passed CI
    exec('git log --oneline --grep="✅" -1 --format="%H"', (err, stdout) => {
      const lastStableCommit = stdout.trim();
      
      if (lastStableCommit) {
        console.log(`🔄 Rolling back to commit: ${lastStableCommit}`);
        
        exec(`git reset --hard ${lastStableCommit}`, async (resetErr) => {
          if (resetErr) {
            console.error("❌ Rollback failed:", resetErr.message);
            await notify('SLACK_WEBHOOK_URL', `Rollback failed: ${resetErr.message}`);
            await notify('TELEGRAM', `Rollback failed: ${resetErr.message}`);
            resolve(false);
          } else {
            console.log("✅ Successfully rolled back to stable state");
            await notify('SLACK_WEBHOOK_URL', 'Successfully rolled back to stable state. System protected.');
            await notify('TELEGRAM', 'Successfully rolled back to stable state. System protected.');
            resolve(true);
          }
        });
      } else {
        // Fallback: rollback to previous commit
        console.log("🔄 No marked stable commit found. Rolling back to HEAD~1");
        
        exec('git reset --hard HEAD~1', async (resetErr) => {
          if (resetErr) {
            console.error("❌ Emergency rollback failed:", resetErr.message);
            await notify('SLACK_WEBHOOK_URL', `Emergency rollback failed: ${resetErr.message}. Manual intervention required.`);
            await notify('TELEGRAM', `Emergency rollback failed: ${resetErr.message}. Manual intervention required.`);
            resolve(false);
          } else {
            console.log("✅ Emergency rollback completed");
            await notify('SLACK_WEBHOOK_URL', 'Emergency rollback completed. Manual review recommended.');
            await notify('TELEGRAM', 'Emergency rollback completed. Manual review recommended.');
            resolve(true);
          }
        });
      }
    });
  });
}

module.exports = { rollback };

// Run if called directly
if (require.main === module) {
  rollback().then(success => {
    process.exit(success ? 0 : 1);
  });
}