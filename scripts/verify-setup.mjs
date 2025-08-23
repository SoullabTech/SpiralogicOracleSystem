#!/usr/bin/env node

/**
 * Pre-PR verification script
 * Checks that all design system tooling works correctly
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('🔍 Running pre-PR verification checks...\n')

const checks = []

// Check 1: Verify token export works
async function checkTokenExport() {
  try {
    console.log('📊 Testing token export...')
    
    // Run the export script
    await execAsync('npm run tokens:export', { cwd: rootDir })
    
    // Check if file was created
    const tokenPath = path.join(rootDir, 'design-tokens.json')
    if (!fs.existsSync(tokenPath)) {
      throw new Error('design-tokens.json not generated')
    }
    
    // Verify JSON structure
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'))
    if (!tokens.color || !tokens.$metadata) {
      throw new Error('Invalid token structure')
    }
    
    console.log('✅ Token export: PASS')
    console.log(`   Generated design-tokens.json with ${Object.keys(tokens).length - 1} categories`)
    
    // Clean up
    fs.unlinkSync(tokenPath)
    
  } catch (error) {
    console.log('❌ Token export: FAIL')
    console.log(`   Error: ${error.message}`)
    return false
  }
  return true
}

// Check 2: Verify mindmap builds
async function checkMindmapBuild() {
  try {
    console.log('🧠 Testing mindmap generation...')
    
    await execAsync('npm run mindmap:build', { cwd: rootDir })
    
    const mindmapPath = path.join(rootDir, 'docs/mindmap/spiralogic.html')
    if (!fs.existsSync(mindmapPath)) {
      throw new Error('spiralogic.html not generated')
    }
    
    const htmlContent = fs.readFileSync(mindmapPath, 'utf-8')
    if (!htmlContent.includes('markmap') || htmlContent.length < 1000) {
      throw new Error('Generated HTML appears invalid')
    }
    
    console.log('✅ Mindmap build: PASS')
    console.log(`   Generated HTML (${(htmlContent.length / 1024).toFixed(1)}KB)`)
    
    // Clean up
    fs.unlinkSync(mindmapPath)
    
  } catch (error) {
    console.log('❌ Mindmap build: FAIL')
    console.log(`   Error: ${error.message}`)
    return false
  }
  return true
}

// Check 3: Verify required files exist
function checkRequiredFiles() {
  console.log('📁 Checking required files...')
  
  const requiredFiles = [
    'app/dev/theme/page.tsx',
    'app/dev/architecture/page.tsx', 
    'docs/architecture/README.md',
    'docs/THEME.md',
    'scripts/export-tokens.ts',
    '.github/workflows/chromatic.yml',
    '.github/pull_request_template.md'
  ]
  
  const missing = []
  
  for (const file of requiredFiles) {
    const filePath = path.join(rootDir, file)
    if (!fs.existsSync(filePath)) {
      missing.push(file)
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ Required files: FAIL')
    console.log(`   Missing: ${missing.join(', ')}`)
    return false
  }
  
  console.log('✅ Required files: PASS')
  console.log(`   All ${requiredFiles.length} files present`)
  return true
}

// Check 4: Verify package.json scripts
function checkPackageScripts() {
  console.log('📦 Checking package.json scripts...')
  
  const packagePath = path.join(rootDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  
  const requiredScripts = [
    'chromatic',
    'tokens:export', 
    'mindmap:build',
    'mindmap:open'
  ]
  
  const missing = requiredScripts.filter(script => !pkg.scripts[script])
  
  if (missing.length > 0) {
    console.log('❌ Package scripts: FAIL')
    console.log(`   Missing scripts: ${missing.join(', ')}`)
    return false
  }
  
  console.log('✅ Package scripts: PASS')
  console.log(`   All ${requiredScripts.length} scripts defined`)
  return true
}

// Check 5: Verify dependencies
function checkDependencies() {
  console.log('📋 Checking dependencies...')
  
  const packagePath = path.join(rootDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  
  const requiredDeps = {
    'chromatic': pkg.devDependencies?.chromatic,
    'markmap-cli': pkg.devDependencies?.['markmap-cli'],
    'ts-node': pkg.devDependencies?.['ts-node']
  }
  
  const missing = Object.entries(requiredDeps)
    .filter(([name, version]) => !version)
    .map(([name]) => name)
  
  if (missing.length > 0) {
    console.log('❌ Dependencies: FAIL')
    console.log(`   Missing: ${missing.join(', ')}`)
    return false
  }
  
  console.log('✅ Dependencies: PASS')
  console.log(`   All required dev dependencies installed`)
  return true
}

// Run all checks
async function runAllChecks() {
  const results = [
    checkRequiredFiles(),
    checkPackageScripts(), 
    checkDependencies(),
    await checkTokenExport(),
    await checkMindmapBuild()
  ]
  
  const passed = results.filter(Boolean).length
  const total = results.length
  
  console.log(`\n📊 Results: ${passed}/${total} checks passed`)
  
  if (passed === total) {
    console.log('🎉 All checks passed! Ready for PR.')
    console.log('\nNext steps:')
    console.log('1. Take screenshots of /dev/theme (dark + light)')
    console.log('2. Take screenshot of /dev/architecture')
    console.log('3. Take screenshot of GitHub Mermaid diagrams')
    console.log('4. Commit and create PR with screenshots')
  } else {
    console.log('⚠️  Some checks failed. Please fix before creating PR.')
    process.exit(1)
  }
}

runAllChecks().catch(error => {
  console.error('💥 Verification failed:', error)
  process.exit(1)
})