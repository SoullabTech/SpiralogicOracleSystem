"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const someTaskFunction_1 = require("./someTaskFunction"); // Ensure this path is correct
// Define a cron job to run every day at midnight (adjust timezone if needed)
node_cron_1.default.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task at midnight");
    try {
        await (0, someTaskFunction_1.someTaskFunction)(); // Execute your task
    }
    catch (error) {
        console.error("Error executing task:", error);
        // Optionally, you could add an alerting mechanism here (e.g., send email or Slack notification)
    }
}, {
    timezone: "UTC", // You can specify a timezone here if necessary
});
exports.default = node_cron_1.default; // Export the cron job to allow for future modifications or access
