"use client";

import { useState } from "react";
import { ArrowLeft, Flame, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameButton from "@/components/ui/GameButton";
import Image from "next/image";
import { INGREDIENTS, DISHES } from "@/lib/gameData";

interface ModeProps {
  onBack: () => void;
}

export default function CustomMode({ onBack }: ModeProps) {
  const [workbench, setWorkbench] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "cooking" | "result">("idle");
  const [resultDish, setResultDish] = useState<any>(null);

  const handleAddIngredient = (id: string) => {
    if (workbench.length < 3 && status === "idle") {
      setWorkbench((prev) => [...prev, id]);
    }
  };

  const handleClear = () => {
    if (status !== "cooking") {
      setWorkbench([]);
      setStatus("idle");
      setResultDish(null);
    }
  };

  const handleCook = () => {
    if (workbench.length === 0) return;
    setStatus("cooking");
    
    setTimeout(() => {
      // Check for matching recipe
      const sortedWorkbench = [...workbench].sort().join(",");
      let foundDish = null;

      for (const dishKey in DISHES) {
        const dish = DISHES[dishKey];
        const sortedRecipe = [...dish.recipe].sort().join(",");
        if (sortedWorkbench === sortedRecipe) {
          foundDish = dish;
          break;
        }
      }

      setResultDish(foundDish);
      setStatus("result");
    }, 2000);
  };

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: '#0f172a' }}>
      <Image
        src="/assets/kitchen_bg.png"
        alt="Kitchen Background"
        fill
        className="object-cover opacity-30 pointer-events-none"
      />

      <div className="absolute top-6 left-6 z-50">
        <GameButton onClick={onBack} variant="secondary">
          <ArrowLeft size={20} /> BACK TO MENU
        </GameButton>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-8 p-8">
        
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-gradient uppercase tracking-widest mb-2">CUSTOM SANDBOX</h1>
          <p className="text-gray-400">Combine up to 3 ingredients to discover recipes!</p>
        </div>

        {/* Workbench Area */}
        <div className="glass-panel w-full max-w-3xl h-[300px] flex flex-col items-center justify-center relative p-8 gap-6">
          
          <AnimatePresence mode="wait">
            {status === "cooking" ? (
              <motion.div
                key="cooking"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-orange-500"
              >
                <Flame size={100} className="animate-pulse" />
                <h2 className="text-2xl font-bold font-mono animate-bounce">COOKING...</h2>
              </motion.div>
            ) : status === "result" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {resultDish ? (
                  <>
                    <div className="w-48 h-48 relative drop-shadow-[0_0_40px_rgba(255,215,0,0.6)] bg-white rounded-full p-4 border-4 border-yellow-400">
                      <Image src={resultDish.image} alt={resultDish.name} fill className="object-contain mix-blend-multiply scale-90" />
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Sparkles />
                      <h2 className="text-3xl font-bold uppercase">{resultDish.name} DISCOVERED!</h2>
                      <Sparkles />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-48 h-48 relative drop-shadow-xl opacity-50 contrast-200 sepia bg-white rounded-full p-4 mb-4">
                      <Image src={INGREDIENTS[workbench[0]].image} alt="Failed" fill className="object-contain mix-blend-multiply scale-90" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-400">MUDDY SLUDGE...</h2>
                    <p className="text-red-400">That combination didn't work.</p>
                  </>
                )}
                <GameButton onClick={handleClear} variant="primary" className="mt-4">
                  TRY AGAIN
                </GameButton>
              </motion.div>
            ) : (
              <motion.div key="idle" className="flex items-center justify-center gap-8 w-full h-full">
                {[0, 1, 2].map((slot) => (
                  <div key={slot} className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-600 bg-black/20 flex flex-col items-center justify-center relative transition-all hover:bg-black/40">
                    {workbench[slot] ? (
                      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
                        <div className="w-24 h-24 relative drop-shadow-xl bg-white rounded-xl p-2">
                          <Image src={INGREDIENTS[workbench[slot]].image} alt="Ingredient" fill className="object-contain mix-blend-multiply scale-90" />
                        </div>
                      </motion.div>
                    ) : (
                      <span className="text-gray-600 font-bold">SLOT {slot + 1}</span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {status === "idle" && (
            <div className="absolute bottom-6 right-6 flex gap-4">
              <GameButton onClick={handleClear} variant="danger" disabled={workbench.length === 0}>
                <Trash2 size={20} /> CLEAR
              </GameButton>
              <GameButton onClick={handleCook} variant="primary" disabled={workbench.length === 0}>
                <Flame size={20} /> COOK NOW
              </GameButton>
            </div>
          )}

        </div>

        {/* Ingredients Shelf */}
        <div className="mt-auto mb-12 w-full max-w-4xl">
           <h3 className="text-sm font-bold text-gray-400 tracking-widest mb-4 ml-4">AVAILABLE INGREDIENTS</h3>
           <div className="glass-panel py-6 px-8 flex gap-6 overflow-x-auto items-center">
            {Object.values(INGREDIENTS).map((ingr: any) => (
              <motion.button
                key={ingr.id}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddIngredient(ingr.id)}
                disabled={status !== "idle" || workbench.length >= 3}
                className={`flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-xl min-w-[120px] transition-colors ${status !== "idle" || workbench.length >= 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 bg-black/20"}`}
              >
                <div className="w-16 h-16 relative bg-white rounded-lg p-1">
                  <Image src={ingr.image} alt={ingr.name} fill className="object-contain mix-blend-multiply scale-90" />
                </div>
                <span className="font-bold text-sm whitespace-nowrap">{ingr.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
