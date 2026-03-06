"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Book, Settings, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import RestaurantView from "@/components/RestaurantView";

export default function Home() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "cooking">("menu");

  return (
    <main style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
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
              <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                CHEF DE CUISINE
              </h1>
              <p style={{ color: 'var(--secondary)', fontSize: '1.2rem', letterSpacing: '2px' }}>
                THE ULTIMATE COOKING ADVENTURE
              </p>
            </motion.div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
              <button 
                onClick={() => setGameState("playing")}
                className="btn-premium" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem' }}
              >
                <Play size={20} fill="currentColor" /> START CAREER
              </button>
              
              <button className="btn-premium" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Book size={20} /> RECIPE BOOK
              </button>

              <button className="btn-premium" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Settings size={20} /> SETTINGS
              </button>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: 'absolute', bottom: '5%', right: '10%' }}
            >
              <ChefHat size={120} color="var(--primary)" opacity={0.2} strokeWidth={1} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <RestaurantView />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
