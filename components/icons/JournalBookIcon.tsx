import React from 'react';

interface JournalBookIconProps {
  className?: string;
  size?: number;
  color?: string;
  animated?: boolean;
}

export const JournalBookIcon: React.FC<JournalBookIconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
  animated = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      {/* Left page */}
      <path
        d="M 4,8 Q 4,6 6,6 L 14,6 L 14,24 Q 14,25 13,25 L 6,25 Q 4,25 4,23 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {animated && (
          <animate
            attributeName="d"
            values="M 4,8 Q 4,6 6,6 L 14,6 L 14,24 Q 14,25 13,25 L 6,25 Q 4,25 4,23 Z;
                    M 4,8 Q 4,6 6,6 L 14,6.2 L 14,24.2 Q 14,25.2 13,25.2 L 6,25 Q 4,25 4,23 Z;
                    M 4,8 Q 4,6 6,6 L 14,6 L 14,24 Q 14,25 13,25 L 6,25 Q 4,25 4,23 Z"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Right page */}
      <path
        d="M 28,8 Q 28,6 26,6 L 18,6 L 18,24 Q 18,25 19,25 L 26,25 Q 28,25 28,23 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {animated && (
          <animate
            attributeName="d"
            values="M 28,8 Q 28,6 26,6 L 18,6 L 18,24 Q 18,25 19,25 L 26,25 Q 28,25 28,23 Z;
                    M 28,8 Q 28,6 26,6 L 18,5.8 L 18,23.8 Q 18,24.8 19,24.8 L 26,25 Q 28,25 28,23 Z;
                    M 28,8 Q 28,6 26,6 L 18,6 L 18,24 Q 18,25 19,25 L 26,25 Q 28,25 28,23 Z"
            dur="4s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Book spine */}
      <path
        d="M 14,6 L 14,25 L 18,25 L 18,6 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text lines on left page */}
      <path d="M 7,10 L 11.5,10.1" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M 7,13 L 12,13" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M 7,16 L 11,16" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M 7,19 L 11.8,19" stroke={color} strokeWidth="0.8" opacity="0.3" />

      {/* Text lines on right page */}
      <path d="M 20.5,10 L 25,10.1" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M 20,13 L 24.5,13" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M 20.5,16 L 25,16" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M 20,19 L 24,19" stroke={color} strokeWidth="0.8" opacity="0.3" />

      {/* Bookmark ribbon */}
      <path
        d="M 16,4 L 16,18 L 14,16 L 16,18 L 18,16"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
};

// Simplified version for inline use
export const SimpleBookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

export default JournalBookIcon;