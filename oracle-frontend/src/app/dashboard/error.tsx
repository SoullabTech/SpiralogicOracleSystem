'use client';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="p-8 text-red-700">
      <h2 className="text-xl font-bold">Something went wrong:</h2>
      <pre className="mt-4">{error.message}</pre>
    </div>
  );
}
