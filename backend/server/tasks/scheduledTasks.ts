import cron from "node-cron";
import { someTaskFunction } from "./someTaskFunction"; // Ensure this path is correct

// Define a cron job to run every day at midnight (adjust timezone if needed)
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running scheduled task at midnight");
    try {
      await someTaskFunction(); // Execute your task
    } catch (error) {
      console.error("Error executing task:", error);
      // Optionally, you could add an alerting mechanism here (e.g., send email or Slack notification)
    }
  },
  {
    timezone: "UTC", // You can specify a timezone here if necessary
  },
);

export default cron; // Export the cron job to allow for future modifications or access
