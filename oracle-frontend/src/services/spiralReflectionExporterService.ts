// src/services/spiralReflectionExporterService.ts

import jsPDF from 'jspdf';
import { SpiralJourney } from '@/types/spiralJourney';

export function exportSpiralReflection(journey: SpiralJourney, userName: string = 'Traveler') {
  const doc = new jsPDF();

  const now = new Date().toLocaleDateString();
  let y = 20;

  doc.setFontSize(16);
  doc.text(`Spiral Reflection Journey`, 105, y, { align: 'center' });

  y += 10;
  doc.setFontSize(12);
  doc.text(`Participant: ${userName}`, 20, y);
  doc.text(`Date: ${now}`, 150, y);

  y += 20;
  doc.setFontSize(14);
  doc.text('Breath Journey:', 20, y);

  journey.breaths.forEach((breath, index) => {
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${index + 1}. ${breath.timestamp.slice(0, 10)} — Element: ${breath.element}`, 25, y);
  });

  y += 20;
  doc.setFontSize(14);
  doc.text('Threshold Crossings:', 20, y);

  journey.thresholds.forEach((threshold, index) => {
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${index + 1}. From ${threshold.from} ➔ To ${threshold.to} (${threshold.timestamp.slice(0, 10)})`,
      25,
      y,
    );
  });

  y += 30;
  doc.setFontSize(12);
  doc.text('May your Spiral continue breathing new worlds into being.', 105, y, {
    align: 'center',
  });

  const fileName = `spiral_reflection_${now.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
