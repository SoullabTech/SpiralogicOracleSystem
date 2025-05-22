import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AetherOracleChat() {
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
      const res = await fetch("/api/oracle/aether", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      const updatedMessages = [
        ...newMessages,
        { role: "oracle", content: data?.content || "🌀 The Sage remains silent for now..." },
      ];
      setMessages(updatedMessages);

      if (updatedMessages.filter((msg) => msg.role === "oracle").length >= 3) {
        setShowJournalPrompt(true);
      }
    } catch (err) {
      console.error("Aether Oracle error:", err);
      setMessages((prev) => [...prev, { role: "oracle", content: "⚠️ Connection to Aether failed." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalRedirect = () => {
    const lastOracle = messages.findLast((m) => m.role === "oracle")?.content || "";
    navigate(`/dream-journal?entry=${encodeURIComponent(lastOracle)}`);
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-start p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">✨ Aether Oracle: The Sage</h1>

      <div className="w-full max-w-xl space-y-4">
        {messages.map((msg, idx) => (
          <Card key={idx} className={msg.role === "oracle" ? "bg-purple-100" : "bg-white"}>
            <CardContent className="p-4">
              <p className={msg.role === "oracle" ? "text-purple-800" : "text-gray-800"}>{msg.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 w-full max-w-xl flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="What mystery or closure are you exploring?"
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? "Listening..." : "Send"}
        </Button>
      </div>

      {showJournalPrompt && (
        <div className="mt-8 text-center">
          <p className="text-lg mb-2">Would you like to journal this reflection?</p>
          <Button onClick={handleJournalRedirect}>Complete the Circle</Button>
        </div>
      )}
    </div>
  );
}
