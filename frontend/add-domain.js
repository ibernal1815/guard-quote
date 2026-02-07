// Use wrangler's internal auth to add custom domain
const { exec } = require('child_process');

// Get the zone ID and add domain via API
exec('npx wrangler whoami', (err, stdout) => {
  console.log(stdout);
});
