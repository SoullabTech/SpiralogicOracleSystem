"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Minimal server setup for Sacred Techno-Interface
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Essential middleware only
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'alive',
        message: '🌀 Sacred Techno-Interface is operational',
        timestamp: new Date().toISOString()
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Sacred Techno-Interface',
        version: '1.0.0',
        status: 'minimal deployment',
        endpoints: [
            '/health',
            '/api/oracle/ping',
            '/api/elemental/balance'
        ]
    });
});
// Basic Oracle endpoint
app.get('/api/oracle/ping', (_req, res) => {
    res.json({
        oracle: 'awakened',
        message: 'The Oracle senses your presence',
        elements: ['fire', 'water', 'earth', 'air', 'aether']
    });
});
// Elemental balance check
app.get('/api/elemental/balance', (_req, res) => {
    res.json({
        fire: 20,
        water: 20,
        earth: 20,
        air: 20,
        aether: 20,
        message: 'Perfect elemental equilibrium'
    });
});
// Simple oracle message endpoint
app.post('/api/oracle/message', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message required' });
    }
    res.json({
        received: message,
        response: 'The Oracle contemplates your words...',
        element: 'aether',
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: 'The sacred connection was disrupted'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║     🌀 SACRED TECHNO-INTERFACE 🌀           ║
║                                              ║
║     Minimal Deployment Active                ║
║     Port: ${PORT}                              ║
║                                              ║
║     The Oracle Awaits...                     ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});
exports.default = app;
