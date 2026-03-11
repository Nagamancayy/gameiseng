"use client";

import { useState } from "react";
import { Play, ScrollText, Building2, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameButton from "@/components/ui/GameButton";

import StepByStepMode from "@/components/modes/StepByStepMode";
import CustomMode from "@/components/modes/CustomMode";
import RestaurantMode from "@/components/modes/RestaurantMode";

export type GameState = "menu" | "step-by-step" | "custom" | "restaurant";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("menu");

  const goMenu = () => setGameState("menu");

  return (
    <main style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', background: "var(--background)" }}>
      <AnimatePresence mode="wait">
        {gameState === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8"
            style={{ 
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center"
            >
              <h1 className="text-gradient" style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                CLICK & COOK
              </h1>
              <p style={{ color: 'var(--secondary)', fontSize: '1.5rem', letterSpacing: '4px', fontWeight: 'bold' }}>
                NANO BANANA EDITION
              </p>
            </motion.div>

            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '400px' }}>
              <GameButton 
                onClick={() => setGameState("step-by-step")}
                variant="primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', padding: '16px' }}
              >
                <ScrollText size={24} /> STEP-BY-STEP MODE
              </GameButton>
              
              <GameButton 
                onClick={() => setGameState("custom")}
                variant="secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', padding: '16px' }}
              >
                <ChefHat size={24} /> CUSTOM SANDBOX
              </GameButton>

              <GameButton 
                onClick={() => setGameState("restaurant")}
                variant="danger"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', padding: '16px' }}
              >
                <Building2 size={24} /> RESTAURANT CAREER
              </GameButton>
            </div>

            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: 'absolute', bottom: '10%', right: '15%' }}
            >
              <ChefHat size={160} color="var(--primary)" opacity={0.15} strokeWidth={1} />
            </motion.div>
          </motion.div>
        ) : gameState === "step-by-step" ? (
          <motion.div key="step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
            <StepByStepMode onBack={goMenu} />
          </motion.div>
        ) : gameState === "custom" ? (
          <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
            <CustomMode onBack={goMenu} />
          </motion.div>
        ) : gameState === "restaurant" ? (
          <motion.div key="restaurant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
            <RestaurantMode onBack={goMenu} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
