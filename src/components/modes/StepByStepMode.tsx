"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, ChefHat, Star, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { INGREDIENTS, DISHES, STEP_BY_STEP_LEVELS } from "@/lib/gameData";

interface Props { onBack: () => void; }

type StepStatus = "idle" | "correct" | "wrong" | "done";

export default function StepByStepMode({ onBack }: Props) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [step, setStep]         = useState(0);
  const [status, setStatus]     = useState<StepStatus>("idle");
  const [stars, setStars]       = useState(3);
  const [msg, setMsg]           = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  const currentLevel = STEP_BY_STEP_LEVELS[levelIdx];
  const dish         = DISHES[currentLevel.targetDish];
  const recipe       = dish.recipe;
  const expectedId   = recipe[step];
  const allIngredients = recipe.map(id => INGREDIENTS[id]);

  const handleClick = useCallback((ingrId: string) => {
    if (status !== "idle") return;

    if (ingrId === expectedId) {
      setStatus("correct");
      setMsg("✅ Perfect! Keep going!");
      setTimeout(() => {
        setStatus("idle");
        setMsg("");
        if (step + 1 >= recipe.length) {
          setShowComplete(true);
          setCompletedLevels(prev => new Set([...prev, levelIdx]));
        } else {
          setStep(s => s + 1);
        }
      }, 700);
    } else {
      setStatus("wrong");
      setStars(s => Math.max(0, s - 1));
      setMsg(`❌ Oops! You need ${INGREDIENTS[expectedId].name} next!`);
      setTimeout(() => { setStatus("idle"); setMsg(""); }, 1200);
    }
  }, [status, expectedId, step, recipe, levelIdx]);

  const reset = () => {
    setStep(0); setStatus("idle"); setStars(3); setMsg(""); setShowComplete(false);
  };

  const nextLevel = () => {
    if (levelIdx + 1 < STEP_BY_STEP_LEVELS.length) {
      setLevelIdx(l => l + 1); reset();
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0f2a1e 100%)" }}>
      {/* BG art */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image src="/assets/kitchen_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-4">
        <button
          onClick={onBack}
          className="hud-badge hover:scale-105 transition-transform"
          style={{ gap: 8, color: "#4ecdc4", borderColor: "rgba(78,205,196,0.3)" }}
        >
          <ArrowLeft size={18} /> Menu
        </button>

        <div className="flex items-center gap-3">
          {/* Stars */}
          <div className="hud-badge gap-1">
            {[1,2,3].map(i => (
              <motion.span key={i} className={`star ${i <= stars ? "active" : ""}`}
                animate={i <= stars ? { scale: [1,1.4,1] } : {}}
              >⭐</motion.span>
            ))}
          </div>
          {/* Level badge */}
          <div className="hud-badge" style={{ color: "#ffd93d" }}>
            <Trophy size={18} color="#ffd93d" /> LV {levelIdx + 1}/{STEP_BY_STEP_LEVELS.length}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col flex-1 items-center gap-6 px-6 pb-6">

        {/* Chef speech bubble */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="glass flex gap-4 items-center p-5 w-full max-w-2xl"
        >
          <div className="w-20 h-20 relative flex-shrink-0 rounded-full overflow-hidden bg-white border-3 border-yellow-300 shadow-lg"
            style={{ border: "3px solid #ffd93d" }}>
            <Image src="/assets/chef_char.png" alt="Chef" fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
          </div>
          <div>
            <p className="font-black text-lg" style={{ color: "#ffd93d" }}>Chef Nana says:</p>
            <p className="text-white font-semibold text-base mt-1">{currentLevel.instructions}</p>
            <p className="text-gray-400 text-sm mt-1 italic">💡 {currentLevel.chefTip}</p>
          </div>
        </motion.div>

        {/* Recipe progress tracker */}
        <div className="flex items-center justify-center gap-3">
          {recipe.map((ingrId, idx) => {
            const ingr = INGREDIENTS[ingrId];
            const done = idx < step || showComplete;
            const active = idx === step && !showComplete;
            return (
              <div key={idx} className="flex items-center gap-3">
                <motion.div
                  animate={active ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-lg"
                    style={{
                      border: `3px solid ${done ? "#6bcb77" : active ? "#ffd93d" : "rgba(255,255,255,0.1)"}`,
                      opacity: done || active ? 1 : 0.4,
                    }}>
                    <Image src={ingr.image} alt={ingr.name} fill className="object-contain p-1" style={{ mixBlendMode: "multiply" }} />
                    {done && (
                      <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                        <span style={{ fontSize: "1.5rem" }}>✅</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold" style={{ color: done ? "#6bcb77" : active ? "#ffd93d" : "#6b7280" }}>
                    {ingr.name}
                  </span>
                </motion.div>
                {idx < recipe.length - 1 && (
                  <span style={{ color: "#374151", fontSize: "1.5rem", fontWeight: "bold" }}>→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-6 py-3 rounded-2xl font-bold text-lg"
              style={{
                background: status === "correct" ? "rgba(107,203,119,0.2)" : "rgba(255,107,107,0.2)",
                border: `2px solid ${status === "correct" ? "#6bcb77" : "#ff6b6b"}`,
                color: status === "correct" ? "#6bcb77" : "#ff6b6b",
              }}
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion overlay */}
        <AnimatePresence>
          {showComplete && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="glass flex flex-col items-center gap-5 p-8 w-full max-w-lg"
              style={{ border: "2px solid #ffd93d", boxShadow: "0 0 40px rgba(255,217,61,0.3)" }}
            >
              <div className="celebrate-text title-font" style={{ fontSize: "2.5rem" }}>
                LEVEL COMPLETE! 🎉
              </div>
              <div className="relative w-40 h-40 bg-white rounded-full border-4 border-yellow-400 shadow-2xl p-3">
                <Image src={dish.image} alt={dish.name} fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
              </div>
              <p className="text-xl font-bold text-white">{dish.emoji} {dish.name}</p>
              <p className="text-gray-300 italic">{dish.description}</p>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <motion.span key={i} className={`star ${i <= stars ? "active" : ""}`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>⭐</motion.span>
                ))}
              </div>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <RotateCcw size={18} /> Redo
                </motion.button>
                {levelIdx + 1 < STEP_BY_STEP_LEVELS.length ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={nextLevel}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #ffd93d, #ff9a3c)", color: "#000" }}
                  >
                    Next Level <ChevronRight size={18} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #ffd93d, #ff9a3c)", color: "#000" }}
                  >
                    <Trophy size={18} /> All Done!
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ingredient picker - bottom */}
        {!showComplete && (
          <div className="mt-auto w-full max-w-3xl">
            <p className="text-center font-black tracking-widest mb-3 text-sm" style={{ color: "#6b7280" }}>
              TAP THE RIGHT INGREDIENT
            </p>
            <div className="glass py-5 px-6 flex justify-center gap-6">
              {allIngredients.map((ingr) => (
                <motion.button
                  key={ingr.id}
                  whileHover={{ y: -10, scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleClick(ingr.id)}
                  disabled={status !== "idle"}
                  className="ingr-card flex flex-col items-center gap-2"
                  style={{ minWidth: 90, opacity: status !== "idle" ? 0.5 : 1 }}
                >
                  <div className="relative w-20 h-20">
                    <Image src={ingr.image} alt={ingr.name} fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                  </div>
                  <span className="font-black text-xs text-center" style={{ color: "#1f2937", maxWidth: 80 }}>{ingr.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
