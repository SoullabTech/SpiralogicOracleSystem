'use client';

import jsPDF from 'jspdf';

export function DownloadProfilePDF({ profile }: { profile: Record<string, number> }) {
  const download = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Elemental Profile Insight Summary', 20, 20);

    doc.setFontSize(12);
    let y = 40;
    Object.entries(profile).forEach(([element, score]) => {
      doc.text(`${element.toUpperCase()}: ${score}`, 20, y);
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
  };

  return (
    <button
      onClick={download}
      className="mt-6 px-4 py-2 bg-gold text-deep-purple font-bold rounded"
    >
      📄 Download Insight PDF
    </button>
  );
}
