'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ErrorLog {
  id: number;
  message: string;
  stack: string | null;
  context: string | null;
  metadata: any;
  timestamp: string;
  environment: string;
  url: string | null;
  user_agent: string | null;
  severity: string;
  resolved: boolean;
}

export default function ErrorDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchErrors();
    // Refresh every 30 seconds
    const interval = setInterval(fetchErrors, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchErrors() {
    try {
      const res = await fetch('/api/errors/list?limit=100');
      const json = await res.json();
      setErrors(json.errors || []);
    } catch (err) {
      console.error('Failed to load error logs', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleError(id: number) {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedErrors(newExpanded);
  }

  const filteredErrors = errors.filter(err => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !err.resolved;
    if (filter === 'production') return err.environment === 'production';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading error logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">🔍 Error Dashboard</h1>
          <p className="text-purple-200">
            Real-time error tracking for Spiralogic Oracle System
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-900/50 text-purple-200 hover:bg-purple-800/50'
            }`}
          >
            All ({errors.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'unresolved'
                ? 'bg-red-600 text-white'
                : 'bg-red-900/50 text-red-200 hover:bg-red-800/50'
            }`}
          >
            Unresolved ({errors.filter(e => !e.resolved).length})
          </button>
          <button
            onClick={() => setFilter('production')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'production'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-900/50 text-orange-200 hover:bg-orange-800/50'
            }`}
          >
            Production ({errors.filter(e => e.environment === 'production').length})
          </button>
          <button
            onClick={fetchErrors}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error List */}
        <div className="space-y-4">
          {filteredErrors.map((err, index) => (
            <motion.div
              key={err.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg p-4 backdrop-blur-md cursor-pointer transition-all ${
                err.resolved
                  ? 'bg-green-900/20 border border-green-700/30'
                  : 'bg-red-900/20 border border-red-700/30 hover:bg-red-900/30'
              }`}
              onClick={() => toggleError(err.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-2xl ${
                        err.resolved ? '✅' : '❌'
                      }`}
                    />
                    <span className={`font-semibold text-lg ${
                      err.resolved ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {err.message}
                    </span>
                    {err.environment === 'production' && (
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">
                        PROD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {err.context && (
                      <span className="text-purple-300">
                        📍 {err.context}
                      </span>
                    )}
                    <span>
                      🕐 {new Date(err.timestamp).toLocaleString()}
                    </span>
                    {err.url && (
                      <span className="text-blue-300 truncate max-w-xs">
                        🔗 {err.url}
                      </span>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedErrors.has(err.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-3"
                    >
                      {err.stack && (
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Stack Trace:</div>
                          <pre className="text-xs bg-black/50 p-3 rounded overflow-x-auto text-gray-300">
                            {err.stack}
                          </pre>
                        </div>
                      )}

                      {err.metadata && (
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Metadata:</div>
                          <pre className="text-xs bg-black/50 p-3 rounded overflow-x-auto text-blue-300">
                            {JSON.stringify(err.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {err.user_agent && (
                        <div className="text-xs text-gray-500">
                          User Agent: {err.user_agent}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <button
                  className={`ml-4 transform transition-transform ${
                    expandedErrors.has(err.id) ? 'rotate-180' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleError(err.id);
                  }}
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}

          {filteredErrors.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">✨</div>
              <p className="text-xl text-green-300">No errors found!</p>
              <p className="text-gray-400 mt-2">
                {filter === 'all'
                  ? 'Your system is running smoothly.'
                  : `No ${filter} errors to display.`}
              </p>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-4 gap-4"
          >
            <div className="bg-purple-900/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-300">
                {errors.length}
              </div>
              <div className="text-sm text-purple-200">Total Errors</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-300">
                {errors.filter(e => !e.resolved).length}
              </div>
              <div className="text-sm text-red-200">Unresolved</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-300">
                {errors.filter(e => e.environment === 'production').length}
              </div>
              <div className="text-sm text-orange-200">Production</div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-300">
                {errors.filter(e => e.resolved).length}
              </div>
              <div className="text-sm text-green-200">Resolved</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}