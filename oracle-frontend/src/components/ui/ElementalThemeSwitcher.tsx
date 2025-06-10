// --- File: frontend/src/components/ui/ElementalThemeSwitcher.tsx ---

"use client";

import React, { useEffect, useState } from "react";
import { Sun, Droplet, Leaf, Wind, Sparkles } from "lucide-react";

const themes = ["fire", "water", "earth", "air", "aether"] as const;
type Theme = typeof themes[number];

const themeIcons: Record<Theme, JSX.Element> = {
  fire: <Sun className="text-red-600" />,
  water: <Droplet className="text-blue-500" />,
  earth: <Leaf className="text-green-600" />,
  air: <Wind className="text-yellow-500" />,
  aether: <Sparkles className="text-purple-600" />,
};

const themeStyles: Record<Theme, string> = {
  fire: "bg-red-50 hover:bg-red-100 text-red-700 border-red-300",
  water: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300",
  earth: "bg-green-50 hover:bg-green-100 text-green-700 border-green-300",
  air: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300",
  aether: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300",
};

const ElementalThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("fire");

  useEffect(() => {
    const saved = localStorage.getItem("elemental-theme") as Theme;
    if (saved && themes.includes(saved)) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("elemental-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const nextTheme = () => {
    const index = themes.indexOf(theme);
    const next = themes[(index + 1) % themes.length];
    setTheme(next);
  };

  return (
    <button
      onClick={nextTheme}
      className={`flex items-center gap-2 px-2 py-1 border rounded shadow text-sm transition-all duration-200 ${themeStyles[theme]}`}
    >
      {themeIcons[theme]}
      <span className="capitalize">{theme}</span>
    </button>
  );
};

export default ElementalThemeSwitcher;
