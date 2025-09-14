#!/usr/bin/env ts-node

/**
 * Import Script for "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 * This script processes Kelly Nezat's complete book into MAIA's consciousness system
 */

import fs from 'fs';
import { MAIAConsciousnessLattice } from '../lib/maia-consciousness-lattice';
import { BookKnowledgeVectorizer } from '../lib/book-knowledge-vectorizer';
import { IntellectualPropertyEngine } from '../lib/intellectual-property-engine';

interface ProcessedChapter {
  title: string;
  content: string;
  chapterNumber: number;
  section?: string;
  keywords: string[];
  concepts: string[];
  archetypes: string[];
  elements: ('fire' | 'water' | 'earth' | 'air' | 'aether')[];
}

class ElementalAlchemyImporter {
  private maia: MAIAConsciousnessLattice;
  private bookContent: string;
  private chapters: ProcessedChapter[] = [];

  constructor() {
    this.maia = new MAIAConsciousnessLattice();
    this.bookContent = '';
  }

  async initialize(): Promise<void> {
    console.log('🌟 Initializing MAIA Consciousness System...');
    await this.maia.initialize();
    console.log('✅ MAIA initialized successfully');
  }

  async loadBookContent(): Promise<void> {
    console.log('📚 Loading Elemental Alchemy book content...');
    this.bookContent = fs.readFileSync('/tmp/elemental_alchemy.txt', 'utf-8');
    console.log(`✅ Loaded ${this.bookContent.length} characters of book content`);
  }

