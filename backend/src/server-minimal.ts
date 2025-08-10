// Minimal server setup for Sacred Techno-Interface
import express from "express";
import cors from "cors";
import { config } from "dotenv";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Essential middleware only
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "alive",
    message: "🌀 Sacred Techno-Interface is operational",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "Sacred Techno-Interface",
    version: "1.0.0",
    status: "minimal deployment",
    endpoints: ["/health", "/api/oracle/ping", "/api/elemental/balance"],
  });
});

// Basic Oracle endpoint
app.get("/api/oracle/ping", (_req, res) => {
  res.json({
    oracle: "awakened",
    message: "The Oracle senses your presence",
    elements: ["fire", "water", "earth", "air", "aether"],
  });
});

// Elemental balance check
app.get("/api/elemental/balance", (_req, res) => {
  res.json({
    fire: 20,
    water: 20,
    earth: 20,
    air: 20,
    aether: 20,
    message: "Perfect elemental equilibrium",
  });
});

// Simple oracle message endpoint
app.post("/api/oracle/message", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  res.json({
    received: message,
    response: "The Oracle contemplates your words...",
    element: "aether",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: "The sacred connection was disrupted",
    });
  },
);

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

export default app;
