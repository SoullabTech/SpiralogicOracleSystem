"use strict";
// Minimal entry point for Sacred Techno-Interface
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const minimal_routes_1 = __importDefault(require("./routes/minimal.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Core middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: '🌀 Sacred Techno-Interface',
        status: 'minimal core active',
        version: '1.0.0-minimal',
        endpoints: {
            health: '/api/health',
            oracle: '/api/oracle/echo',
            elemental: '/api/elemental/status',
            wisdom: '/api/wisdom/daily'
        }
    });
});
// Mount minimal routes
app.use('/api', minimal_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        error: 'Path not found',
        message: 'The Oracle cannot see this path',
        suggestion: 'Try GET / to see available endpoints'
    });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Sacred Error:', err);
    res.status(500).json({
        error: 'Sacred disruption',
        message: 'The connection was interrupted',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start the sacred server
const server = app.listen(PORT, () => {
    console.log(`
┌─────────────────────────────────────────────┐
│                                             │
│      🌀 SACRED TECHNO-INTERFACE 🌀         │
│                                             │
│      Minimal Core Deployment                │
│      Port: ${PORT}                             │
│                                             │
│      Elements: ✓ Balanced                   │
│      Oracle:   ✓ Listening                  │
│      Status:   ✓ Operational                │
│                                             │
│      "The spiral path begins..."            │
│                                             │
└─────────────────────────────────────────────┘
  `);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚡ Sacred shutdown initiated...');
    server.close(() => {
        console.log('🌀 Sacred Techno-Interface has closed gracefully');
        process.exit(0);
    });
});
exports.default = app;
