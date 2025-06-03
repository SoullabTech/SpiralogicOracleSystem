'use client';

interface SoulCompassProps {
  response: string;
  metadata: Record<string, unknown> | null;
}

export default function SoulCompass({ response, metadata }: SoulCompassProps) {
  return (
    <div className="p-4 border rounded-md bg-muted/10">
      <h2 className="text-lg font-semibold mb-2">🧭 Soul Compass</h2>
      <p>{response}</p>
      {metadata && (
        <div className="mt-2 text-sm text-muted-foreground">
          <details>
            <summary>Metadata</summary>
            <pre className="mt-1 text-xs overflow-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}