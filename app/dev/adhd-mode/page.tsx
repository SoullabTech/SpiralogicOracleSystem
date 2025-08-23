// Example integration page for ADHD Mode features
import NeurodivergentMode from "@/components/settings/NeurodivergentMode";
import QuickCaptureND from "@/components/capture/QuickCaptureND";

export default function ADHDModeDemo() {
  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">ADHD Mode Demo</h1>
        <p className="text-gray-600">
          This page demonstrates the neurodivergent/ADHD features. 
          Enable ADHD Mode in settings to see the Quick Capture component.
        </p>
      </div>

      {/* Settings Component */}
      <NeurodivergentMode 
        onChange={(changes) => {
          console.log("ADHD settings changed:", changes);
          // Refresh the page to show/hide QuickCapture
          if (changes.adhdMode !== undefined) {
            window.location.reload();
          }
        }}
      />

      {/* Quick Capture (only shows when ADHD Mode is enabled) */}
      <QuickCaptureND />

      <div className="rounded-2xl border p-4">
        <h3 className="font-medium mb-2">Integration Examples:</h3>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• Add <code>&lt;NeurodivergentMode /&gt;</code> to your Settings page</li>
          <li>• Add <code>&lt;QuickCaptureND /&gt;</code> above MessageComposer</li>
          <li>• API endpoints: <code>/api/captures</code>, <code>/api/recalls</code>, <code>/api/digests/daily</code></li>
          <li>• Feature flags control visibility and functionality</li>
        </ul>
      </div>
    </main>
  );
}