// components/ElementProgress.tsx
'use client';

export default function ElementProgress({ elementsTouched }: { elementsTouched: Set<string> }) {
  const all = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];

  return (
    <div className="flex gap-3 justify-center mt-6 text-sm">
      {all.map((el) => (
        <div
          key={el}
          className={`px-3 py-1 rounded-full border text-xs font-medium ${
            elementsTouched.has(el)
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white border-purple-300 text-purple-500'
          }`}
        >
          {el}
        </div>
      ))}
    </div>
  );
}
