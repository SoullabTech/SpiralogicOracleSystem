import React, { ReactNode, useState } from "react";
import clsx from "clsx";

type Edge = "top" | "bottom" | "left" | "right";

interface EdgePanelProps {
  edge: Edge;
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function EdgePanel({
  edge,
  title,
  children,
  isOpen = false,
  onToggle
}: EdgePanelProps) {
  const [open, setOpen] = useState(isOpen);

  const handleToggle = (newState: boolean) => {
    setOpen(newState);
    onToggle?.(newState);
  };

  // Panel positioning based on edge
  const positions: Record<Edge, string> = {
    top: "top-0 left-0 right-0 h-[70vh] -translate-y-full",
    bottom: "bottom-0 left-0 right-0 h-[70vh] translate-y-full",
    left: "top-0 left-0 bottom-0 w-[70vw] md:w-[400px] -translate-x-full",
    right: "top-0 right-0 bottom-0 w-[70vw] md:w-[400px] translate-x-full",
  };

  // Active (open) positions
  const activePositions: Record<Edge, string> = {
    top: "translate-y-0",
    bottom: "translate-y-0",
    left: "translate-x-0",
    right: "translate-x-0",
  };

  // Handle button positioning and styling
  const handleClasses: Record<Edge, string> = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-24 h-8 rounded-b-xl",
    bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-full w-24 h-8 rounded-t-xl",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-full h-24 w-8 rounded-r-xl",
    right: "left-0 top-1/2 -translate-y-1/2 -translate-x-full h-24 w-8 rounded-l-xl",
  };

  // Icon rotation based on edge and state
  const iconRotation: Record<Edge, string> = {
    top: open ? "rotate-180" : "rotate-0",
    bottom: open ? "rotate-0" : "rotate-180",
    left: open ? "rotate-90" : "-rotate-90",
    right: open ? "-rotate-90" : "rotate-90",
  };

  return (
    <>
      {/* Panel Container */}
      <div
        className={clsx(
          "fixed bg-white dark:bg-gray-900 shadow-2xl z-40",
          "transition-transform duration-500 ease-in-out",
          "flex flex-col border border-gray-200 dark:border-gray-700",
          edge === "top" || edge === "bottom" ? "rounded-b-2xl" : "rounded-2xl",
          positions[edge],
          open && activePositions[edge]
        )}
      >
        {/* Panel Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={() => handleToggle(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-850">
          {children}
        </div>

        {/* Panel Footer */}
        <footer className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850">
          <button
            onClick={() => handleToggle(false)}
            className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
          >
            Return to Oracle
          </button>
        </footer>

        {/* Handle Button (attached to panel) */}
        <button
          onClick={() => handleToggle(!open)}
          className={clsx(
            "absolute flex items-center justify-center",
            "bg-gradient-to-br from-amber-500 to-indigo-600",
            "hover:from-amber-600 hover:to-indigo-700",
            "text-white shadow-lg transition-all duration-300",
            "backdrop-blur-sm bg-opacity-90",
            handleClasses[edge]
          )}
          aria-label={`${open ? "Close" : "Open"} ${title}`}
        >
          <svg
            className={clsx(
              "w-4 h-4 transition-transform duration-300",
              iconRotation[edge]
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Backdrop overlay when panel is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 transition-opacity duration-300"
          onClick={() => handleToggle(false)}
        />
      )}
    </>
  );
}