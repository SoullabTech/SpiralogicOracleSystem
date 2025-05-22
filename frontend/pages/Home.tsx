import { useState } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';

export function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="text-center">
      <div className="flex justify-center gap-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="h-24 hover:drop-shadow-lg transition-all" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-24 hover:drop-shadow-lg transition-all" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold mt-8">Vite + React</h1>
      <div className="mt-8">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          count is {count}
        </button>
        <p className="mt-4">
          Edit <code className="bg-gray-100 px-2 py-1 rounded">src/pages/Home.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  );
}