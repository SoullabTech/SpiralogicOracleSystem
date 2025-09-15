const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG with sacred geometry pattern
const createSVG = (size) => {
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad">
          <stop offset="0%" stop-color="#9F7AEA"/>
          <stop offset="50%" stop-color="#805AD5"/>
          <stop offset="100%" stop-color="#553C9A"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${size/64}"/>
      ${[0,1,2,3,4,5].map(i => {
        const angle = (i * Math.PI * 2) / 6;
        const x = size/2 + Math.cos(angle) * size/4;
        const y = size/2 + Math.sin(angle) * size/4;
        return `<circle cx="${x}" cy="${y}" r="${size/6}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${size/64}"/>`;
      }).join('')}
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dy=".3em" fill="white" font-size="${size/8}" font-family="system-ui">SO</text>
    </svg>
  `;
};

async function generateIcons() {
  for (const size of sizes) {
    const svg = createSVG(size);
    const buffer = Buffer.from(svg);

    await sharp(buffer)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate additional icons referenced in manifest
  const additionalIcons = ['wild-petal', 'check-in', 'journal'];
  for (const name of additionalIcons) {
    const svg = createSVG(192);
    const buffer = Buffer.from(svg);

    await sharp(buffer)
      .png()
      .toFile(path.join(iconsDir, `${name}.png`));

    console.log(`Generated ${name}.png`);
  }
}

generateIcons().then(() => {
  console.log('All icons generated successfully!');
}).catch(err => {
  console.error('Error generating icons:', err);
});