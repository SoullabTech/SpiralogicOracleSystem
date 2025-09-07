# Scripts

This directory contains utility scripts for the SpiralogicOracleSystem.

## Sample Files Seeder

**File:** `seed-sample-files.ts`

Automatically seeds Maya's Library with sample content to provide a rich first-run experience.

### What it does:

1. **Creates 3 sample files:**
   - `maya-sample-notes.md` - Flow states and optimal performance
   - `maya-sample-mindfulness.md` - Core mindfulness principles  
   - `maya-sample-creativity.md` - Insights on creative expression

2. **Generates embeddings** using OpenAI's text-embedding-3-small model

3. **Creates file chunks** with proper metadata (sections, page numbers, previews)

4. **Inserts citation examples** so users immediately see how citations work

### Usage:

```bash
# Manual seeding
npm run seed

# Force re-seed (overrides existing files)  
npm run seed:force

# Via deployment script
./deploy.sh seed
```

### Safety Features:

- ✅ Checks if samples already exist (won't duplicate)
- ✅ Handles missing database tables gracefully  
- ✅ Uses sample user ID to avoid conflicts
- ✅ Skips if OpenAI API key not available

### First Run Experience:

When users first visit the Library, they'll see:

```
📄 maya-sample-notes.md — ✨ Woven into memory
📄 maya-sample-mindfulness.md — ✨ Woven into memory  
📄 maya-sample-creativity.md — ✨ Woven into memory
```

And when they ask Maya about creativity, she'll respond:

> "In maya-sample-creativity.md (page 1, section 'Creativity'), you noted that authentic expression blossoms when constraints meet imagination..."

With citation badges showing below her response.

### Integration:

The seeder automatically runs during:
- `./deploy.sh setup` 
- `./deploy.sh start`
- Can be run manually with `npm run seed`

This ensures every deployment provides immediate value and demonstrates the file → embeddings → citations workflow without requiring users to upload anything first.