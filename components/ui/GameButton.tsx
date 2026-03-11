"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GameButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function GameButton({ 
  onClick, 
  children, 
  variant = "primary", 
  disabled = false,
  className = "",
  style 
}: GameButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary": return "var(--primary)";
      case "secondary": return "var(--secondary)";
      case "danger": return "#ef4444";
      default: return "var(--primary)";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`btn-premium ${className}`}
      style={{
        background: getBackgroundColor(),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      {children}
    </motion.button>
  );
}
