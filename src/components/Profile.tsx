import React from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          <div className="card-content space-y-4">
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">Name</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Email</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Member since</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}