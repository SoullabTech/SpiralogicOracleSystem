"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
// Import routes
const auth_2 = __importDefault(require("@/routes/auth"));
const oracle_1 = __importDefault(require("@/routes/oracle"));
const journal_1 = __importDefault(require("@/routes/journal"));
const insights_1 = __importDefault(require("@/routes/insights"));
const memory_1 = __importDefault(require("@/routes/memory"));
const api_1 = __importDefault(require("@/routes/api"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
if (!supabaseUrl || !supabaseKey) {
    logger_1.logger.error("Missing Supabase configuration");
    process.exit(1);
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Security middleware
app.use((0, helmet_1.default)({
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
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, "https://your-vercel-domain.vercel.app"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("combined", {
    stream: { write: (message) => logger_1.logger.info(message.trim()) },
}));
// Body parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Static files
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "../assets")));
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
app.use("/api/auth", auth_2.default);
app.use("/api/oracle", auth_1.authMiddleware, oracle_1.default);
app.use("/api/journal", auth_1.authMiddleware, journal_1.default);
app.use("/api/insights", auth_1.authMiddleware, insights_1.default);
app.use("/api/memory", auth_1.authMiddleware, memory_1.default);
app.use("/api", api_1.default);
// Catch-all
app.get("*", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        res.sendFile(path_1.default.join(__dirname, "../../frontend-build/index.html"));
    }
    else {
        res.status(404).json({ error: "Route not found" });
    }
});
// Final error handling
app.use(errorHandler_1.errorHandler);
// Launch
const server = app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Oracle Backend Server running on port ${PORT}`);
    logger_1.logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
    logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
// Graceful shutdown
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    logger_1.logger.info("SIGINT received, shutting down gracefully");
    server.close(() => {
        logger_1.logger.info("Process terminated");
        process.exit(0);
    });
});
exports.default = app;
