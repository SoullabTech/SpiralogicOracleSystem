export default function TestAutoReload() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">🔄 Auto-Reload Test</h1>
      <p>This page tests Docker live development auto-reload functionality.</p>
      <p className="mt-4">Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}