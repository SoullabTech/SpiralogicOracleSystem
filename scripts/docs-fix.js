#!/usr/bin/env node

/**
 * 🌸 Sacred Documentation & Assets Fixer
 * Automatically organizes markdown files and images according to project standards
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Allowed top-level markdown files
const ALLOWED_ROOT_MD = [
  'README.md',
  'CONTRIBUTING.md',
  'LICENSE.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md'
];

// Submodules to exclude
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.vercel',
  'backend/node_modules',
  'backend/backend',
  'backend/csm',
  'sesame-csm',
  'sesame_csm_openai',
  'csm',
  'SpiralogicOracleSystem'
];

// Image extensions
const IMAGE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp'
];

// Asset categories and their detection patterns
const ASSET_CATEGORIES = {
  ui: {
    patterns: [/^ui[-_]/, /screenshot/, /interface/, /dashboard/, /screen/],
    description: 'UI screenshots and mockups'
  },
  holoflower: {
    patterns: [/^holoflower[-_]/, /sacred/, /geometry/, /aether/, /divine/, /spiritual/],
    description: 'Sacred symbols & geometry'
  },
  storyboards: {
    patterns: [/^storyboard[-_]/, /flow/, /wireframe/, /journey/, /ux[-_]/],
    description: 'UX flows & wireframes'
  },
  branding: {
    patterns: [/^(logo|brand|icon)[-_]/, /logo/, /brand/, /icon/],
    description: 'Logos & brand assets'
  },
  diagrams: {
    patterns: [/^diagram[-_]/, /architecture/, /schema/, /chart/, /graph/],
    description: 'Architecture & schemas'
  },
  misc: {
    patterns: [],
    description: 'Uncategorized assets'
  }
};

// Track all operations
const operations = {
  movedDocs: [],
  movedImages: [],
  updatedReferences: [],
  errors: []
};

/**
 * Check if path should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDED_DIRS.some(dir => filePath.includes(dir));
}

/**
 * Find all files with specific extensions
 */
function findFiles(dir, extensions, files = []) {
  if (!fs.existsSync(dir) || shouldExclude(dir)) {
    return files;
  }

  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findFiles(fullPath, extensions, files);
      } else if (extensions.some(ext => item.toLowerCase().endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    operations.errors.push(`Error scanning ${dir}: ${err.message}`);
  }
  
  return files;
}

/**
 * Determine asset category based on filename and path
 */
function getAssetCategory(filePath) {
  const filename = path.basename(filePath).toLowerCase();
  const fullPath = filePath.toLowerCase();
  
  for (const [category, config] of Object.entries(ASSET_CATEGORIES)) {
    if (category === 'misc') continue;
    
    for (const pattern of config.patterns) {
      if (pattern.test(filename) || pattern.test(fullPath)) {
        return category;
      }
    }
  }
  
  return 'misc';
}

/**
 * Move markdown files to /docs/
 */
function fixMarkdownFiles() {
  console.log(`${colors.blue}📝 Checking markdown files...${colors.reset}`);
  
  const markdownFiles = findFiles('.', ['.md']);
  
  for (const file of markdownFiles) {
    const relativePath = path.relative('.', file);
    const filename = path.basename(file);
    
    // Skip if already in docs/ or is allowed root file
    if (relativePath.startsWith('docs/') || ALLOWED_ROOT_MD.includes(filename)) {
      continue;
    }
    
    // Skip excluded directories
    if (shouldExclude(relativePath)) {
      continue;
    }
    
    // Move to docs/
    const targetPath = path.join('docs', filename);
    
    // Handle duplicates
    let finalPath = targetPath;
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      const base = path.basename(filename, '.md');
      finalPath = path.join('docs', `${base}_${counter}.md`);
      counter++;
    }
    
    // Create docs directory if needed
    if (!fs.existsSync('docs')) {
      fs.mkdirSync('docs', { recursive: true });
    }
    
    // Move the file
    try {
      fs.renameSync(file, finalPath);
      operations.movedDocs.push({ from: relativePath, to: finalPath });
      console.log(`${colors.yellow}  📦 Moved: ${relativePath} → ${finalPath}${colors.reset}`);
    } catch (err) {
      operations.errors.push(`Failed to move ${file}: ${err.message}`);
    }
  }
}

/**
 * Move image files to /docs/assets/{category}/
 */
function fixImageFiles() {
  console.log(`${colors.blue}🖼️  Checking image files...${colors.reset}`);
  
  const imageFiles = findFiles('.', IMAGE_EXTENSIONS);
  
  for (const file of imageFiles) {
    const relativePath = path.relative('.', file);
    
    // Skip if already in docs/assets/
    if (relativePath.startsWith('docs/assets/')) {
      continue;
    }
    
    // Skip excluded directories
    if (shouldExclude(relativePath)) {
      continue;
    }
    
    // Determine category
    const category = getAssetCategory(file);
    const filename = path.basename(file);
    const targetDir = path.join('docs', 'assets', category);
    const targetPath = path.join(targetDir, filename);
    
    // Create target directory if needed
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Handle duplicates
    let finalPath = targetPath;
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      finalPath = path.join(targetDir, `${base}_${counter}${ext}`);
      counter++;
    }
    
    // Move the file
    try {
      fs.renameSync(file, finalPath);
      operations.movedImages.push({ 
        from: relativePath, 
        to: finalPath,
        category 
      });
      console.log(`${colors.yellow}  📦 Moved: ${relativePath} → ${finalPath} (${category})${colors.reset}`);
      
      // Update references in markdown files
      updateImageReferences(relativePath, finalPath);
    } catch (err) {
      operations.errors.push(`Failed to move ${file}: ${err.message}`);
    }
  }
}

