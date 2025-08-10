import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import bodyParser from "body-parser";
import rateLimit, { ValueDeterminingMiddleware } from "express-rate-limit";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import apiRouter from "./routes/routes";
import extractSymbolsRouter from "./routes/oracle/extractSymbols";
import dreamQueryRouter from "./routes/oracle/dreamQuery";
import symbolThreadsRouter from "./routes/oracle/symbolThreads";
import memoryRouter from "./routes/memory";
import ainRoutes from "./routes/ain.routes";

app.use("/api/ain", ainRoutes);
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 5001;
const isProduction = process.env.NODE_ENV === "production";

app.enable("trust proxy");

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.path === "/health",
  keyGenerator: ((req: Request) => {
    const xff = req.headers["x-forwarded-for"];
    if (Array.isArray(xff)) return xff[0];
    if (typeof xff === "string") return xff.split(",")[0].trim();
    return req.ip;
  }) as ValueDeterminingMiddleware<string>,
});

app.use(
  helmet({
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction,
    crossOriginOpenerPolicy: isProduction,
    crossOriginResourcePolicy: isProduction,
  }),
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
  }),
);

app.use(limiter);
app.use(compression());
app.use(
  morgan(process.env.MORGAN_FORMAT || "dev", {
    skip: (req) => req.path === "/health",
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Oracle endpoints
app.use("/api/oracle", extractSymbolsRouter);
app.use("/api/oracle", dreamQueryRouter);
app.use("/api/oracle", symbolThreadsRouter);

// Memory system endpoints
app.use("/api/memory", memoryRouter);

// Main API
app.use("/api", apiRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

if (isProduction) {
  app.use(express.static(join(__dirname, "../../oracle-frontend/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(join(__dirname, "../../oracle-frontend/dist/index.html"));
  });
}

app.use((_req, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res
    .status(500)
    .json({ error: isProduction ? "Internal Server Error" : err.message });
});

app.listen(PORT, () => {
  console.log(`🔮 Oracle backend running on http://localhost:${PORT}`);
});

export default app;
