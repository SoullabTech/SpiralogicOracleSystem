// frontend/app/dashboard/insights/page.tsx

'use client'

import { useEffect, useState } from 'react'

export default function InsightsPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch('/api/insights')  // You'll need to add this route
      const data = await res.json()
      setLogs(data)
    }

    fetchLogs()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📖 Prompt Insight Log</h1>
      <ul className="space-y-4">
        {logs.map((log, idx) => (
          <li key={idx} className="p-4 border rounded-lg bg-white shadow">
            <p><strong>User:</strong> {log.user_id}</p>
            <p><strong>Phase:</strong> {log.detected_phase}</p>
            <p><strong>Prompts:</strong> {log.suggested_prompts.join(', ')}</p>
            <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