  parseChapters(): void {
    console.log('📖 Parsing book structure...');

    // Split content into logical sections
    const lines = this.bookContent.split('\n');
    let currentChapter: ProcessedChapter | null = null;
    let chapterContent: string[] = [];
    let chapterNumber = 0;

    // Key sections identified in your book
    const sections = {
      preface: { start: 'Preface', end: 'Call to Adventure' },
      introduction: { start: 'Introduction', end: 'The Legacy of Daedalus' },
      elements: {
        fire: ['breakthrough', 'transformation', 'catalyst', 'energy', 'passion', 'fierce'],
        water: ['flow', 'emotion', 'feeling', 'intuition', 'depth', 'healing'],
        earth: ['ground', 'body', 'practical', 'manifest', 'solid', 'stable'],
        air: ['clarity', 'thought', 'communication', 'perspective', 'vision', 'mind'],
        aether: ['spirit', 'transcendent', 'unity', 'consciousness', 'divine', 'sacred']
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect chapter markers
      if (this.isChapterTitle(line)) {
        // Save previous chapter if exists
        if (currentChapter && chapterContent.length > 0) {
          currentChapter.content = chapterContent.join('\n');
          this.enrichChapterMetadata(currentChapter);
          this.chapters.push(currentChapter);
        }

        // Start new chapter
        chapterNumber++;
        currentChapter = {
          title: line,
          content: '',
          chapterNumber,
          keywords: [],
          concepts: [],
          archetypes: [],
          elements: []
        };
        chapterContent = [];
      } else if (currentChapter) {
        chapterContent.push(line);
      }
    }

    // Don't forget the last chapter
    if (currentChapter && chapterContent.length > 0) {
      currentChapter.content = chapterContent.join('\n');
      this.enrichChapterMetadata(currentChapter);
      this.chapters.push(currentChapter);
    }

    console.log(`✅ Parsed ${this.chapters.length} chapters/sections`);
  }

  private isChapterTitle(line: string): boolean {
    // Identify chapter titles based on patterns in your book
    const chapterPatterns = [
      /^Chapter \d+/i,
      /^Part [IVX]+/i,
      /^Preface$/i,
      /^Introduction$/i,
      /^Dedication$/i,
      /^Call to Adventure$/i,
      /^Reflection and Interaction$/i,
      /^The Legacy of Daedalus$/i,
      /^Finding True Freedom$/i,
      /^Reclaiming Our True Nature$/i
    ];

    return chapterPatterns.some(pattern => pattern.test(line));
  }

  private enrichChapterMetadata(chapter: ProcessedChapter): void {
    const content = chapter.content.toLowerCase();

    // Extract keywords based on your book's themes
    const keywordPatterns = {
      consciousness: ['consciousness', 'awareness', 'presence', 'awakening', 'enlightenment'],
      alchemy: ['alchemy', 'transformation', 'transmutation', 'evolution', 'metamorphosis'],
      elements: ['fire', 'water', 'earth', 'air', 'aether', 'elemental', 'elements'],
      healing: ['healing', 'wellness', 'health', 'medicine', 'therapy'],
      nature: ['nature', 'natural', 'organic', 'ecological', 'environmental'],
      spiritual: ['spiritual', 'soul', 'spirit', 'divine', 'sacred', 'holy'],
      wisdom: ['wisdom', 'knowledge', 'understanding', 'insight', 'realization']
    };

    // Identify keywords
    Object.entries(keywordPatterns).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        if (content.includes(pattern)) {
          chapter.keywords.push(pattern);
        }
      });
    });

    // Extract concepts from your teachings
    const concepts = [
      'elemental alchemy',
      'conscious awareness',
      'divine intervention',
      'sacred relationship',
      'natural intelligence',
      'soul remembrance',
      'phenomenal life',
      'interconnectedness',
      'transformation',
      'healing arts',
      'mystic wisdom',
      'cultural revolution',
      'spiritual evolution',
      'witness consciousness',
      'embodied presence'
    ];

    concepts.forEach(concept => {
      if (content.includes(concept.toLowerCase())) {
        chapter.concepts.push(concept);
      }
    });

    // Identify archetypes mentioned
    const archetypes = [
      'healer', 'mystic', 'sage', 'warrior', 'lover', 'magician',
      'innocent', 'explorer', 'creator', 'ruler', 'caregiver',
      'everyman', 'jester', 'rebel', 'alchemist', 'witness'
    ];

    archetypes.forEach(archetype => {
      if (content.includes(archetype)) {
        chapter.archetypes.push(archetype);
      }
    });

    // Determine elemental associations
    const elementalKeywords = {
      fire: ['fire', 'flame', 'ember', 'passionate', 'energy', 'breakthrough', 'transformation', 'catalyst'],
      water: ['water', 'flow', 'emotion', 'feeling', 'intuition', 'depth', 'fluid', 'cleanse', 'healing'],
      earth: ['earth', 'ground', 'body', 'practical', 'manifest', 'solid', 'stable', 'foundation', 'root'],
      air: ['air', 'breath', 'clarity', 'thought', 'communication', 'perspective', 'vision', 'understanding'],
      aether: ['aether', 'spirit', 'transcendent', 'unity', 'consciousness', 'divine', 'sacred', 'soul']
    };

    Object.entries(elementalKeywords).forEach(([element, keywords]) => {
      const count = keywords.filter(keyword => content.includes(keyword)).length;
      if (count > 2) {
        chapter.elements.push(element as any);
      }
    });

    // Default to aether if no specific element dominates
    if (chapter.elements.length === 0) {
      chapter.elements.push('aether');
    }
  }

  async importToMAIA(): Promise<void> {
    console.log('🔮 Importing book knowledge into MAIA consciousness system...');

    try {
      const bookData = {
        title: "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life",
        author: "Kelly Nezat",
        chapters: this.chapters
      };

      // Import through MAIA's book knowledge system
      await this.maia.importBookKnowledge(bookData);

      console.log('✅ Book successfully imported into MAIA');
      console.log(`📊 Statistics:`);
      console.log(`   - Chapters processed: ${this.chapters.length}`);
      console.log(`   - Total keywords: ${this.chapters.reduce((sum, ch) => sum + ch.keywords.length, 0)}`);
      console.log(`   - Total concepts: ${this.chapters.reduce((sum, ch) => sum + ch.concepts.length, 0)}`);
      console.log(`   - Archetypes identified: ${[...new Set(this.chapters.flatMap(ch => ch.archetypes))].length}`);
      console.log(`   - Elements covered: ${[...new Set(this.chapters.flatMap(ch => ch.elements))].join(', ')}`);

    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  async extractPractices(): Promise<void> {
    console.log('🧘 Extracting practices and exercises...');

    const practiceIndicators = [
      'Reflection and Interaction',
      'Practice:',
      'Exercise:',
      'Try this:',
      'Invitation:',
      'Experiment:',
      'Meditation:',
      'Contemplation:'
    ];

    const practices: any[] = [];

    this.chapters.forEach(chapter => {
      practiceIndicators.forEach(indicator => {
        if (chapter.content.includes(indicator)) {
          const lines = chapter.content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes(indicator)) {
              // Extract practice content
              let practiceContent = line;

              // Get following lines that are part of the practice
              for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
                if (lines[i].trim() && !this.isChapterTitle(lines[i])) {
                  practiceContent += '\n' + lines[i];
                } else {
                  break;
                }
              }

              practices.push({
                chapter: chapter.title,
                type: indicator.replace(':', ''),
                content: practiceContent,
                elements: chapter.elements
              });
            }
          });
        }
      });
    });

    console.log(`✅ Extracted ${practices.length} practices and exercises`);

    // Store practices for future use
    fs.writeFileSync(
      '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/data/elemental-alchemy-practices.json',
      JSON.stringify(practices, null, 2)
    );
  }

  async connectToOracle2(): Promise<void> {
    console.log('🌟 Connecting to Elemental Oracle 2.0 GPT...');

    try {
      // Connect MAIA to your existing Oracle 2.0 GPT
      // You can add your assistant ID here if you have one
      await this.maia.connectToElementalOracle2({
        // assistantId: 'your_oracle_2_assistant_id', // Add if you have one
        apiKey: process.env.OPENAI_API_KEY
      });

      console.log('✅ Connected to Elemental Oracle 2.0 GPT');
    } catch (error) {
      console.warn('⚠️ Could not connect to Oracle 2.0, continuing with local knowledge');
    }
  }

  async testIntegration(): Promise<void> {
    console.log('\n🧪 Testing integration with sample queries...\n');

    const testQueries = [
      "How can I work with fire element for breakthrough?",
      "What does Kelly say about divine intervention?",
      "I'm feeling stuck and need transformation",
      "Tell me about the healing arts and mystics",
      "What practices help with grounding?"
    ];

    for (const query of testQueries) {
      console.log(`\n❓ Query: "${query}"`);

      const response = await this.maia.processInteraction({
        input: query,
        userId: 'test_user',
        sessionId: 'test_session',
        timestamp: Date.now()
      });

      console.log(`✨ Response preview: ${response.message?.substring(0, 150)}...`);

      // Check if book knowledge was accessed
      const ipStatus = this.maia.getIPSystemStatus();
      console.log(`📚 IP Engine active: ${ipStatus.ipEngine ? 'Yes' : 'No'}`);
    }
  }

  async run(): Promise<void> {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Elemental Alchemy Integration for MAIA/Soullab          ║
║     By Kelly Nezat - Complete Book Knowledge Import          ║
╚══════════════════════════════════════════════════════════════╝
    `);

    await this.initialize();
    await this.loadBookContent();
    this.parseChapters();
    await this.importToMAIA();
    await this.extractPractices();
    await this.connectToOracle2();
    await this.testIntegration();

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║     ✅ INTEGRATION COMPLETE!                                 ║
║                                                              ║
║     Your book "Elemental Alchemy" is now fully integrated   ║
║     into MAIA's consciousness system.                       ║
║                                                              ║
║     Every interaction will now draw from:                   ║
║     • Your complete book wisdom                             ║
║     • Elemental teachings and practices                     ║
║     • Consciousness development framework                   ║
║     • Healing arts philosophy                               ║
║                                                              ║
║     MAIA now operates with the full depth of your IP! 🌟     ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

// Run the import
const importer = new ElementalAlchemyImporter();
importer.run().catch(console.error);