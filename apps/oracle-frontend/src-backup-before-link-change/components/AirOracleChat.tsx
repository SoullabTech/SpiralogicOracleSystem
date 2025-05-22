import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AirOracleChat() {
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
      const res = await fetch("/api/oracle/air", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      const updatedMessages = [
        ...newMessages,
        { role: "oracle", content: data?.content || "🌀 The air is silent..." },
      ];
      setMessages(updatedMessages);

      if (updatedMessages.filter((msg) => msg.role === "oracle").length >= 3) {
        setShowJournalPrompt(true);
      }
    } catch (err) {
      console.error("Air Oracle error:", err);
      setMessages((prev) => [...prev, { role: "oracle", content: "⚠️ There was a communication error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalRedirect = () => {
    const lastOracle = messages.findLast((m) => m.role === "oracle")?.content || "";
    navigate(`/dream-journal?entry=${encodeURIComponent(lastOracle)}`);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-start p-6">
      <h1 className="text-2xl font-bold mb-4 text-sky-700">🌬 Air Oracle: The Messenger</h1>

      <div className="w-full max-w-xl space-y-4">
        {messages.map((msg, idx) => (
          <Card key={idx} className={msg.role === "oracle" ? "bg-sky-100" : "bg-white"}>
            <CardContent className="p-4">
              <p className={msg.role === "oracle" ? "text-sky-800" : "text-gray-800"}>{msg.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 w-full max-w-xl flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="What idea or insight seeks expression today?"
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? "Listening..." : "Send"}
        </Button>
      </div>

      {showJournalPrompt && (
        <div className="mt-8 text-center">
          <p className="text-lg mb-2">Would you like to journal this clarity?</p>
          <Button onClick={handleJournalRedirect}>Capture Insight</Button>
        </div>
      )}
    </div>
  );
}
