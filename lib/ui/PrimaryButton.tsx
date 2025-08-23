import React from 'react';

export function PrimaryButton({children,...props}:React.ButtonHTMLAttributes<HTMLButtonElement>){
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2
                 text-gold-400 border-gold-400 hover:text-gold-500 hover:border-gold-500
                 transition-colors duration-200 ease-out-soft">
      {children}
    </button>
  );
}