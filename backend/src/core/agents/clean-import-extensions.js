"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baseDir = path_1.default.resolve('./src');
function updateImportsInFile(filePath) {
    let content = fs_1.default.readFileSync(filePath, 'utf8');
    const original = content;
    // Replace .js only in import/export paths
    content = content.replace(/((?:import|export)[^'"]+['"](?:[^'"]+))\.js(['"])/g, '$1$2');
    if (content !== original) {
        fs_1.default.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
    }
}
function walkDir(dir) {
    const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path_1.default.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        }
        else if (entry.isFile() &&
            fullPath.endsWith('.ts') &&
            !fullPath.endsWith('.d.ts')) {
            updateImportsInFile(fullPath);
        }
    }
}
walkDir(baseDir);
console.log('🎉 Finished cleaning .js extensions from import paths.');
