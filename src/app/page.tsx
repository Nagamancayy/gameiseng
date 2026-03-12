"use client";

import { useState } from "react";
import { ScrollText, FlaskConical, Building2, ChefHat, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import StepByStepMode from "@/components/modes/StepByStepMode";
import CustomMode from "@/components/modes/CustomMode";
import RestaurantMode from "@/components/modes/RestaurantMode";

export type GameState = "menu" | "step-by-step" | "custom" | "restaurant";

const menuButtons = [
  {
    id: "step-by-step" as GameState,
    icon: ScrollText,
    label: "COOKING LESSONS",
    sub: "Follow recipes step by step",
    color: "#4ecdc4",
    glow: "rgba(78,205,196,0.4)",
    bg: "linear-gradient(135deg, #134e4a 0%, #0a2e2b 100%)",
  },
  {
    id: "custom" as GameState,
    icon: FlaskConical,
    label: "SANDBOX KITCHEN",
    sub: "Mix ingredients & discover dishes",
    color: "#ffd93d",
    glow: "rgba(255,217,61,0.4)",
    bg: "linear-gradient(135deg, #422006 0%, #1c0a00 100%)",
  },
  {
    id: "restaurant" as GameState,
    icon: Building2,
    label: "RESTAURANT CAREER",
    sub: "Serve customers & earn big!",
    color: "#ff6b6b",
    glow: "rgba(255,107,107,0.4)",
    bg: "linear-gradient(135deg, #450a0a 0%, #1c0505 100%)",
  },
];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const goMenu = () => setGameState("menu");

  return (
    <main className="relative" style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-dark)" }}>

      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)",
          top: "-10%", left: "-10%",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(78,205,196,0.10) 0%, transparent 70%)",
          bottom: "-5%", right: "5%",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,217,61,0.08) 0%, transparent 70%)",
          top: "40%", left: "40%",
        }} />
      </div>

      <AnimatePresence mode="wait">

        {/* ─────────── MAIN MENU ─────────── */}
        {gameState === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full gap-8 relative"
          >
            {/* Title */}
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <motion.div animate={{ rotate: [0, 20, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <ChefHat size={48} color="#ffd93d" />
                </motion.div>
                <h1 className="title-font text-gradient" style={{ fontSize: "4.5rem", letterSpacing: "2px" }}>
                  CLICK &amp; COOK
                </h1>
                <motion.div animate={{ rotate: [0, -20, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
                  <Sparkles size={40} color="#ff6b6b" />
                </motion.div>
              </div>
              <p className="text-gradient-teal title-font" style={{ fontSize: "1.5rem", letterSpacing: "6px" }}>
                NANO BANANA EDITION
              </p>
              <div className="flex justify-center gap-1 mt-2">
                {[1,2,3,4,5].map(i => (
                  <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }} style={{ fontSize: "1rem" }}>⭐</motion.span>
                ))}
              </div>
            </motion.div>

            {/* Mode buttons */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring" }}
              className="flex flex-col gap-4 w-full"
              style={{ maxWidth: 440 }}
            >
              {menuButtons.map((btn, idx) => (
                <motion.button
                  key={btn.id}
                  onClick={() => setGameState(btn.id)}
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 120 }}
                  whileHover={{ scale: 1.04, x: 8 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative overflow-hidden flex items-center gap-5 px-7 py-5 rounded-2xl text-left"
                  style={{
                    background: btn.bg,
                    border: `2px solid ${btn.color}40`,
                    boxShadow: `0 0 0 0 ${btn.glow}`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${btn.glow}`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`; }}
                >
                  <div className="rounded-xl p-3 flex-shrink-0" style={{ background: `${btn.color}25` }}>
                    <btn.icon size={28} color={btn.color} />
                  </div>
                  <div>
                    <div className="font-black text-xl tracking-wide" style={{ color: btn.color }}>
                      {btn.label}
                    </div>
                    <div className="text-sm text-gray-400 font-medium mt-0.5">{btn.sub}</div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
                  }} />
                </motion.button>
              ))}
            </motion.div>

            {/* Floating emoji decoration */}
            {["🍕", "🍔", "🥗", "🍝", "⭐"].map((emoji, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  fontSize: `${1.2 + (i % 3) * 0.4}rem`,
                  left: `${8 + i * 20}%`,
                  top: `${15 + (i % 3) * 25}%`,
                  opacity: 0.15,
                  pointerEvents: "none",
                }}
                animate={{ y: [0, -18, 0], rotate: [0, 10, -5, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─────────── GAME MODES ─────────── */}
        {gameState === "step-by-step" && (
          <motion.div key="step" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="h-full w-full">
            <StepByStepMode onBack={goMenu} />
          </motion.div>
        )}
        {gameState === "custom" && (
          <motion.div key="custom" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="h-full w-full">
            <CustomMode onBack={goMenu} />
          </motion.div>
        )}
        {gameState === "restaurant" && (
          <motion.div key="restaurant" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="h-full w-full">
            <RestaurantMode onBack={goMenu} />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
