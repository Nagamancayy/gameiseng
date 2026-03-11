"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Flame, Info } from "lucide-react";

interface KitchenViewProps {
  onBack: () => void;
  onCookComplete: (dishId: string) => void;
}

const INGREDIENTS = [
  { id: "bun_top", name: "Bun", image: "/assets/ingr_bun_top.png" },
  { id: "meat_patty", name: "Patty", image: "/assets/ingr_meat_patty.png" },
  { id: "cheese_slice", name: "Cheese", image: "/assets/ingr_cheese_slice.png" },
  { id: "tomato_slice", name: "Tomato", image: "/assets/ingr_tomato_slice.png" },
  { id: "lettuce_leaf", name: "Lettuce", image: "/assets/ingr_lettuce_leaf.png" },
];

export default function KitchenView({ onBack, onCookComplete }: KitchenViewProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isCooking, setIsCooking] = useState(false);

  const toggleIngredient = (id: string) => {
    if (isCooking) return;
    setSelectedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCook = () => {
    if (selectedIngredients.length === 0) return;
    setIsCooking(true);
    // Simulate cooking animation
    setTimeout(() => {
      setIsCooking(false);
      onCookComplete("burger");
      setSelectedIngredients([]);
    }, 2000);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{ background: '#0f172a' }}>
      <Image 
        src="/assets/kitchen_background.png" 
        alt="Kitchen" 
        fill 
        style={{ objectFit: 'cover', opacity: 0.5 }}
      />

      {/* Header */}
      <div className="fixed top-6 left-6 flex items-center gap-4 z-50">
        <button onClick={onBack} className="btn-premium" style={{ background: 'var(--card-bg)' }}>
          <ArrowLeft size={20} /> BACK TO DINING
        </button>
        <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', fontWeight: '700' }}>
          KITCHEN STATION
        </div>
      </div>

      <div className="h-full flex flex-col items-center justify-center relative z-10 gap-12">
        {/* Prep Table */}
        <div className="glass-panel" style={{ width: '80%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
          {selectedIngredients.map((id, index) => {
            const ingr = INGREDIENTS.find(i => i.id === id);
            return (
              <motion.div
                key={`${id}-${index}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ width: '80px', height: '80px', position: 'relative' }}
              >
                <Image src={ingr!.image} alt={ingr!.name} fill style={{ objectFit: 'contain' }} />
              </motion.div>
            );
          })}
          {selectedIngredients.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', textAlign: 'center' }}>
              SELECT INGREDIENTS TO START PREP
            </div>
          )}
        </div>

        {/* Ingredients Shelf */}
        <div className="flex gap-6">
          {INGREDIENTS.map(ingr => (
            <div 
              key={ingr.id}
              onClick={() => toggleIngredient(ingr.id)}
              className="glass-panel cursor-pointer"
              style={{ 
                padding: '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '0.5rem',
                border: selectedIngredients.includes(ingr.id) ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                background: selectedIngredients.includes(ingr.id) ? 'rgba(255,107,107,0.1)' : 'var(--card-bg)'
              }}
            >
              <div style={{ width: '60px', height: '60px', position: 'relative' }}>
                <Image src={ingr.image} alt={ingr.name} fill style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{ingr.name}</span>
            </div>
          ))}
        </div>

        {/* Cook Button */}
        <div className="flex flex-col items-center gap-4">
          {isCooking && (
            <div className="glass-panel" style={{ width: '300px', height: '10px', overflow: 'hidden', padding: '0' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                style={{ height: '100%', background: 'var(--primary)' }}
              />
            </div>
          )}
          <button 
            onClick={handleCook}
            disabled={isCooking || selectedIngredients.length === 0}
            className="btn-premium"
            style={{ 
              fontSize: '1.5rem', 
              padding: '1.5rem 4rem', 
              background: isCooking ? '#71717a' : 'var(--primary)',
              opacity: selectedIngredients.length === 0 ? 0.5 : 1
            }}
          >
            {isCooking ? <Flame className="animate-pulse" size={32} /> : "START COOKING"}
          </button>
        </div>
      </div>
    </div>
  );
}
