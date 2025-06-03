"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateElementalProfilePDF = generateElementalProfilePDF;
const jspdf_1 = __importDefault(require("jspdf"));
function generateElementalProfilePDF(profile) {
    const doc = new jspdf_1.default();
    doc.setFontSize(16);
    doc.text('Elemental Profile Insight Summary', 20, 20);
    let y = 40;
    Object.entries(profile).forEach(([element, value]) => {
        doc.text(`${element.toUpperCase()}: ${value}`, 20, y);
        y += 10;
    });
    y += 10;
    doc.text('Oracle Insight:', 20, y);
    y += 10;
    doc.text('You are called to ground your Fire in Aether. Let vision find stillness.', 20, y);
    y += 20;
    doc.text('Affirmation:', 20, y);
    y += 10;
    doc.text('I burn with clarity and breathe with grace.', 20, y);
    y += 20;
    doc.text('Ritual:', 20, y);
    y += 10;
    doc.text('At dawn, light a candle and chant your desire into a stone.', 20, y);
    doc.save('Elemental_Profile_Summary.pdf');
}