/**
 * Update image references in markdown files
 */
function updateImageReferences(oldPath, newPath) {
  const markdownFiles = findFiles('docs', ['.md']);
  
  for (const mdFile of markdownFiles) {
    try {
      let content = fs.readFileSync(mdFile, 'utf8');
      const originalContent = content;
      
      // Update various forms of image references
      const patterns = [
        // Standard markdown image
        new RegExp(`!\\[([^\\]]*)\\]\\(${escapeRegex(oldPath)}\\)`, 'g'),
        // Relative path from docs
        new RegExp(`!\\[([^\\]]*)\\]\\(\\.\\.\/${escapeRegex(oldPath)}\\)`, 'g'),
        // HTML img tags
        new RegExp(`<img[^>]*src=["']${escapeRegex(oldPath)}["'][^>]*>`, 'g'),
        // Root relative
        new RegExp(`!\\[([^\\]]*)\\]\\(\\/${escapeRegex(oldPath)}\\)`, 'g')
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          // Calculate relative path from markdown file to new image location
          const mdDir = path.dirname(mdFile);
          const relativeNewPath = path.relative(mdDir, newPath);
          
          if (pattern.source.includes('<img')) {
            content = content.replace(pattern, (match) => {
              return match.replace(oldPath, relativeNewPath);
            });
          } else {
            content = content.replace(pattern, `![$1](${relativeNewPath})`);
          }
        }
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(mdFile, content);
        operations.updatedReferences.push({
          file: mdFile,
          oldRef: oldPath,
          newRef: newPath
        });
        console.log(`${colors.cyan}    📝 Updated reference in: ${mdFile}${colors.reset}`);
      }
    } catch (err) {
      operations.errors.push(`Failed to update references in ${mdFile}: ${err.message}`);
    }
  }
}

/**
 * Generate assets manifest
 */
function generateManifest() {
  console.log(`${colors.blue}📊 Generating assets manifest...${colors.reset}`);
  
  const manifest = {
    generated: new Date().toISOString(),
    categories: {},
    totalAssets: 0
  };
  
  // Scan each category
  for (const category of Object.keys(ASSET_CATEGORIES)) {
    const categoryPath = path.join('docs', 'assets', category);
    
    if (!fs.existsSync(categoryPath)) {
      continue;
    }
    
    const files = fs.readdirSync(categoryPath)
      .filter(f => IMAGE_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)));
    
    if (files.length > 0) {
      manifest.categories[category] = {
        description: ASSET_CATEGORIES[category].description,
        count: files.length,
        files: files.map(f => {
          const fullPath = path.join(categoryPath, f);
          const stats = fs.statSync(fullPath);
          
          // Find references in markdown
          const references = [];
          const markdownFiles = findFiles('docs', ['.md']);
          
          for (const mdFile of markdownFiles) {
            const content = fs.readFileSync(mdFile, 'utf8');
            if (content.includes(f) || content.includes(path.join('assets', category, f))) {
              references.push(path.relative('.', mdFile));
            }
          }
          
          return {
            filename: f,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            usedInDocs: references
          };
        })
      };
      
      manifest.totalAssets += files.length;
    }
  }
  
  // Write manifest
  const manifestPath = path.join('docs', 'assets', 'assets.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`${colors.green}  ✅ Manifest generated: ${manifestPath}${colors.reset}`);
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.magenta}✨ Sacred Documentation & Assets Fixer${colors.reset}`);
  console.log(`${colors.magenta}${'═'.repeat(40)}${colors.reset}\n`);
  
  // Fix markdown files
  fixMarkdownFiles();
  
  // Fix image files
  fixImageFiles();
  
  // Generate manifest
  generateManifest();
  
  // Report results
  console.log(`\n${colors.green}📊 Summary:${colors.reset}`);
  
  if (operations.movedDocs.length > 0) {
    console.log(`${colors.green}  📝 Moved ${operations.movedDocs.length} markdown files${colors.reset}`);
  }
  
  if (operations.movedImages.length > 0) {
    console.log(`${colors.green}  🖼️  Moved ${operations.movedImages.length} images${colors.reset}`);
    
    // Show category breakdown
    const categoryCount = {};
    for (const move of operations.movedImages) {
      categoryCount[move.category] = (categoryCount[move.category] || 0) + 1;
    }
    
    for (const [category, count] of Object.entries(categoryCount)) {
      console.log(`     • ${category}: ${count} files`);
    }
  }
  
  if (operations.updatedReferences.length > 0) {
    console.log(`${colors.green}  🔗 Updated ${operations.updatedReferences.length} references${colors.reset}`);
  }
  
  if (operations.errors.length > 0) {
    console.log(`\n${colors.red}⚠️  Errors encountered:${colors.reset}`);
    for (const error of operations.errors) {
      console.log(`  ${colors.red}• ${error}${colors.reset}`);
    }
  }
  
  if (operations.movedDocs.length === 0 && operations.movedImages.length === 0) {
    console.log(`${colors.green}  ✨ Everything is already perfectly organized!${colors.reset}`);
  }
  
  console.log(`\n${colors.magenta}${'═'.repeat(40)}${colors.reset}`);
  console.log(`${colors.cyan}🌸 Sacred structure maintained${colors.reset}\n`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { fixMarkdownFiles, fixImageFiles, generateManifest };