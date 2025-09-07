const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// Redis client for rate limiting
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false,
});

// Redis connection error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Rate limiting configurations
const createRateLimiter = (windowMs, max, keyPrefix) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: keyPrefix,
    }),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  });
};

// Different rate limiters for different endpoints
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'general:'); // 100 requests per 15 minutes
const oracleLimiter = createRateLimiter(60 * 1000, 30, 'oracle:'); // 30 requests per minute
const voiceLimiter = createRateLimiter(60 * 1000, 10, 'voice:'); // 10 requests per minute
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 20, 'upload:'); // 20 uploads per hour

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.['auth-token'];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'spiralogic-oracle-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Optional authentication middleware (allows both authenticated and anonymous)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.['auth-token'];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'spiralogic-oracle-secret-key-change-in-production', (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    redis: redisClient.status === 'ready' ? 'connected' : 'disconnected',
  });
});

// Oracle chat endpoint with authentication and rate limiting
app.post('/api/oracle/chat', authenticateToken, oracleLimiter, async (req, res) => {
  try {
    // Forward to Next.js API route
    const response = await fetch(`http://localhost:${process.env.NEXT_PORT || 3001}/api/oracle/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': req.user.userId,
        'x-user-email': req.user.email,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Oracle chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice synthesis endpoint
app.post('/api/voice/synthesize', authenticateToken, voiceLimiter, async (req, res) => {
  try {
    // Forward to Next.js API route
    const response = await fetch(`http://localhost:${process.env.NEXT_PORT || 3001}/api/voice/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': req.user.userId,
      },
      body: JSON.stringify(req.body),
    });

    if (response.headers.get('content-type')?.includes('audio')) {
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', response.headers.get('content-type'));
      res.send(Buffer.from(buffer));
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process file upload (you can add S3 upload logic here)
    const fileInfo = {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer, // In production, upload to S3/cloud storage
    };

    // Forward to your file processing service
    res.json({
      success: true,
      file: {
        name: fileInfo.filename,
        type: fileInfo.mimetype,
        size: fileInfo.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Apply general rate limiter to all other routes
app.use(generalLimiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express middleware server running on port ${PORT}`);
  console.log(`🔐 Security features: Helmet, CORS, Rate Limiting`);
  console.log(`📊 Redis status: ${redisClient.status}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    redisClient.disconnect();
  });
});

module.exports = app;