import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-sm",
    md: "w-16 h-16 text-lg", 
    lg: "w-24 h-24 text-2xl"
  };

  const textSizeMap = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Circle */}
      <div className={`bg-blue-600 rounded-full flex items-center justify-center ${sizeMap[size]}`}>
        <span className="text-white font-bold">SL</span>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className={`mt-2 font-light text-gray-900 ${textSizeMap[size]} tracking-wide`}>
          Soul<span className="font-normal">lab</span><span className="text-blue-600 text-sm">®</span>
        </div>
      )}
    </div>
  );
}