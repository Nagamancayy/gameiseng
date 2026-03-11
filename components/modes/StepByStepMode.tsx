"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameButton from "@/components/ui/GameButton";
import Image from "next/image";
import { INGREDIENTS, DISHES, STEP_BY_STEP_LEVELS } from "@/lib/gameData";

interface ModeProps {
  onBack: () => void;
}

export default function StepByStepMode({ onBack }: ModeProps) {
  const level = STEP_BY_STEP_LEVELS[0];
  const targetDish = DISHES[level.targetDish];
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "completed">("idle");

  const expectedIngredientObj = INGREDIENTS[targetDish.recipe[currentStep]];

  const handleIngredientClick = (clickedId: string) => {
    if (status === "success" || status === "error" || status === "completed") return;

    if (clickedId === expectedIngredientObj.id) {
      if (currentStep + 1 === targetDish.recipe.length) {
        setStatus("completed");
      } else {
        setStatus("success");
        setTimeout(() => {
          setCurrentStep(c => c + 1);
          setStatus("idle");
        }, 1000);
      }
    } else {
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: '#1e293b' }}>
      {/* Background Image */}
      <Image
        src="/assets/kitchen_bg.png"
        alt="Kitchen Background"
        fill
        className="object-cover opacity-60 pointer-events-none"
      />

      <div className="absolute top-6 left-6 z-50">
        <GameButton onClick={onBack} variant="secondary">
          <ArrowLeft size={20} /> BACK TO MENU
        </GameButton>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-8 p-8">
        
        {/* Dialogue Box */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel p-6 max-w-2xl flex gap-6 items-center"
        >
          <div className="w-24 h-24 relative flex-shrink-0">
            <Image src="/assets/chef_char.png" alt="Chef" fill className="object-contain drop-shadow-[0_0_15px_var(--primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 text-[var(--accent)]">Chef Nana says:</h2>
            <p className="text-lg leading-relaxed">{level.instructions}</p>
          </div>
        </motion.div>

        {/* Status Area */}
        <div className="h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "completed" ? (
              <motion.div
                key="completed"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: [0, 5, -5, 0] }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-48 h-48 relative drop-shadow-[0_0_30px_#22c55e]">
                  <Image src={targetDish.image} alt={targetDish.name} fill className="object-contain" />
                </div>
                <h2 className="text-4xl font-bold text-green-400 drop-shadow-lg">PERFECT {targetDish.name.toUpperCase()}!</h2>
                <GameButton onClick={onBack} variant="primary" className="mt-4">
                  CONTINUE
                </GameButton>
              </motion.div>
            ) : status === "success" ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1.5 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-green-500 bg-white/10 p-8 rounded-full backdrop-blur-md"
              >
                <CheckCircle2 size={80} />
              </motion.div>
            ) : status === "error" ? (
              <motion.div
                key="error"
                initial={{ x: -20 }}
                animate={{ x: [0, -20, 20, -20, 20, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-red-500 bg-red-500/10 p-8 rounded-full backdrop-blur-md"
              >
                <XCircle size={80} />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)]">
                  NEXT INGREDIENT: {expectedIngredientObj.name}
                </p>
                <div className="w-32 h-32 relative opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <Image src={expectedIngredientObj.image} alt={expectedIngredientObj.name} fill className="object-contain" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ingredients Shelf */}
        <div className="mt-auto mb-12">
          <div className="glass-panel py-6 px-12 flex gap-8 items-end justify-center">
            {Object.values(INGREDIENTS).map((ingr: any) => (
              <motion.button
                key={ingr.id}
                whileHover={{ y: -15, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleIngredientClick(ingr.id)}
                disabled={status !== "idle"}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-colors ${status !== "idle" ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
              >
                <div className="w-24 h-24 relative drop-shadow-xl">
                  <Image src={ingr.image} alt={ingr.name} fill className="object-contain" />
                </div>
                <span className="font-bold text-lg">{ingr.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
