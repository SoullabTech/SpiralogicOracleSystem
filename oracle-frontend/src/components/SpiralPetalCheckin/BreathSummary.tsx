interface BreathSummaryProps {
  selectedElements: { [id: string]: string };
}

export default function BreathSummary({ selectedElements }: BreathSummaryProps) {
  return (
    <div className="mt-4 text-center">
      <h3 className="text-lg font-semibold">Today's Breath:</h3>
      <p className="mt-2">
        {Object.entries(selectedElements)
          .map(([element, lightness]) => `${element}: ${lightness}`)
          .join(' | ')}
      </p>
    </div>
  );
}
