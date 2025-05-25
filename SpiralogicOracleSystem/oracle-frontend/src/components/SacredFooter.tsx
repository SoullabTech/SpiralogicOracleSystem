// src/components/SacredFooter.tsx

import React from 'react';

export const SacredFooter: React.FC = () => (
  <footer className="p-4 text-center text-sm text-gray-300">
    © 2025 Spiralogic Oracle Portal. All rights reserved.
  </footer>
);

// Add this default export so Layout’s `import SacredFooter from …` works:
export default SacredFooter;
