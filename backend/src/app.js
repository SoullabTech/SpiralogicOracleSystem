"use strict";
// oracle-backend/src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const facetMap_routes_1 = __importDefault(require("./routes/facetMap.routes"));
const memory_routes_1 = __importDefault(require("./routes/memory.routes"));
const memory_routes_enhanced_1 = __importDefault(require("./routes/memory.routes.enhanced"));
const soulMemory_routes_1 = __importDefault(require("./routes/soulMemory.routes"));
const auth_1 = __importDefault(require("./routes/auth"));
const oracle_1 = __importDefault(require("./routes/oracle"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const authenticate_1 = require("./middleware/authenticate");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(body_parser_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/oracle/facet-map', facetMap_routes_1.default);
app.use('/api/oracle/memory', authenticate_1.authenticate, memory_routes_enhanced_1.default); // Enhanced with Soul Memory integration
app.use('/api/oracle/memory-legacy', authenticate_1.authenticate, memory_routes_1.default); // Legacy routes for backwards compatibility
app.use('/api/soul-memory', soulMemory_routes_1.default);
app.use('/api/oracle', oracle_1.default);
// Test routes (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/test', test_routes_1.default);
}
// Root
app.get('/', (_req, res) => {
    res.send('🧠 Spiralogic Oracle Backend is Alive');
});
exports.default = app;
// Trigger Railway deploy
