// components/JournalForm.tsx
import { useDreamOracle } from '@/hooks/useDreamOracle'
import { useState } from 'react'
import { toast } from 'sonner'

const elements = ['Fire', 'Water', 'Earth', 'Air', 'Aether']

export default function JournalForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [element, setElement] = useState('Fire')
  const [loading, setLoading] = useState(false)
  const { getInsight } = useDreamOracle()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    toast.loading('Calling your Oracle...')

    try {
      const result = await getInsight({ title, content, element })
      toast.success('Oracle has spoken!')
      console.log(result)
      // You can pass result to parent or use context
    } catch (err) {
      toast.error('Failed to reach Oracle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/10 rounded-2xl shadow-lg max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Dream Journal Entry</h2>

      <input
        className="w-full p-2 rounded-lg border border-gray-300"
        type="text"
        placeholder="Dream Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full p-2 rounded-lg border border-gray-300"
        placeholder="Describe your dream or insight..."
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <select
        className="w-full p-2 rounded-lg border border-gray-300"
        value={element}
        onChange={(e) => setElement(e.target.value)}
      >
        {elements.map((el) => (
          <option key={el} value={el}>
            {el}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Submit to Oracle
      </button>
    </form>
  )
}
