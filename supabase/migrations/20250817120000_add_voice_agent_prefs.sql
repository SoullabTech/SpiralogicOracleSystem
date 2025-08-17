-- Add voice + agent fields to oracle_preferences or user_preferences
-- Idempotent migration that checks which table exists and adds columns only if needed

DO $$
DECLARE
    oracle_prefs_exists boolean;
    user_prefs_exists boolean;
    target_table text;
BEGIN
    -- Check if oracle_preferences table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'oracle_preferences'
    ) INTO oracle_prefs_exists;
    
    -- Check if user_preferences table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_preferences'
    ) INTO user_prefs_exists;
    
    -- Determine target table (prefer oracle_preferences)
    IF oracle_prefs_exists THEN
        target_table := 'oracle_preferences';
    ELSIF user_prefs_exists THEN
        target_table := 'user_preferences';
    ELSE
        RAISE EXCEPTION 'Neither oracle_preferences nor user_preferences table exists';
    END IF;
    
    RAISE NOTICE 'Using table: %', target_table;
    
    -- Add agent_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'agent_name'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN agent_name text', target_table);
        RAISE NOTICE 'Added agent_name column to %', target_table;
    ELSE
        RAISE NOTICE 'agent_name column already exists in %', target_table;
    END IF;
    
    -- Add voice_provider column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'voice_provider'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN voice_provider text DEFAULT ''elevenlabs''', target_table);
        RAISE NOTICE 'Added voice_provider column to %', target_table;
    ELSE
        RAISE NOTICE 'voice_provider column already exists in %', target_table;
    END IF;
    
    -- Add voice_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'voice_id'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN voice_id text', target_table);
        RAISE NOTICE 'Added voice_id column to %', target_table;
    ELSE
        RAISE NOTICE 'voice_id column already exists in %', target_table;
    END IF;
    
    -- Add tts_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'tts_enabled'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN tts_enabled boolean DEFAULT false', target_table);
        RAISE NOTICE 'Added tts_enabled column to %', target_table;
    ELSE
        RAISE NOTICE 'tts_enabled column already exists in %', target_table;
    END IF;
    
    -- Add speech_rate column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'speech_rate'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN speech_rate numeric DEFAULT 1.0', target_table);
        RAISE NOTICE 'Added speech_rate column to %', target_table;
    ELSE
        RAISE NOTICE 'speech_rate column already exists in %', target_table;
    END IF;
    
    -- Add speech_pitch column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'speech_pitch'
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN speech_pitch numeric DEFAULT 1.0', target_table);
        RAISE NOTICE 'Added speech_pitch column to %', target_table;
    ELSE
        RAISE NOTICE 'speech_pitch column already exists in %', target_table;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully for table: %', target_table;
END $$;