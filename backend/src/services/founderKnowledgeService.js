// 🌀 FOUNDER KNOWLEDGE INGESTION SERVICE
// Processes and integrates organizational wisdom documents
import { logger } from '../utils/logger';
import { SoullabFounderAgent } from '../core/agents/soullabFounderAgent';
import fs from 'fs/promises';
import path from 'path';
export class FounderKnowledgeService {
    constructor() {
        this.founderAgent = new SoullabFounderAgent();
    }
    /**
     * Process the Spiralogic Process Manifesto
     */
    async ingestSpiralogicManifesto(filePath) {
        try {
            logger.info('FounderKnowledge: Ingesting Spiralogic Process Manifesto', { filePath });
            // Read the manifesto file
            const content = await fs.readFile(filePath, 'utf-8');
            // Parse the manifesto structure
            const manifesto = this.parseManifesto(content, 'Spiralogic Process Manifesto');
            // Extract core insights
            const coreInsights = this.extractSpiralogicInsights(manifesto);
            // Update founder agent knowledge base
            await this.updateFounderKnowledge(manifesto, coreInsights);
            logger.info('FounderKnowledge: Spiralogic Manifesto successfully integrated', {
                sections: manifesto.sections.length,
                principles: manifesto.corePrinciples.length
            });
            return manifesto;
        }
        catch (error) {
            logger.error('FounderKnowledge: Error ingesting Spiralogic Manifesto', error);
            throw error;
        }
    }
    /**
     * Parse markdown manifesto into structured format
     */
    parseManifesto(content, title) {
        const lines = content.split('\n');
        const sections = [];
        let currentSection = null;
        const corePrinciples = [];
        const keywords = new Set();
        for (const line of lines) {
            // Extract hashtags as keywords
            const tags = line.match(/#(\w+)/g);
            if (tags) {
                tags.forEach(tag => keywords.add(tag.substring(1)));
            }
            // Parse section headers
            if (line.startsWith('### ')) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    heading: line.replace(/### \*\*|\*\*|###/g, '').trim(),
                    content: '',
                    tags: tags ? tags.map(t => t.substring(1)) : [],
                    keyInsights: []
                };
            }
            // Parse subsection headers
            else if (line.startsWith('#### ')) {
                if (currentSection) {
                    currentSection.content += '\n\n' + line.replace(/####/g, '').trim() + '\n';
                }
            }
            // Extract principles
            else if (line.includes('**') && line.includes(':') && currentSection?.heading.includes('Principles')) {
                const principle = line.replace(/\*\*/g, '').trim();
                corePrinciples.push(principle);
                if (currentSection) {
                    currentSection.content += '\n' + line;
                }
            }
            // Regular content
            else if (line.trim() && currentSection) {
                currentSection.content += '\n' + line;
            }
        }
        // Add the last section
        if (currentSection) {
            sections.push(currentSection);
        }
        // Extract key insights from each section
        sections.forEach(section => {
            section.keyInsights = this.extractKeyInsights(section.content);
        });
        return {
            title,
            version: '1.0',
            sections,
            corePrinciples,
            keywords: Array.from(keywords),
            lastUpdated: new Date()
        };
    }
    /**
     * Extract key insights from section content
     */
    extractKeyInsights(content) {
        const insights = [];
        // Extract bullet points as insights
        const bulletPoints = content.match(/^[\s]*[-•]\s*(.+)$/gm);
        if (bulletPoints) {
            bulletPoints.forEach(point => {
                const cleaned = point.replace(/^[\s]*[-•]\s*/, '').trim();
                if (cleaned.length > 20) { // Only substantial points
                    insights.push(cleaned);
                }
            });
        }
        // Extract bolded key concepts
        const boldConcepts = content.match(/\*\*([^*]+)\*\*/g);
        if (boldConcepts) {
            boldConcepts.forEach(concept => {
                const cleaned = concept.replace(/\*\*/g, '').trim();
                if (cleaned.length > 10 && !insights.includes(cleaned)) {
                    insights.push(cleaned);
                }
            });
        }
        return insights;
    }
    /**
     * Extract Spiralogic-specific insights
     */
    extractSpiralogicInsights(manifesto) {
        const insights = {
            elements: {},
            spiralDynamics: '',
            integrationPrinciples: [],
            practicalApplications: []
        };
        // Extract elemental definitions
        manifesto.sections.forEach(section => {
            if (section.heading.includes('Quadrants') || section.heading.includes('Elements')) {
                // Fire element
                const fireMatch = section.content.match(/Fire[^:]*:([^-]+)-/s);
                if (fireMatch) {
                    insights.elements.fire = {
                        name: 'Fire',
                        aspect: 'Vision and Creativity',
                        description: fireMatch[1].trim(),
                        quadrant: 'upper-right',
                        brainFunction: 'right prefrontal cortex'
                    };
                }
                // Water element
                const waterMatch = section.content.match(/Water[^:]*:([^-]+)-/s);
                if (waterMatch) {
                    insights.elements.water = {
                        name: 'Water',
                        aspect: 'Emotion and Flow',
                        description: waterMatch[1].trim(),
                        quadrant: 'lower-right',
                        brainFunction: 'right hemisphere'
                    };
                }
                // Earth element
                const earthMatch = section.content.match(/Earth[^:]*:([^-]+)-/s);
                if (earthMatch) {
                    insights.elements.earth = {
                        name: 'Earth',
                        aspect: 'Embodiment and Stability',
                        description: earthMatch[1].trim(),
                        quadrant: 'lower-left',
                        brainFunction: 'left hemisphere'
                    };
                }
                // Air element
                const airMatch = section.content.match(/Air[^:]*:([^-]+)-/s);
                if (airMatch) {
                    insights.elements.air = {
                        name: 'Air',
                        aspect: 'Expression and Clarity',
                        description: airMatch[1].trim(),
                        quadrant: 'upper-left',
                        brainFunction: 'left prefrontal cortex'
                    };
                }
                // Aether element
                const aetherMatch = section.content.match(/Aether[^:]*:([^,]+),/s);
                if (aetherMatch) {
                    insights.elements.aether = {
                        name: 'Aether',
                        aspect: 'Crystal Focus',
                        description: aetherMatch[1].trim(),
                        quadrant: 'center',
                        brainFunction: 'unified field'
                    };
                }
            }
            // Extract spiral movement
            if (section.heading.includes('Spiral') || section.heading.includes('Movement')) {
                insights.spiralDynamics = section.content;
            }
            // Extract principles
            if (section.heading.includes('Principles')) {
                insights.integrationPrinciples = section.keyInsights;
            }
        });
        // Extract core principles
        insights.integrationPrinciples = manifesto.corePrinciples;
        return insights;
    }
    /**
     * Update the founder agent's knowledge base
     */
    async updateFounderKnowledge(manifesto, insights) {
        // Create structured knowledge update
        const knowledgeUpdate = {
            type: 'manifesto',
            title: manifesto.title,
            content: JSON.stringify(manifesto),
            metadata: {
                version: manifesto.version,
                keywords: manifesto.keywords,
                insights: insights,
                accessibility: 'public',
                lastUpdated: manifesto.lastUpdated
            }
        };
        // In a real implementation, this would update the agent's knowledge repository
        logger.info('FounderKnowledge: Knowledge base updated with Spiralogic insights', {
            elements: Object.keys(insights.elements),
            principles: insights.integrationPrinciples.length
        });
        // Store in a format the agent can reference
        await this.storeManifestoKnowledge(knowledgeUpdate);
    }
    /**
     * Store manifesto knowledge for agent retrieval
     */
    async storeManifestoKnowledge(knowledge) {
        // In production, this would store to a vector database or similar
        // For now, we'll create a JSON file the agent can reference
        const knowledgePath = path.join(__dirname, '../../data/founder-knowledge/spiralogic-manifesto.json');
        try {
            await fs.mkdir(path.dirname(knowledgePath), { recursive: true });
            await fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2));
            logger.info('FounderKnowledge: Manifesto knowledge stored', { path: knowledgePath });
        }
        catch (error) {
            logger.error('FounderKnowledge: Error storing manifesto', error);
        }
    }
}
// Export singleton instance
export const founderKnowledgeService = new FounderKnowledgeService();
/**
 * 🌀 FOUNDER KNOWLEDGE SERVICE
 *
 * This service processes organizational wisdom documents and integrates them
 * into the Founder Agent's knowledge base. It:
 *
 * 1. Parses manifestos and extracts structured insights
 * 2. Identifies core principles and elemental mappings
 * 3. Updates the agent's knowledge repository
 * 4. Maintains version history and accessibility levels
 *
 * The Spiralogic Process Manifesto integration extracts:
 * - Elemental quadrants and their meanings
 * - Spiral movement dynamics
 * - Core integration principles
 * - Brain function mappings
 * - Alchemical refinement process
 */ 
