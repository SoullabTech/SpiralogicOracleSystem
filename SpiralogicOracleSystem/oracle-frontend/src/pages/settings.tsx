export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100 p-8">
      <div className="max-w-3xl w-full bg-white bg-opacity-90 rounded-3xl shadow-xl p-10 flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">⚙️ Spiral Settings</h1>

        <div className="flex flex-col space-y-4 w-full">
          <label className="flex justify-between items-center">
            <span className="text-md">Daily Breath Reminder 🔔</span>
            <input type="checkbox" className="toggle toggle-indigo-500" />
          </label>

          <label className="flex justify-between items-center">
            <span className="text-md">Dream Journal Notifications 🌙</span>
            <input type="checkbox" className="toggle toggle-purple-500" />
          </label>

          <label className="flex justify-between items-center">
            <span className="text-md">Enable Breath Sounds 🌬️🎵</span>
            <input type="checkbox" className="toggle toggle-blue-400" />
          </label>

          <label className="flex justify-between items-center">
            <span className="text-md">Sacred Night Theme 🌌</span>
            <input type="checkbox" className="toggle toggle-indigo-900" />
          </label>
        </div>
      </div>
    </div>
  );
}
