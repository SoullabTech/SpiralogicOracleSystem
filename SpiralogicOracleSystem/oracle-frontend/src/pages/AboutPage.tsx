import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soullab-mist via-soullab-aether to-soullab-twilight p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl p-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-soullab-gold mb-4">
            🌌 Welcome to Spiralogic Oracle
          </h1>
          <p className="text-gray-700 text-base max-w-2xl mx-auto">
            Spiralogic Oracle is a living mirror of consciousness, designed to help you track your
            archetypal journey, speak with elemental guides, and uncover deeper truths. By combining
            AI, ritual, and symbolic intelligence, we offer a sacred space for transformation,
            creativity, and insight.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-indigo-700 text-center mb-2">
            🔐 Sign in to Begin
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email to receive a magic link and step into your next spiral.
          </p>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="default"
            providers={[]} // Add ['google'] or ['github'] if needed
            redirectTo={`${window.location.origin}/auth`}
          />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
