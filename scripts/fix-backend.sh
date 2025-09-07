#!/bin/bash

echo "🔧 Fixing SpiralogicOracleSystem Backend Issues..."

# Change to backend directory
cd backend

# 1. Create missing logger utility
echo "📝 Creating logger utility..."
mkdir -p src/utils
cat > src/utils/logger.ts << 'EOF'
// Simple logger utility for backend services
export const logger = {
  info: (...args: any[]) => console.log('[INFO]', new Date().toISOString(), ...args),
  warn: (...args: any[]) => console.warn('[WARN]', new Date().toISOString(), ...args),
  error: (...args: any[]) => console.error('[ERROR]', new Date().toISOString(), ...args),
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }
};

export default logger;
EOF

# 2. Fix Express types for file uploads
echo "📝 Adding Express type augmentations..."
mkdir -p src/types
cat > src/types/express.d.ts << 'EOF'
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
    
    interface Response {
      success?: (data: any) => void;
      error?: (error: any) => void;
    }
  }
}

export {};
EOF

# 3. Fix voice tone types
echo "📝 Fixing voice tone types..."
if [ -f "src/types/voice.ts" ]; then
  # Update existing voice types file
  sed -i.bak 's/type VoiceTone = "conversational" | "contemplative" | "rushed" | "spacious"/type VoiceTone = "conversational" | "contemplative" | "rushed" | "spacious" | "flowing"/' src/types/voice.ts
else
  # Create voice types file if it doesn't exist
  cat > src/types/voice.ts << 'EOF'
export type VoiceTone = "conversational" | "contemplative" | "rushed" | "spacious" | "flowing";

export interface VoiceConfig {
  tone: VoiceTone;
  speed?: number;
  pitch?: number;
}
EOF
fi

# 4. Replace custom response methods with standard JSON responses
echo "🔧 Fixing response methods..."

# Fix .success() calls
find src -name "*.ts" -type f -exec sed -i.bak 's/res\.success(\([^)]*\))/res.json({ success: true, data: \1 })/g' {} \;

# Fix .error() calls
find src -name "*.ts" -type f -exec sed -i.bak 's/res\.error(\([^)]*\))/res.status(400).json({ success: false, error: \1 })/g' {} \;

# 5. Clean up backup files
find src -name "*.bak" -delete

# 6. Ensure all imports are correct
echo "🔧 Verifying imports..."

# Fix any logger imports that might be incorrect
find src -name "*.ts" -type f -exec sed -i '' 's|from.*["\x27]\.\.\/utils\/logger["\x27]|from "../utils/logger"|g' {} \; 2>/dev/null || true
find src -name "*.ts" -type f -exec sed -i '' 's|from.*["\x27]\.\.\/\.\.\/utils\/logger["\x27]|from "../../utils/logger"|g' {} \; 2>/dev/null || true

# 7. Create response middleware if needed
echo "📝 Creating response middleware..."
cat > src/middleware/responseHelpers.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';

export const responseHelpers = (req: Request, res: Response, next: NextFunction) => {
  res.success = function(data: any) {
    return this.json({
      success: true,
      data
    });
  };

  res.error = function(error: any, statusCode: number = 400) {
    return this.status(statusCode).json({
      success: false,
      error: error.message || error
    });
  };

  next();
};
EOF

# 8. Add a quick TypeScript compile check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit || echo "⚠️  TypeScript found some issues - review the output above"

echo "✅ Backend fixes applied!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' in the backend directory"
echo "2. If you still see type errors, run 'npm run typecheck' to see details"
echo "3. The logger is now available at 'src/utils/logger.ts'"
echo ""
echo "Optional: To use the response helpers middleware, add this to your server.ts:"
echo "  import { responseHelpers } from './middleware/responseHelpers';"
echo "  app.use(responseHelpers);"