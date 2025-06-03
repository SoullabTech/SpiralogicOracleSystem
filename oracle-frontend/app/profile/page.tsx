// File: app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      if (!data.session) {
        router.push("/signin");
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession);
      if (!authSession) {
        router.push("/signin");
      }
    });
  }, []);

  if (loading) return <p className="mt-20 text-center">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white/10 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl mb-4">Your Profile</h1>
      <p className="mb-2">Email: {session.user.email}</p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/signin");
        }}
        className="mt-4 py-2 px-4 bg-red-600 rounded text-white"
      >
        Sign Out
      </button>
    </div>
  );
}
