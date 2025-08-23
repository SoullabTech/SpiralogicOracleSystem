import React from 'react';

export function Card({children}:{children:React.ReactNode}) {
  return (
    <div className="rounded-lg border border-edge-700 bg-bg-800 p-6 shadow-soft">
      {children}
    </div>
  );
}