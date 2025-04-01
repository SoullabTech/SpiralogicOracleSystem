import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
          <div className="card-content space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Manage notification preferences
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary">Configure</button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Privacy</p>
                  <p className="text-sm text-muted-foreground">
                    Control your privacy settings
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary">Manage</button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Appearance</p>
                  <p className="text-sm text-muted-foreground">
                    Customize the look and feel
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary">Customize</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}