"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.someTaskFunction = void 0;
const winston_1 = __importDefault(require("winston"));
const node_fetch_1 = __importDefault(require("node-fetch")); // Add this if using Node.js without native fetch
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.simple(), winston_1.default.format.colorize()),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: "task.log" }),
    ],
});
const someTaskFunction = async () => {
    const startTime = Date.now(); // Track when the task starts
    try {
        logger.info("Starting task...");
        const data = await (0, node_fetch_1.default)("https://api.example.com/data");
        // Handle non-200 HTTP responses
        if (!data.ok) {
            throw new Error(`Failed to fetch data: ${data.statusText}`);
        }
        const json = await data.json();
        logger.info("Fetched data:", json);
    }
    catch (error) {
        logger.error("Error during task execution:", error);
    }
    finally {
        const endTime = Date.now();
        const duration = endTime - startTime;
        logger.info(`Task finished in ${duration} ms`);
    }
};
exports.someTaskFunction = someTaskFunction;
