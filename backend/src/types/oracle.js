"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementalThemeSchema = void 0;
const zod_1 = require("zod");
exports.elementalThemeSchema = zod_1.z.enum(['fire', 'water', 'earth', 'air', 'aether']);
