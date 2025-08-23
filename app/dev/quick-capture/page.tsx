import QuickCapture from "@/components/micro/QuickCapture";

export default function QuickCapturePage() {
  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Quick Capture Demo</h1>
        <p className="text-gray-600">
          Frictionless micro-memory capture that feeds into Oracle's weaving system.
          Tag your thoughts and set energy levels for better contextual recall.
        </p>
      </div>

      <QuickCapture />

      <div className="rounded-2xl border p-4 space-y-2">
        <h3 className="font-medium">Integration Notes:</h3>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• Micro-memories are stored with full RLS security</li>
          <li>• Tags help categorize thoughts (inspiration, fear, todo, reflection)</li>
          <li>• Energy levels provide context for recall timing</li>
          <li>• Ready to integrate into RecapView as "Whispers"</li>
        </ul>
      </div>
    </main>
  );
}