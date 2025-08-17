"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../../src/lib/supabase");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_1.isAdmin);
// Memory endpoint with filtering and pagination
router.get("/memory", async (req, res) => {
    try {
        const { element, facet, startDate, endDate, page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc", } = req.query;
        let query = supabase_1.supabase.from("memory_items").select("*", { count: "exact" });
        // Apply filters
        if (element) {
            query = query.eq("element", element);
        }
        if (facet) {
            query = query.eq("facet", facet);
        }
        if (startDate) {
            query = query.gte("created_at", startDate);
        }
        if (endDate) {
            query = query.lte("created_at", endDate);
        }
        // Apply pagination and sorting
        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;
        query = query
            .order(sortBy, { ascending: sortOrder === "asc" })
            .range(from, to);
        const { data, error, count } = await query;
        if (error) {
            throw error;
        }
        res.json({
            data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                totalPages: Math.ceil((count || 0) / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching memory data:", error);
        res.status(500).json({ error: "Failed to fetch memory data" });
    }
});
// Feedback endpoint with aggregation
router.get("/feedback", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Get feedback data
        let query = supabase_1.supabase.from("oracle_feedback").select("*");
        if (startDate) {
            query = query.gte("created_at", startDate);
        }
        if (endDate) {
            query = query.lte("created_at", endDate);
        }
        const { data: feedbackData, error: feedbackError } = await query;
        if (feedbackError) {
            throw feedbackError;
        }
        // Calculate aggregations
        const aggregations = {
            totalFeedback: feedbackData.length,
            averageRating: feedbackData.reduce((acc, f) => acc + f.rating, 0) /
                feedbackData.length,
            elementalDistribution: feedbackData.reduce((acc, f) => {
                const element = f.metadata?.element;
                if (element) {
                    acc[element] = (acc[element] || 0) + 1;
                }
                return acc;
            }, {}),
            ratingDistribution: feedbackData.reduce((acc, f) => {
                acc[f.rating] = (acc[f.rating] || 0) + 1;
                return acc;
            }, {}),
        };
        res.json({
            data: feedbackData,
            aggregations,
        });
    }
    catch (error) {
        console.error("Error fetching feedback data:", error);
        res.status(500).json({ error: "Failed to fetch feedback data" });
    }
});
// System logs endpoint
router.get("/logs", async (req, res) => {
    try {
        const { level, startDate, endDate, page = 1, limit = 50 } = req.query;
        let query = supabase_1.supabase.from("system_logs").select("*", { count: "exact" });
        if (level) {
            query = query.eq("level", level);
        }
        if (startDate) {
            query = query.gte("timestamp", startDate);
        }
        if (endDate) {
            query = query.lte("timestamp", endDate);
        }
        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;
        query = query.order("timestamp", { ascending: false }).range(from, to);
        const { data, error, count } = await query;
        if (error) {
            throw error;
        }
        res.json({
            data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                totalPages: Math.ceil((count || 0) / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching system logs:", error);
        res.status(500).json({ error: "Failed to fetch system logs" });
    }
});
// Configuration endpoints
router.get("/config", async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from("system_config")
            .select("*")
            .single();
        if (error) {
            throw error;
        }
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching system config:", error);
        res.status(500).json({ error: "Failed to fetch system config" });
    }
});
router.put("/config", async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from("system_config")
            .upsert({
            ...req.body,
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error) {
            throw error;
        }
        res.json(data);
    }
    catch (error) {
        console.error("Error updating system config:", error);
        res.status(500).json({ error: "Failed to update system config" });
    }
});
exports.default = router;
