// File: app/signup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white/10 rounded-lg shadow-lg">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded border"
            required
          />
        </div>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-green-600 rounded text-white"
        >
          Create Account
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <a href="/signin" className="underline">
          Sign In
        </a>
      </p>
    </div>
  );
}
