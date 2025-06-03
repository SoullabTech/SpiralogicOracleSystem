"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfile = validateProfile;
const elemental_1 = require("../schemas/elemental");
function validateProfile(input) {
    const parsed = elemental_1.elementalProfileSchema.safeParse(input);
    if (!parsed.success) {
        return { error: parsed.error.flatten(), data: null };
    }
    return { error: null, data: parsed.data };
}
