"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Minimal server for Render deployment
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Basic middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        message: '🔮 Oracle backend is operational',
        timestamp: new Date().toISOString()
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: '🌀 Sacred Techno-Interface',
        status: 'operational',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api'
        }
    });
});
// Basic API endpoint
app.get('/api', (_req, res) => {
    res.json({
        message: 'Oracle API ready',
        version: '1.0.0'
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The Oracle cannot see this path'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🔮 Oracle backend running at http://localhost:${PORT}`);
});
exports.default = app;
