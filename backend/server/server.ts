import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";
import { errorHandler } from "@/middleware/errorHandler";
import { authMiddleware } from "@/middleware/auth";

// Import routes
import authRoutes from "@/routes/auth";
import oracleRoutes from "@/routes/oracle";
import journalRoutes from "@/routes/journal";
import insightsRoutes from "@/routes/insights";
import memoryRoutes from "@/routes/memory";
import apiRoutes from "@/routes/api";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  logger.error("Missing Supabase configuration");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://api.openai.com",
          "https://*.supabase.co",
        ],
      },
    },
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, "https://your-vercel-domain.vercel.app"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/oracle", authMiddleware, oracleRoutes);
app.use("/api/journal", authMiddleware, journalRoutes);
app.use("/api/insights", authMiddleware, insightsRoutes);
app.use("/api/memory", authMiddleware, memoryRoutes);
app.use("/api", apiRoutes);

// Catch-all
app.get("*", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.sendFile(path.join(__dirname, "../../frontend-build/index.html"));
  } else {
    res.status(404).json({ error: "Route not found" });
  }
});

// Final error handling
app.use(errorHandler);

// Launch
const server = app.listen(PORT, () => {
  logger.info(`🚀 Oracle Backend Server running on port ${PORT}`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

export default app;
