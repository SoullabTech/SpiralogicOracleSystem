// 🔥 FRONTEND COMPONENT: Fire Oracle Chat Interface
// File: src/components/FireOracleChat.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function FireOracleChat() {
  const [messages, setMessages] = useState<{ role: "user" | "oracle"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/oracle/fire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      const updatedMessages = [
        ...newMessages,
        { role: "oracle", content: data?.content || "🔥 The flames flicker without words..." },
      ];
      setMessages(updatedMessages);

      const oracleReplies = updatedMessages.filter((msg) => msg.role === "oracle").length;
      if (oracleReplies >= 3) {
        setShowJournalPrompt(true);
      }
    } catch (error) {
      console.error("Oracle request failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "oracle", content: "⚠️ Connection to Fire Oracle failed." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalRedirect = () => {
    const lastOracle = messages.findLast((m) => m.role === "oracle")?.content || "";
    navigate(`/dream-journal?entry=${encodeURIComponent(lastOracle)}`);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-start p-6">
      <h1 className="text-2xl font-bold mb-4 text-orange-700">🔥 Fire Oracle: The Visionary</h1>

      <div className="w-full max-w-xl space-y-4">
        {messages.map((msg, idx) => (
          <Card key={idx} className={msg.role === "oracle" ? "bg-orange-100" : "bg-white"}>
            <CardContent className="p-4">
              <p className={msg.role === "oracle" ? "text-red-700" : "text-gray-800"}>{msg.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 w-full max-w-xl flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Speak your desire to the fire..."
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? "Listening..." : "Send"}
        </Button>
      </div>

      {showJournalPrompt && (
        <div className="mt-8 text-center">
          <p className="text-lg mb-2">Would you like to journal this vision?</p>
          <Button onClick={handleJournalRedirect}>Start Journal Entry</Button>
        </div>
      )}
    </div>
  );
}
