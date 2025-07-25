-- Create spiralogic_reports table
CREATE TABLE IF NOT EXISTS spiralogic_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL DEFAULT 'astrology',
    content TEXT NOT NULL,
    sections JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_spiralogic_reports_user_id ON spiralogic_reports(user_id);
CREATE INDEX idx_spiralogic_reports_report_type ON spiralogic_reports(report_type);
CREATE INDEX idx_spiralogic_reports_generated_at ON spiralogic_reports(generated_at DESC);

-- Enable Row Level Security
ALTER TABLE spiralogic_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own reports
CREATE POLICY "Users can view their own reports"
    ON spiralogic_reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to create their own reports
CREATE POLICY "Users can create their own reports"
    ON spiralogic_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own reports
CREATE POLICY "Users can delete their own reports"
    ON spiralogic_reports
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment to the table
COMMENT ON TABLE spiralogic_reports IS 'Stores generated Spiralogic astrology and archetypal reports';

-- Add comments to columns
COMMENT ON COLUMN spiralogic_reports.id IS 'Unique identifier for the report';
COMMENT ON COLUMN spiralogic_reports.user_id IS 'Reference to the user who owns this report';
COMMENT ON COLUMN spiralogic_reports.report_type IS 'Type of report (astrology, archetypal, etc.)';
COMMENT ON COLUMN spiralogic_reports.content IS 'Full text content of the generated report';
COMMENT ON COLUMN spiralogic_reports.sections IS 'JSON object containing report sections';
COMMENT ON COLUMN spiralogic_reports.metadata IS 'JSON object containing report metadata (birth info, elements, etc.)';
COMMENT ON COLUMN spiralogic_reports.generated_at IS 'Timestamp when the report was generated';
COMMENT ON COLUMN spiralogic_reports.version IS 'Version of the report generation system used';