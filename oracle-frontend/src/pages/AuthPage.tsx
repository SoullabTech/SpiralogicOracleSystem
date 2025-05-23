import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import React from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-deep">
        <h1 className="text-2xl font-display text-brand-dark mb-4 text-center">
          🔐 Sign in to Spiralogic Oracle
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email to begin your Oracle journey.
        </p>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="default"
          providers={[]} // ← You can add ['google'] or ['github'] here
          redirectTo={`${window.location.origin}/auth`}
        />
      </div>
    </div>
  );
};

export default AuthPage;
