"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemoryById = exports.getMemories = exports.saveMemory = void 0;
// 📁 oracle-backend/src/lib/memoryStore.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const uuid_1 = require("uuid");
const db = new better_sqlite3_1.default('./oracle_memory.db');
// Initialize table
const init = () => {
    db.exec(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    user TEXT,
    type TEXT,
    content TEXT,
    symbols TEXT,
    created_at TEXT
  )`);
};
init();
const saveMemory = (user, type, content, symbols = []) => {
    const id = (0, uuid_1.v4)();
    const stmt = db.prepare('INSERT INTO memories VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, user, type, content, JSON.stringify(symbols), new Date().toISOString());
    return id;
};
exports.saveMemory = saveMemory;
const getMemories = (user, type) => {
    const stmt = type
        ? db.prepare('SELECT * FROM memories WHERE user = ? AND type = ? ORDER BY created_at DESC')
        : db.prepare('SELECT * FROM memories WHERE user = ? ORDER BY created_at DESC');
    return stmt.all(user, type).map(m => ({ ...m, symbols: JSON.parse(m.symbols) }));
};
exports.getMemories = getMemories;
const getMemoryById = (id) => {
    const stmt = db.prepare('SELECT * FROM memories WHERE id = ?');
    const mem = stmt.get(id);
    return mem ? { ...mem, symbols: JSON.parse(mem.symbols) } : null;
};
exports.getMemoryById = getMemoryById;
