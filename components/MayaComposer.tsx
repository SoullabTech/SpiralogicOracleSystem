"use client";
import { useState } from "react";
import MayaVoiceButton from "./MayaVoiceButton";

export default function MayaComposer() {
  const [text, setText] = useState("Hello from Maya");
  return (
    <div className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full max-w-xl rounded-xl border p-2"
        placeholder="Type what Maya should say…"
      />
      <MayaVoiceButton text={text} />
    </div>
  );
}