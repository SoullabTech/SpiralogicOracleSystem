"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MainOracleAgent_1 = require("../core/agents/MainOracleAgent");
const router = express_1.default.Router();
router.get("/ain", (req, res) => {
    res.json(MainOracleAgent_1.oracle.identityProfile);
});
exports.default = router;
