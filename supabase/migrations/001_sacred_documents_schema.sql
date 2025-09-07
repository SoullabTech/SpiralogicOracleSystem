-- Sacred Documents Schema Migration
-- Creates tables for storing uploaded documents and their analysis

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- SACRED DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sacred_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id UUID,
    
    -- File information
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('text', 'audio', 'video', 'image')),
    file_path TEXT NOT NULL,
    public_url TEXT,
    file_size BIGINT,
    mime_type TEXT,
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'analyzed', 'error')),
    
    -- Analysis results
    element TEXT CHECK (element IN ('Fire', 'Water', 'Earth', 'Air', 'Aether')),
    aether_resonance FLOAT CHECK (aether_resonance >= 0 AND aether_resonance <= 1),
    coherence_score FLOAT CHECK (coherence_score >= 0 AND coherence_score <= 1),
    
    -- Petal mapping (JSON object with petal intensities)
    petal_mapping JSONB DEFAULT '{}',
    
    -- Extracted content
    extracted_text TEXT,
    content_summary TEXT,
    
    -- Wisdom quotes
    wisdom_quotes JSONB DEFAULT '[]',
    
    -- Keywords and themes
    keywords TEXT[] DEFAULT '{}',
    themes JSONB DEFAULT '[]',
    
    -- Full-text search vector
    search_vector tsvector,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ
);

-- ============================================
-- SACRED ASSETS TABLE (for session linking)
-- ============================================

CREATE TABLE IF NOT EXISTS sacred_assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES sacred_documents(id) ON DELETE CASCADE,
    session_id UUID,
    user_id UUID NOT NULL,
    
    -- Asset metadata
    title TEXT NOT NULL,
    preview_url TEXT,
    thumbnail_url TEXT,
    
    -- Asset type and metadata
    type TEXT NOT NULL CHECK (type IN ('doc', 'audio', 'video', 'image')),
    duration FLOAT, -- for audio/video in seconds
    dimensions JSONB, -- {width: number, height: number} for images/videos
    
    -- Resonance data
    element TEXT,
    aether_resonance FLOAT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WISDOM QUOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS wisdom_quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES sacred_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Quote content
    quote_text TEXT NOT NULL,
    context TEXT,
    page_number INTEGER,
    
    -- Associations
    petal_associations TEXT[] DEFAULT '{}',
    element_resonance JSONB DEFAULT '{}',
    
    -- User interactions
    user_notes TEXT,
    favorited BOOLEAN DEFAULT FALSE,
    share_count INTEGER DEFAULT 0,
    meditation_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOLOFLOWER SESSIONS TABLE (for timeline)
-- ============================================

CREATE TABLE IF NOT EXISTS holoflower_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- Session data
    coherence_score FLOAT CHECK (coherence_score >= 0 AND coherence_score <= 1),
    shadow_integration FLOAT CHECK (shadow_integration >= 0 AND shadow_integration <= 1),
    aether_resonance FLOAT CHECK (aether_resonance >= 0 AND aether_resonance <= 1),
    aether_stage INTEGER CHECK (aether_stage >= 0 AND aether_stage <= 3),
    
    -- Petal states (12 petals)
    petal_states JSONB NOT NULL DEFAULT '{}',
    shadow_petals JSONB DEFAULT '{}',
    
    -- Session metadata
    dominant_element TEXT,
    ritual_type TEXT,
    device_tier TEXT,
    duration FLOAT, -- in seconds
    moon_phase FLOAT,
    oracle_mode TEXT,
    
    -- Location (optional)
    location JSONB, -- {lat: number, lng: number}
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Sacred Documents indexes
CREATE INDEX IF NOT EXISTS idx_sacred_documents_user_id ON sacred_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_sacred_documents_session_id ON sacred_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_sacred_documents_status ON sacred_documents(status);
CREATE INDEX IF NOT EXISTS idx_sacred_documents_element ON sacred_documents(element);
CREATE INDEX IF NOT EXISTS idx_sacred_documents_created_at ON sacred_documents(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_sacred_documents_search ON sacred_documents USING gin(search_vector);

-- Sacred Assets indexes
CREATE INDEX IF NOT EXISTS idx_sacred_assets_user_id ON sacred_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_sacred_assets_session_id ON sacred_assets(session_id);
CREATE INDEX IF NOT EXISTS idx_sacred_assets_document_id ON sacred_assets(document_id);
CREATE INDEX IF NOT EXISTS idx_sacred_assets_type ON sacred_assets(type);

-- Wisdom Quotes indexes
CREATE INDEX IF NOT EXISTS idx_wisdom_quotes_user_id ON wisdom_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_quotes_document_id ON wisdom_quotes(document_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_quotes_favorited ON wisdom_quotes(favorited);

-- Holoflower Sessions indexes
CREATE INDEX IF NOT EXISTS idx_holoflower_sessions_user_id ON holoflower_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_holoflower_sessions_created_at ON holoflower_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holoflower_sessions_element ON holoflower_sessions(dominant_element);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update search vector when document content changes
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.filename, '') || ' ' ||
        COALESCE(NEW.extracted_text, '') || ' ' ||
        COALESCE(NEW.content_summary, '') || ' ' ||
        COALESCE(array_to_string(NEW.keywords, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sacred_documents_search_vector
    BEFORE INSERT OR UPDATE ON sacred_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sacred_documents_updated_at
    BEFORE UPDATE ON sacred_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wisdom_quotes_updated_at
    BEFORE UPDATE ON wisdom_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_holoflower_sessions_updated_at
    BEFORE UPDATE ON holoflower_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE sacred_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE holoflower_sessions ENABLE ROW LEVEL SECURITY;

-- Sacred Documents policies
CREATE POLICY "Users can access their own documents" ON sacred_documents
    FOR ALL USING (auth.uid() = user_id);

-- Sacred Assets policies  
CREATE POLICY "Users can access their own assets" ON sacred_assets
    FOR ALL USING (auth.uid() = user_id);

-- Wisdom Quotes policies
CREATE POLICY "Users can access their own quotes" ON wisdom_quotes
    FOR ALL USING (auth.uid() = user_id);

-- Holoflower Sessions policies
CREATE POLICY "Users can access their own sessions" ON holoflower_sessions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for sacred assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sacred-assets', 'sacred-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'sacred-assets' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'sacred-assets' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'sacred-assets' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Insert sample document types
INSERT INTO sacred_documents (
    user_id, filename, file_type, file_path, status, element, 
    aether_resonance, coherence_score, content_summary, wisdom_quotes
) VALUES 
    (
        '00000000-0000-0000-0000-000000000000', 
        'dream-journal-entry.pdf', 
        'text',
        'sample/dream-journal-entry.pdf',
        'analyzed',
        'Water',
        0.87,
        0.74,
        'A profound exploration of water symbolism in dreams...',
        '["The river of consciousness flows through all dreams", "In water, we find the mirror of the soul"]'::jsonb
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'meditation-recording.mp3',
        'audio', 
        'sample/meditation-recording.mp3',
        'analyzed',
        'Aether',
        0.95,
        0.89,
        'Guided meditation with 528Hz healing frequencies...',
        '["Silence is the language of the divine", "Breathe into the space between thoughts"]'::jsonb
    )
ON CONFLICT DO NOTHING;