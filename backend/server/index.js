"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = require("path");
const url_1 = require("url");
const routes_1 = __importDefault(require("./routes/routes"));
const extractSymbols_1 = __importDefault(require("./routes/oracle/extractSymbols"));
const dreamQuery_1 = __importDefault(require("./routes/oracle/dreamQuery"));
const symbolThreads_1 = __importDefault(require("./routes/oracle/symbolThreads"));
const memory_1 = __importDefault(require("./routes/memory"));
const ain_routes_1 = __importDefault(require("./routes/ain.routes"));
app.use("/api/ain", ain_routes_1.default);
const __dirname = (0, path_1.dirname)((0, url_1.fileURLToPath)(import.meta.url));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5001;
const isProduction = process.env.NODE_ENV === "production";
app.enable("trust proxy");
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health",
    keyGenerator: ((req) => {
        const xff = req.headers["x-forwarded-for"];
        if (Array.isArray(xff))
            return xff[0];
        if (typeof xff === "string")
            return xff.split(",")[0].trim();
        return req.ip;
    }),
});
app.use((0, helmet_1.default)({
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction,
    crossOriginOpenerPolicy: isProduction,
    crossOriginResourcePolicy: isProduction,
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
}));
app.use(limiter);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)(process.env.MORGAN_FORMAT || "dev", {
    skip: (req) => req.path === "/health",
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Oracle endpoints
app.use("/api/oracle", extractSymbols_1.default);
app.use("/api/oracle", dreamQuery_1.default);
app.use("/api/oracle", symbolThreads_1.default);
// Memory system endpoints
app.use("/api/memory", memory_1.default);
// Main API
app.use("/api", routes_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});
if (isProduction) {
    app.use(express_1.default.static((0, path_1.join)(__dirname, "../../oracle-frontend/dist")));
    app.get("*", (_req, res) => {
        res.sendFile((0, path_1.join)(__dirname, "../../oracle-frontend/dist/index.html"));
    });
}
app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res
        .status(500)
        .json({ error: isProduction ? "Internal Server Error" : err.message });
});
app.listen(PORT, () => {
    console.log(`🔮 Oracle backend running on http://localhost:${PORT}`);
});
exports.default = app;
