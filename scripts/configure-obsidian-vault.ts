#!/usr/bin/env node

/**
 * OBSIDIAN VAULT CONFIGURATION
 *
 * Sets up the connection between Maya and your Obsidian knowledge vault
 * containing all your IP, frameworks, and ever-expanding wisdom
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
};

async function configureObsidianVault() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    OBSIDIAN VAULT CONFIGURATION                     ║
║                 Connecting Maya to Your Knowledge Base              ║
╚══════════════════════════════════════════════════════════════════════╝
  `);

  // Load existing .env
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('✓ Found existing .env file\n');
  } else {
    console.log('Creating new .env file...\n');
  }

  // Ask for vault path
  console.log('Enter the full path to your Obsidian vault:');
  console.log('(e.g., /Users/Kelly/ObsidianVaults/SoullabKnowledge)\n');

  const vaultPath = await question('Vault path: ');

  // Verify vault exists
  if (!fs.existsSync(vaultPath)) {
    console.log('\n⚠️  Vault directory does not exist. Create it? (yes/no)');
    const create = await question('> ');

    if (create.toLowerCase() === 'yes') {
      fs.mkdirSync(vaultPath, { recursive: true });
      console.log('✓ Created vault directory');

      // Create recommended structure
      await createVaultStructure(vaultPath);
    } else {
      console.log('Please create the vault directory and run this script again.');
      process.exit(1);
    }
  } else {
    console.log('✓ Vault directory found');

    // Check for existing structure
    const hasStructure = fs.existsSync(path.join(vaultPath, 'Frameworks'));

    if (!hasStructure) {
      console.log('\n📁 Would you like to create the recommended vault structure? (yes/no)');
      const create = await question('> ');

      if (create.toLowerCase() === 'yes') {
        await createVaultStructure(vaultPath);
      }
    }
  }

  // Update .env file
  const envLines = envContent.split('\n');
  let vaultPathSet = false;

  const updatedLines = envLines.map(line => {
    if (line.startsWith('OBSIDIAN_VAULT_PATH=')) {
      vaultPathSet = true;
      return `OBSIDIAN_VAULT_PATH=${vaultPath}`;
    }
    return line;
  });

  if (!vaultPathSet) {
    updatedLines.push(`\n# Obsidian Vault Configuration`);
    updatedLines.push(`OBSIDIAN_VAULT_PATH=${vaultPath}`);
    updatedLines.push(`MEMORY_PATH=./memory`);
    updatedLines.push(`VECTOR_DB_PATH=./vectors`);
  }

  fs.writeFileSync(envPath, updatedLines.join('\n'));
  console.log('\n✓ Updated .env file with vault path\n');

  // Display configuration summary
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                     CONFIGURATION COMPLETE                          ║
╚══════════════════════════════════════════════════════════════════════╝

Your Obsidian vault is now connected to Maya!

📁 Vault Path: ${vaultPath}

📚 Vault Structure:
   ├── 📚 Books/          - Your published and future books
   ├── 🧠 Frameworks/     - All your frameworks and integrations
   ├── 💡 Concepts/       - Individual concepts by element
   ├── 🧘 Practices/      - Exercises and protocols
   ├── 🌐 Relationships/  - Concept maps and syntheses
   └── 📝 Templates/      - Note templates

🏷️ Tagging System:
   • #framework #concept #practice #integration
   • #fire #water #earth #air #aether
   • #left-hemisphere #right-hemisphere #brain-integration
   • #experience #expression #expansion (etc.)

🚀 Next Steps:
   1. Add your existing notes to the vault
   2. Use templates for new content
   3. Run 'npm run maya' to activate with your knowledge base

Maya will now have access to:
   ✓ All your frameworks (Elemental, McGilchrist, 12 Facets, etc.)
   ✓ Your books and written content
   ✓ Concept relationships and integrations
   ✓ Practices and protocols
   ✓ Ever-expanding knowledge as you add notes

Every note you add makes Maya more intelligent and aligned with your IP!
  `);

  rl.close();
}

async function createVaultStructure(vaultPath: string) {
  console.log('\n📁 Creating recommended vault structure...\n');

  const structure = [
    '📚 Books',
    '📚 Books/Elemental Alchemy',
    '📚 Books/Elemental Alchemy/Chapters',
    '📚 Books/Elemental Alchemy/Practices',
    '📚 Books/Elemental Alchemy/Key Concepts',
    '📚 Books/Future Books',
    '🧠 Frameworks',
    '🧠 Frameworks/Framework Integrations',
    '💡 Concepts',
    '💡 Concepts/Fire',
    '💡 Concepts/Water',
    '💡 Concepts/Earth',
    '💡 Concepts/Air',
    '💡 Concepts/Aether',
    '💡 Concepts/Consciousness',
    '💡 Concepts/Healing Arts',
    '💡 Concepts/Spiritual Psychology',
    '🧘 Practices',
    '🧘 Practices/Elemental Practices',
    '🧘 Practices/Consciousness Exercises',
    '🧘 Practices/Healing Protocols',
    '🧘 Practices/Integration Techniques',
    '🌐 Relationships',
    '🌐 Relationships/Concept Maps',
    '🌐 Relationships/Framework Syntheses',
    '🌐 Relationships/Cross-References',
    '📝 Templates'
  ];

  for (const dir of structure) {
    const fullPath = path.join(vaultPath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}`);
    }
  }

  // Create template files
  await createTemplateFiles(vaultPath);

  // Create example framework files
  await createExampleFrameworks(vaultPath);

  console.log('\n✓ Vault structure created successfully!');
}

async function createTemplateFiles(vaultPath: string) {
  console.log('\n📝 Creating template files...\n');

  const templates = {
    'Framework Template.md': `---
type: framework
framework: Framework Name
integrates_with: [Other Framework 1, Other Framework 2]
elements: [fire, water, earth, air, aether]
hemisphere: [left, right, integrated]
facets: [relevant facets from 12]
---

# Framework Name

## Overview
[Description of the framework]

## Core Concepts
- [[Concept 1]]
- [[Concept 2]]

## Elemental Mapping
- **Fire**: [How fire manifests]
- **Water**: [How water manifests]
- **Earth**: [How earth manifests]
- **Air**: [How air manifests]
- **Aether**: [How aether manifests]

## Brain Hemisphere Correlation
- **Left Hemisphere**: [Aspects]
- **Right Hemisphere**: [Aspects]
- **Integration**: [How they unite]

## Practices
- [[Practice 1]]
- [[Practice 2]]

## Relationships
- Complements: [[Framework X]]
- Extends: [[Framework Y]]
- Synthesizes with: [[Framework Z]]

## Insights
- [Key insight 1]
- [Key insight 2]

#framework #integration`,

    'Concept Template.md': `---
type: concept
id: concept_name
frameworks: [Framework 1, Framework 2]
elements: [primary_element]
hemisphere: [left/right/integrated]
facets: [related facets]
---

# Concept Name

## Definition
[Clear definition]

## Elemental Nature
Primary: [Element]
Secondary: [Element]

## Brain Hemisphere
[Which hemisphere and why]

## In Practice
[How this concept is applied]

## Connections
- Relates to: [[Related Concept 1]]
- Builds on: [[Foundation Concept]]
- Leads to: [[Advanced Concept]]

## Examples
[Real-world examples]

#concept #element_name`,

    'Practice Template.md': `---
type: practice
id: practice_name
elements: [primary_element, secondary_element]
duration: [time in minutes]
difficulty: [beginner/intermediate/advanced]
---

# Practice Name

## Purpose
[What this practice achieves]

## Elements Engaged
- Primary: [Element]
- Secondary: [Element]

## Instructions
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Variations
- Beginner: [Modification]
- Advanced: [Extension]

## Integration
- Combine with: [[Other Practice]]
- Follows: [[Preparatory Practice]]

## Notes
[Additional guidance]

#practice #element_name`,

    'Integration Template.md': `---
type: integration
frameworks: [Framework A, Framework B]
synthesis_type: [complementary/unified/transcendent]
---

# Integration: Framework A + Framework B

## Synthesis Overview
[How these frameworks relate and enhance each other]

## Mapping Points
### Framework A → Framework B
- [Concept A1] maps to [Concept B1]
- [Concept A2] correlates with [Concept B2]

### Emergent Insights
- [What emerges from this integration]
- [New understanding gained]

## Practical Applications
- [How to use both frameworks together]
- [Enhanced practices from integration]

## Examples in Action
[Real scenarios using both frameworks]

#integration #synthesis`
  };

  const templatesDir = path.join(vaultPath, '📝 Templates');

  for (const [filename, content] of Object.entries(templates)) {
    const filePath = path.join(templatesDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Created ${filename}`);
  }
}

async function createExampleFrameworks(vaultPath: string) {
  console.log('\n🧠 Creating example framework files...\n');

  // Elemental Framework
  const elementalFramework = `---
type: framework
framework: Elemental Framework
integrates_with: [McGilchrist Brain Model, 12 Facets System, Four Brain Model]
elements: [fire, water, earth, air, aether]
hemisphere: [integrated]
facets: [all]
---

# Elemental Framework

## Overview
The Elemental Framework provides five archetypal lenses through which to understand consciousness, transformation, and human experience.

## Core Concepts
- [[Fire - Transformation]]
- [[Water - Flow]]
- [[Earth - Grounding]]
- [[Air - Clarity]]
- [[Aether - Unity]]

## Elemental Mapping
- **Fire**: Transformation, passion, vision, creative destruction
- **Water**: Emotion, intuition, flow, healing
- **Earth**: Grounding, manifestation, stability, nourishment
- **Air**: Clarity, communication, thought, perspective
- **Aether**: Unity, transcendence, spirit, connection

## Brain Hemisphere Correlation
- **Left Hemisphere**: Earth (structure), Air (logic)
- **Right Hemisphere**: Fire (vision), Water (emotion)
- **Integration**: Aether (transcendent unity)

## Practices
- [[Elemental Meditation]]
- [[Element Balancing]]
- [[Elemental Journey Work]]

## Relationships
- Complements: [[McGilchrist Brain Model]]
- Extends: [[Classical Elements]]
- Synthesizes with: [[12 Facets System]]

## Insights
- Each element offers a unique perspective on any situation
- Elements exist in dynamic balance, not isolation
- Aether represents the transcendent unity of all elements

#framework #elements #foundational`;

  const frameworksDir = path.join(vaultPath, '🧠 Frameworks');
  fs.writeFileSync(
    path.join(frameworksDir, 'Elemental Framework.md'),
    elementalFramework
  );
  console.log('  ✓ Created Elemental Framework.md');

  // McGilchrist Integration
  const mcgilchristIntegration = `---
type: integration
frameworks: [Elemental Framework, McGilchrist Brain Model]
synthesis_type: unified
---

# Integration: Elements + McGilchrist

## Synthesis Overview
The Elemental Framework maps beautifully onto McGilchrist's understanding of brain hemispheres, with each element finding its neurological correlation.

## Mapping Points
### Elements → Brain Hemispheres
- Fire → Right Prefrontal (vision, possibility)
- Water → Right Hemisphere (emotion, embodiment)
- Earth → Left Hemisphere (structure, categorization)
- Air → Left Prefrontal (language, articulation)
- Aether → Corpus Callosum (integration, unity)

### Emergent Insights
- Elements provide experiential language for hemispheric functions
- Brain science validates ancient elemental wisdom
- Integration happens through Aether/corpus callosum

## Practical Applications
- Use Fire practices to engage right prefrontal visioning
- Use Water practices for right hemisphere emotional integration
- Use Earth practices to ground through left hemisphere structure
- Use Air practices for left prefrontal communication
- Use Aether practices for whole-brain integration

#integration #mcgilchrist #elements`;

  fs.writeFileSync(
    path.join(frameworksDir, 'Framework Integrations', 'Elements + McGilchrist.md'),
    mcgilchristIntegration
  );
  console.log('  ✓ Created Elements + McGilchrist.md');
}

// Run the configuration
configureObsidianVault().catch(console.error);