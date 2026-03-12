"use client";

import { useState } from "react";
import { ArrowLeft, Flame, Sparkles, Trash2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { INGREDIENTS, DISHES } from "@/lib/gameData";

interface Props { onBack: () => void; }

export default function CustomMode({ onBack }: Props) {
  const [workbench, setWorkbench] = useState<string[]>([]);
  const [status, setStatus]       = useState<"idle" | "cooking" | "result">("idle");
  const [resultDish, setResultDish] = useState<typeof DISHES[string] | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [showBook, setShowBook]     = useState(false);

  const addIngredient = (id: string) => {
    if (workbench.length < 3 && status === "idle" && !workbench.includes(id)) {
      setWorkbench(p => [...p, id]);
    }
  };

  const clear = () => { if (status !== "cooking") { setWorkbench([]); setStatus("idle"); setResultDish(null); } };

  const cook = () => {
    if (workbench.length === 0) return;
    setStatus("cooking");
    setTimeout(() => {
      const sorted = [...workbench].sort().join(",");
      let found: typeof DISHES[string] | null = null;
      for (const key in DISHES) {
        if ([...DISHES[key].recipe].sort().join(",") === sorted) { found = DISHES[key]; break; }
      }
      setResultDish(found);
      if (found) setDiscovered(prev => new Set([...prev, found!.id]));
      setStatus("result");
    }, 2000);
  };

  const allDishes = Object.values(DISHES);

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: "linear-gradient(160deg, #1c1107 0%, #0a0505 100%)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <Image src="/assets/kitchen_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-3">
        <button onClick={onBack} className="hud-badge" style={{ color: "#ffd93d", borderColor: "rgba(255,217,61,0.3)" }}>
          <ArrowLeft size={18} /> Menu
        </button>
        <h1 className="title-font text-gradient" style={{ fontSize: "1.8rem" }}>SANDBOX KITCHEN</h1>
        <button onClick={() => setShowBook(s => !s)} className="hud-badge" style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)" }}>
          <BookOpen size={18} /> {discovered.size}/{allDishes.length}
        </button>
      </div>

      <div className="relative z-10 flex flex-col flex-1 items-center px-6 pb-6 gap-6">

        {/* Workbench */}
        <div className="glass w-full max-w-3xl flex-1 flex flex-col relative p-6 gap-4"
          style={{ border: "1px solid rgba(255,217,61,0.15)" }}>

          <p className="text-center font-black tracking-widest text-gray-400 text-sm">WORKBENCH — DROP UP TO 3 INGREDIENTS</p>

          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">

              {status === "cooking" && (
                <motion.div key="cooking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Flame size={80} color="#ff9a3c" />
                  </motion.div>
                  <p className="title-font text-2xl" style={{ color: "#ff9a3c" }}>COOKING...</p>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-orange-400"
                        animate={{ y: [0, -12, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {status === "result" && (
                <motion.div key="result" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="flex flex-col items-center gap-5">
                  {resultDish ? (
                    <>
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0], y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="relative w-48 h-48 bg-white rounded-full border-4 p-4 shadow-2xl"
                        style={{ borderColor: "#ffd93d", boxShadow: "0 0 50px rgba(255,217,61,0.5)" }}
                      >
                        <Image src={resultDish.image} alt={resultDish.name} fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                      </motion.div>
                      <div className="text-center">
                        <div className="celebrate-text title-font" style={{ fontSize: "2rem" }}>
                          {resultDish.emoji} {resultDish.name.toUpperCase()} DISCOVERED!
                        </div>
                        <p className="text-gray-300 mt-1">{resultDish.description}</p>
                        <p className="font-black mt-2" style={{ color: "#6bcb77" }}>+${resultDish.price} recipe value!</p>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3].map(i => (
                          <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: i * 0.1, type: "spring" }} style={{ fontSize: "1.8rem" }}>⭐</motion.span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-40 h-40 bg-gray-800 rounded-full border-4 border-gray-600 p-4"
                        style={{ filter: "grayscale(1) opacity(0.6)" }}>
                        {workbench[0] && (
                          <Image src={INGREDIENTS[workbench[0]].image} alt="Failed" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                        )}
                      </div>
                      <p className="title-font text-3xl" style={{ color: "#6b7280" }}>💀 MUDDY SLUDGE</p>
                      <p className="text-gray-400">That combo doesn't work. Keep experimenting!</p>
                    </>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={clear}
                    className="px-8 py-3 rounded-xl font-black"
                    style={{ background: "linear-gradient(135deg, #ffd93d, #ff9a3c)", color: "#000" }}
                  >
                    🔄 TRY AGAIN
                  </motion.button>
                </motion.div>
              )}

              {status === "idle" && (
                <motion.div key="slots" className="flex items-center justify-center gap-6 w-full">
                  {[0, 1, 2].map(slot => (
                    <motion.div key={slot}
                      whileHover={workbench[slot] ? { scale: 1.05 } : { scale: 1.02 }}
                      className="flex flex-col items-center gap-2 relative"
                      style={{
                        width: 120, height: 140,
                        borderRadius: 20,
                        border: workbench[slot] ? "2px solid #ffd93d" : "2px dashed rgba(255,255,255,0.15)",
                        background: workbench[slot] ? "rgba(255,217,61,0.05)" : "rgba(0,0,0,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {workbench[slot] ? (
                        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", bounce: 0.6 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="relative w-20 h-20 bg-white rounded-xl p-1 shadow-xl">
                            <Image src={INGREDIENTS[workbench[slot]].image} alt="" fill
                              className="object-contain" style={{ mixBlendMode: "multiply" }} />
                          </div>
                          <span className="text-xs font-bold text-center text-white">{INGREDIENTS[workbench[slot]].name}</span>
                        </motion.div>
                      ) : (
                        <span className="font-black text-gray-600 text-sm">SLOT {slot + 1}</span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          {status === "idle" && (
            <div className="flex gap-4 justify-end">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={clear} disabled={workbench.length === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold"
                style={{ background: "rgba(255,107,107,0.15)", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)",
                  opacity: workbench.length === 0 ? 0.4 : 1, cursor: workbench.length === 0 ? "not-allowed" : "pointer" }}
              >
                <Trash2 size={18} /> Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                onClick={cook} disabled={workbench.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black"
                style={{ background: workbench.length > 0 ? "linear-gradient(135deg,#ff9a3c,#ff6b6b)" : "rgba(255,255,255,0.05)",
                  color: workbench.length > 0 ? "white" : "#4b5563",
                  cursor: workbench.length === 0 ? "not-allowed" : "pointer",
                  boxShadow: workbench.length > 0 ? "0 0 24px rgba(255,107,107,0.4)" : "none" }}
              >
                <Flame size={18} /> COOK NOW!
              </motion.button>
            </div>
          )}
        </div>

        {/* Ingredient shelf */}
        <div className="w-full max-w-3xl">
          <p className="font-black text-xs tracking-widest text-gray-500 mb-3 ml-1">AVAILABLE INGREDIENTS — TAP TO ADD</p>
          <div className="glass py-5 px-6 flex gap-5 overflow-x-auto" style={{ border: "1px solid rgba(255,217,61,0.1)" }}>
            {Object.values(INGREDIENTS).map((ingr) => {
              const inWorkbench = workbench.includes(ingr.id);
              return (
                <motion.button
                  key={ingr.id}
                  whileHover={{ y: -10 }} whileTap={{ scale: 0.9 }}
                  onClick={() => addIngredient(ingr.id)}
                  disabled={status !== "idle" || workbench.length >= 3 || inWorkbench}
                  className="ingr-card flex flex-col items-center gap-2 flex-shrink-0"
                  style={{
                    minWidth: 90, padding: 10,
                    opacity: (status !== "idle" || inWorkbench || workbench.length >= 3) ? 0.5 : 1,
                    cursor: (status !== "idle" || inWorkbench || workbench.length >= 3) ? "not-allowed" : "pointer",
                    border: inWorkbench ? "2px solid #ffd93d" : "2px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="relative w-16 h-16">
                    <Image src={ingr.image} alt={ingr.name} fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                  </div>
                  <span className="font-bold text-xs text-center text-gray-700" style={{ maxWidth: 80 }}>{ingr.name}</span>
                  <span style={{ fontSize: "1.1rem" }}>{ingr.emoji}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recipe Book Overlay */}
      <AnimatePresence>
        {showBook && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 h-full w-80 z-30 p-6 overflow-y-auto"
            style={{ background: "rgba(10,14,26,0.97)", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="title-font text-xl text-white">📖 Recipe Book</h2>
              <button onClick={() => setShowBook(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              {allDishes.map(dish => {
                const found = discovered.has(dish.id);
                return (
                  <motion.div key={dish.id}
                    className="glass p-4 flex items-center gap-4"
                    style={{ opacity: found ? 1 : 0.5, border: found ? "1px solid rgba(107,203,119,0.4)" : "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-xl p-1">
                      {found
                        ? <Image src={dish.image} alt={dish.name} fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem" }}>❓</div>
                      }
                    </div>
                    <div>
                      <p className="font-black text-sm" style={{ color: found ? "#6bcb77" : "#6b7280" }}>
                        {found ? `${dish.emoji} ${dish.name}` : "???"}
                      </p>
                      {found && <p className="text-xs text-gray-400 mt-1">{dish.recipe.map(id => INGREDIENTS[id]?.name).join(" + ")}</p>}
                      {!found && <p className="text-xs text-gray-600">Not yet discovered</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
