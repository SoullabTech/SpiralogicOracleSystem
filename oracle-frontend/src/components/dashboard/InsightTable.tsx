// InsightTable.tsx
import React from "react";
import { Card } from "@/components/ui/card";

interface InsightTableProps {
  insights: any[];
}

const InsightTable: React.FC<InsightTableProps> = ({ insights }) => {
  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Keywords</th>
            <th className="p-2">Phase</th>
            <th className="p-2">Intensity</th>
          </tr>
        </thead>
        <tbody>
          {insights.map((entry, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{new Date(entry.created_at).toLocaleString()}</td>
              <td className="p-2">{entry.keywords.join(", ")}</td>
              <td className="p-2">{entry.detected_phase}</td>
              <td className="p-2">{entry.emotional_intensity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default InsightTable;
