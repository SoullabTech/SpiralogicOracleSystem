"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// oracle-backend/src/server.ts
const oracle_routes_1 = __importDefault(require("./routes/oracle.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const PORT = parseInt(process.env.PORT || '3001', 10);
app_1.default.use('/api/oracle', oracle_routes_1.default); // exposes POST /api/oracle/respond
app_1.default.listen(PORT, () => {
    console.log(`🔮 Oracle backend running at http://localhost:${PORT}`);
});
