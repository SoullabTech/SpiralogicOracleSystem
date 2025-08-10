import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MemoryThread {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  tags: string[];
  connections: string[]; // IDs of related threads
  significance: "high" | "medium" | "low";
}

interface MemoryThreadsProps {
  userId: string;
}

const MemoryThreads: React.FC<MemoryThreadsProps> = ({ userId }) => {
  const [threads, setThreads] = useState<MemoryThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MemoryThread | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "web">("list");

  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    significance: "medium" as "high" | "medium" | "low",
  });

  useEffect(() => {
    fetchThreads();
  }, [userId]);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`/api/memory/threads?userId=${userId}`);
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error("Failed to fetch memory threads:", error);
    }
  };

  const createThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) return;

    try {
      const response = await fetch("/api/memory/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newThread,
          userId,
          timestamp: new Date(),
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setThreads((prev) => [created, ...prev]);
        setNewThread({
          title: "",
          content: "",
          tags: [],
          significance: "medium",
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "high":
        return "#dc2626";
      case "medium":
        return "#d4af37";
      case "low":
        return "#64748b";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-light text-amber-100 mb-2">
              Memory Threads
            </h1>
            <p className="text-slate-300">
              Weave insights into coherent understanding
            </p>
          </div>

          <div className="flex space-x-4">
            <div className="flex border border-slate-600">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 text-sm ${
                  viewMode === "list"
                    ? "bg-amber-600 text-slate-900"
                    : "bg-transparent text-slate-300 hover:bg-slate-700"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("web")}
                className={`px-4 py-2 text-sm ${
                  viewMode === "web"
                    ? "bg-amber-600 text-slate-900"
                    : "bg-transparent text-slate-300 hover:bg-slate-700"
                }`}
              >
                Web
              </button>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-amber-600 text-slate-900 font-medium hover:bg-amber-500 transition-colors"
            >
              New Thread
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search threads, tags, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {filteredThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 bg-slate-800 border border-slate-600 cursor-pointer hover:border-amber-500 transition-colors ${
                    selectedThread?.id === thread.id
                      ? "border-amber-500 bg-slate-750"
                      : ""
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg text-amber-100 font-medium">
                      {thread.title}
                    </h3>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getSignificanceColor(
                          thread.significance,
                        ),
                      }}
                    />
                  </div>

                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                    {thread.content}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {thread.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {thread.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs">
                          +{thread.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <span className="text-slate-500 text-xs">
                      {new Date(thread.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Thread Detail / Create Form */}
          <div className="space-y-6">
            {isCreating ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-slate-800 border border-slate-600"
              >
                <h3 className="text-xl text-amber-100 font-medium mb-4">
                  New Memory Thread
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Thread title..."
                    value={newThread.title}
                    onChange={(e) =>
                      setNewThread((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />

                  <textarea
                    placeholder="Content, insights, connections..."
                    value={newThread.content}
                    onChange={(e) =>
                      setNewThread((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                    rows={6}
                  />

                  <div>
                    <label className="block text-slate-300 text-sm mb-2">
                      Significance
                    </label>
                    <select
                      value={newThread.significance}
                      onChange={(e) =>
                        setNewThread((prev) => ({
                          ...prev,
                          significance: e.target.value as
                            | "high"
                            | "medium"
                            | "low",
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-amber-100 focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={createThread}
                      className="flex-1 px-4 py-2 bg-amber-600 text-slate-900 font-medium hover:bg-amber-500 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : selectedThread ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-slate-800 border border-slate-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl text-amber-100 font-medium">
                    {selectedThread.title}
                  </h3>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: getSignificanceColor(
                        selectedThread.significance,
                      ),
                    }}
                  />
                </div>

                <p className="text-slate-300 mb-4 leading-relaxed">
                  {selectedThread.content}
                </p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-slate-400 text-sm font-medium mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedThread.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-400 text-sm font-medium mb-2">
                      Created
                    </h4>
                    <span className="text-slate-300 text-sm">
                      {new Date(selectedThread.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {selectedThread.connections.length > 0 && (
                    <div>
                      <h4 className="text-slate-400 text-sm font-medium mb-2">
                        Connected Threads
                      </h4>
                      <div className="text-amber-400 text-sm">
                        {selectedThread.connections.length} connections
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="p-6 bg-slate-800 border border-slate-600 text-center text-slate-400">
                Select a thread to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryThreads;
