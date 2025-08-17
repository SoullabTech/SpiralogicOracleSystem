"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({ message: "Welcome to the API" });
});
router.use("/journal", journalRoutes);
exports.default = router;
