#!/usr/bin/env node

/**
 * Pin IPFS build to Pinata for persistent hosting
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const recursive = require('recursive-fs');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.error('❌ Missing Pinata credentials');
  console.error('Set PINATA_API_KEY and PINATA_SECRET_KEY environment variables');
  process.exit(1);
}

async function pinDirectoryToPinata() {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const src = path.join(__dirname, '../out');
  
  console.log('📌 Pinning directory to Pinata...');
  console.log(`Source: ${src}`);
  
  try {
    // Get all files recursively
    const { files } = await recursive.read(src);
    
    // Create form data
    const data = new FormData();
    
    // Add all files
    for (const file of files) {
      const content = fs.createReadStream(file);
      const relativePath = path.relative(src, file);
      data.append('file', content, {
        filepath: `spiralogic-oracle/${relativePath}`
      });
    }
    
    // Add metadata
    const metadata = JSON.stringify({
      name: 'Spiralogic Oracle Frontend',
      keyvalues: {
        version: '2.0.0',
        type: 'frontend',
        framework: 'nextjs',
        deployment: 'sovereign'
      }
    });
    data.append('pinataMetadata', metadata);
    
    // Pin options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: true
    });
    data.append('pinataOptions', pinataOptions);
    
    // Make request
    const response = await axios.post(url, data, {
      headers: {
        ...data.getHeaders(),
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      maxBodyLength: Infinity
    });
    
    console.log('✅ Successfully pinned to Pinata!');
    console.log('📊 Pin Details:');
    console.log(`  - IPFS Hash: ${response.data.IpfsHash}`);
    console.log(`  - Pin Size: ${response.data.PinSize} bytes`);
    console.log(`  - Timestamp: ${response.data.Timestamp}`);
    
    // Save hash
    fs.writeFileSync('pinata-hash.txt', response.data.IpfsHash);
    
    // Generate access URLs
    console.log('\n🌐 Access URLs:');
    console.log(`  - Pinata Gateway: https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
    console.log(`  - Cloudflare: https://cloudflare-ipfs.com/ipfs/${response.data.IpfsHash}`);
    console.log(`  - IPFS Protocol: ipfs://${response.data.IpfsHash}`);
    
    // Update package.json with IPFS hash
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.ipfsHash = response.data.IpfsHash;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error pinning to Pinata:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run pinning
pinDirectoryToPinata()
  .then(() => {
    console.log('\n✅ Pinata pinning complete!');
    console.log('Your frontend is now permanently available on IPFS');
  })
  .catch(console.error);