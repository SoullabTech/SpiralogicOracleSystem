#!/usr/bin/env ts-node

import fs from 'fs'
import path from 'path'

/**
 * Export design tokens from CSS custom properties to JSON format
 * Compatible with Figma Tokens plugin
 */

interface TokenValue {
  value: string
  type: string
  description?: string
}

interface TokenCategory {
  [key: string]: TokenValue | TokenCategory
}

interface DesignTokens {
  [category: string]: TokenCategory
}

function parseTokensCSS(cssContent: string): DesignTokens {
  const tokens: DesignTokens = {
    color: {},
    shadow: {},
    borderRadius: {},
    fontFamily: {},
    transitionTimingFunction: {}
  }

  // Extract CSS custom properties from :root and .theme-dark/.theme-light
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s)
  const darkMatch = cssContent.match(/\.theme-dark\s*\{([^}]+)\}/s)
  const lightMatch = cssContent.match(/\.theme-light\s*\{([^}]+)\}/s)

  // Parse light theme (default)
  if (rootMatch || lightMatch) {
    const lightContent = lightMatch?.[1] || rootMatch?.[1] || ''
    parseThemeProperties(lightContent, tokens, 'light')
  }

  // Parse dark theme
  if (darkMatch) {
    parseThemeProperties(darkMatch[1], tokens, 'dark')
  }

  return tokens
}

function parseThemeProperties(cssContent: string, tokens: DesignTokens, theme: 'light' | 'dark') {
  const lines = cssContent.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('--')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const property = trimmed.substring(0, colonIndex).trim()
    const value = trimmed.substring(colonIndex + 1).replace(';', '').trim()

    // Skip CSS variable references for this export
    if (value.startsWith('var(')) continue

    // Parse property name (e.g., --bg-900 -> bg.900)
    const tokenPath = property.substring(2).split('-')
    
    // Determine token category and type
    const category = getTokenCategory(tokenPath[0])
    const type = getTokenType(tokenPath[0])
    
    if (!category || !type) continue

    // Build nested structure
    let current = tokens[category] as TokenCategory
    
    // Handle theme variants
    if (theme === 'dark' && category === 'color') {
      if (!current.dark) current.dark = {}
      current = current.dark as TokenCategory
    }

    // Navigate/create nested structure
    for (let i = 0; i < tokenPath.length - 1; i++) {
      const key = tokenPath[i]
      if (!current[key]) current[key] = {}
      current = current[key] as TokenCategory
    }

    // Set the final value
    const finalKey = tokenPath[tokenPath.length - 1]
    current[finalKey] = {
      value: normalizeValue(value, type),
      type,
      description: getTokenDescription(property, theme)
    }
  }
}

function getTokenCategory(prefix: string): string | null {
  const categories: Record<string, string> = {
    'bg': 'color',
    'ink': 'color', 
    'edge': 'color',
    'gold': 'color',
    'state': 'color',
    'shadow': 'shadow',
    'radius': 'borderRadius',
    'ease': 'transitionTimingFunction'
  }
  return categories[prefix] || null
}

function getTokenType(prefix: string): string | null {
  const types: Record<string, string> = {
    'bg': 'color',
    'ink': 'color',
    'edge': 'color', 
    'gold': 'color',
    'state': 'color',
    'shadow': 'boxShadow',
    'radius': 'borderRadius',
    'ease': 'cubicBezier'
  }
  return types[prefix] || null
}

function normalizeValue(value: string, type: string): string {
  // Remove quotes and normalize
  value = value.replace(/['"]/g, '').trim()
  
  // Convert color formats if needed
  if (type === 'color') {
    // Convert HSL to hex if possible, otherwise keep as-is
    return value
  }
  
  return value
}

function getTokenDescription(property: string, theme: string): string {
  const descriptions: Record<string, string> = {
    '--bg-900': 'Primary background - deepest layer',
    '--bg-800': 'Secondary background - elevated surfaces',
    '--ink-100': 'Primary text - highest contrast',
    '--ink-300': 'Secondary text - reduced emphasis', 
    '--edge-600': 'Subtle borders - light emphasis',
    '--edge-700': 'Standard borders - default emphasis',
    '--gold-400': 'Primary gold - buttons, highlights',
    '--gold-500': 'Gold hover state - interactive emphasis',
    '--state-green': 'Success states - confirmations',
    '--state-amber': 'Warning states - caution needed',
    '--state-red': 'Error states - immediate attention',
    '--shadow-soft': 'Subtle depth for cards and containers',
    '--shadow-lift': 'Elevated elements, buttons, modals',
    '--radius-xl': 'Large border radius for cards and modals',
    '--ease-out-soft': 'Gentle easing for smooth transitions'
  }
  
  const baseDescription = descriptions[property] || ''
  return theme === 'dark' ? `${baseDescription} (dark theme)` : baseDescription
}

async function main() {
  try {
    const tokensPath = path.join(process.cwd(), 'app/styles/tokens.css')
    const outputPath = path.join(process.cwd(), 'design-tokens.json')

    console.log('🎨 Exporting design tokens...')
    console.log(`📂 Reading from: ${tokensPath}`)

    if (!fs.existsSync(tokensPath)) {
      throw new Error(`Tokens file not found: ${tokensPath}`)
    }

    const cssContent = fs.readFileSync(tokensPath, 'utf-8')
    const tokens = parseTokensCSS(cssContent)

    // Add metadata
    const output = {
      $metadata: {
        tokenSetOrder: ['color', 'shadow', 'borderRadius', 'fontFamily', 'transitionTimingFunction'],
        exportedAt: new Date().toISOString(),
        source: 'app/styles/tokens.css',
        version: '1.0.0'
      },
      ...tokens
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

    console.log(`✅ Tokens exported to: ${outputPath}`)
    console.log(`📊 Exported ${Object.keys(tokens).length} token categories`)
    
    // Summary stats
    const colorTokens = countTokens(tokens.color)
    const shadowTokens = countTokens(tokens.shadow)
    console.log(`   • ${colorTokens} color tokens`)
    console.log(`   • ${shadowTokens} shadow tokens`)
    console.log('')
    console.log('🎯 Usage:')
    console.log('   • Import design-tokens.json into Figma Tokens plugin')
    console.log('   • Use with design system documentation')
    console.log('   • Reference for external design tools')

  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  }
}

function countTokens(obj: any): number {
  let count = 0
  for (const key in obj) {
    if (obj[key].value) {
      count++
    } else if (typeof obj[key] === 'object') {
      count += countTokens(obj[key])
    }
  }
  return count
}

if (require.main === module) {
  main()
}

export { parseTokensCSS, DesignTokens }