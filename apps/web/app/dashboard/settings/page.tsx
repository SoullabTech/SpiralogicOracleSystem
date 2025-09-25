import React from 'react';
import { Settings, Bell, Shield, Palette, Volume2 } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Customize your Soullab experience
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Notifications */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Voice Session Alerts
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Get notified about voice interaction quality
                </p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  System Updates
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Updates about new features and improvements
                </p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
        </div>

        {/* Audio Preferences */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Audio Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Voice Response Speed
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg bg-white dark:bg-neutral-700
                               text-neutral-800 dark:text-neutral-200">
                <option>Natural (Recommended)</option>
                <option>Fast</option>
                <option>Slow</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Auto-play Responses
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Automatically play voice responses
                </span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Privacy & Security
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Analytics Collection
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Help improve Soullab with anonymous usage data
                </p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>

            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Download My Data
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Appearance
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Theme Preference
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg bg-white dark:bg-neutral-700
                               text-neutral-800 dark:text-neutral-200">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Reduced Motion
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Minimize animations and transitions
                </p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                         transition-colors duration-200">
          Save Changes
        </button>
      </div>
    </div>
  );
}