// components/FeedbackForm.tsx

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function FeedbackForm({ userId }: { userId: string }) {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("confusing");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const { error } = await supabase.from("feedback").insert([
      {
        user_id: userId,
        message,
        category,
        metadata: {
          page: window.location.pathname,
          agent: "Fire", // Or dynamically detected
          timestamp: new Date().toISOString(),
        },
      },
    ]);

    if (error) {
      console.error("Feedback error:", error);
      setStatus("error");
    } else {
      setStatus("sent");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white shadow-md">
      <h2 className="text-lg font-semibold">✨ Share Feedback</h2>

      <label className="block">
        <span className="text-sm text-gray-700">Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border-gray-300 rounded">
          <option value="confusing">😕 Confusing</option>
          <option value="magical">🌟 Magical</option>
          <option value="blocker">
