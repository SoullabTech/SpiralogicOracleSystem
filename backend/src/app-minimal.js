"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Minimal app configuration for Sacred Techno-Interface
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
// Essential middleware only
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging in development only
if (process.env.NODE_ENV !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        message: '🌀 Sacred Techno-Interface - Minimal Core Active',
        status: 'operational'
    });
});
exports.default = app;
