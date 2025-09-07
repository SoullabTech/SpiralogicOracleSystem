#!/usr/bin/env python3
"""
Script to stub all backend imports in API routes for Vercel deployment
"""

import os
import re
from pathlib import Path

def stub_backend_imports(file_path):
    """Stub backend imports in a TypeScript file"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        print(f"Skipping {file_path} - encoding issue")
        return False
    
    original_content = content
    
    # Track what needs to be stubbed
    needs_logger = False
    needs_memory_store = False
    needs_llama_service = False
    needs_voice_router = False
    needs_daimonic = False
    needs_di_container = False
    needs_collective = False
    needs_archetype = False
    
    # Check what's imported
    if re.search(r'import.*logger.*from.*backend', content):
        needs_logger = True
    if re.search(r'import.*memoryStore.*from.*backend', content):
        needs_memory_store = True
    if re.search(r'import.*llamaService.*from.*backend', content):
        needs_llama_service = True
    if re.search(r'import.*voiceRouter.*from.*backend', content):
        needs_voice_router = True
    if re.search(r'import.*daimonic.*from.*backend', content):
        needs_daimonic = True
    if re.search(r'import.*get.*from.*backend.*di/container', content):
        needs_di_container = True
    if re.search(r'import.*CollectiveIntelligence.*from.*backend', content):
        needs_collective = True
    if re.search(r'import.*archetypeService.*from.*backend', content):
        needs_archetype = True
    
    # Comment out backend imports
    content = re.sub(
        r'^(import\s+.*?\s+from\s+[\'"](?:@/backend|@\\/backend|\.\./.*backend).*?[\'"];?)$',
        r'// Temporarily stub out backend imports that are excluded from build\n// \1',
        content,
        flags=re.MULTILINE
    )
    
    # Add stubs after the last import
    last_import = None
    for match in re.finditer(r'^import\s+.*?;?\s*$', content, re.MULTILINE):
        last_import = match
    
    if last_import:
        insert_pos = last_import.end()
        stubs = []
        
        if needs_logger and 'const logger = {' not in content:
            stubs.append("""
// Stub logger
const logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, error?: any) => console.error(message, error),
  warn: (message: string, data?: any) => console.warn(message, data),
  debug: (message: string, data?: any) => console.debug(message, data)
};""")
        
        if needs_memory_store and 'const memoryStore = {' not in content:
            stubs.append("""
// Stub memory store
const memoryStore = {
  isInitialized: false,
  init: async (dbPath: string) => {},
  getMemories: async (userId: string, limit: number) => [],
  getJournalEntries: async (userId: string, limit: number) => [],
  getUploads: async (userId: string, limit: number) => [],
  getVoiceNotes: async (userId: string, limit: number) => [],
  getVoiceNote: async (id: string) => null,
  saveVoiceNote: async (data: any) => ({ id: Date.now().toString(), ...data }),
  createMemory: async (data: any) => ({ id: Date.now().toString(), ...data })
};""")
        
        if needs_llama_service and 'const llamaService = {' not in content:
            stubs.append("""
// Stub llama service
const llamaService = {
  isInitialized: false,
  init: async () => {},
  process: async (text: string) => ({ processed: text }),
  processVoice: async (audio: any) => ({ transcript: 'Voice processing not available in beta' })
};""")
        
        if needs_voice_router and 'const voiceRouter = {' not in content:
            stubs.append("""
// Stub voice router
const voiceRouter = {
  handleVoiceInput: async (data: any) => ({ 
    success: false, 
    message: 'Voice routing not available in beta' 
  })
};""")
        
        if needs_daimonic and 'const daimonicOracle = {' not in content:
            stubs.append("""
// Stub daimonic services
const daimonicOracle = {
  process: async (input: any) => ({ response: 'Daimonic oracle not available in beta' })
};
const daimonicChoreographer = {
  orchestrate: async (agents: any) => ({ result: 'Choreography not available in beta' })
};
const unifiedDaimonicCore = {
  invoke: async (params: any) => ({ response: 'Daimonic core not available in beta' })
};""")
        
        if needs_di_container and 'function get(' not in content:
            stubs.append("""
// Stub DI container
function get<T>(token: any): T {
  return {} as T;
}
function wireDI() {
  // No-op
}
const TOKENS = {
  SSE_HUB: Symbol('SSE_HUB'),
  VOICE_QUEUE: Symbol('VOICE_QUEUE'),
  VOICE_EVENT_BUS: Symbol('VOICE_EVENT_BUS')
};""")
        
        if needs_collective and 'class CollectiveIntelligence' not in content:
            stubs.append("""
// Stub collective intelligence
class CollectiveIntelligence {
  async getFieldState() {
    return { coherence: 0.5, participants: 0 };
  }
  async getPatterns() {
    return { patterns: [] };
  }
}
const collective = new CollectiveIntelligence();""")
        
        if needs_archetype and 'const archetypeService = {' not in content:
            stubs.append("""
// Stub archetype service
const archetypeService = {
  detectArchetypes: (text: string) => [],
  analyzeArchetypalJourney: (data: any[]) => ({
    currentPhase: 'exploration',
    dominantArchetypes: [],
    emergingPatterns: [],
    shadowWork: [],
    recommendations: []
  })
};""")
        
        if stubs:
            content = content[:insert_pos] + '\n' + '\n'.join(stubs) + content[insert_pos:]
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    api_dir = Path('app/api')
    fixed_count = 0
    
    for ts_file in api_dir.rglob('*.ts'):
        if stub_backend_imports(ts_file):
            print(f"Fixed: {ts_file}")
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} files with backend imports")

if __name__ == '__main__':
    main()