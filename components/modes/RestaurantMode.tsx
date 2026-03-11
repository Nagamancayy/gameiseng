"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChefHat, DollarSign, Utensils, CheckCircle, Flame, Brush } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameButton from "@/components/ui/GameButton";
import Image from "next/image";
import { DISHES } from "@/lib/gameData";

interface ModeProps {
  onBack: () => void;
}

type TableStatus = "empty" | "ordering" | "waiting" | "eating" | "dirty";

interface Table {
  id: number;
  status: TableStatus;
  order: string | null;
  customerSprite: string | null;
}

export default function RestaurantMode({ onBack }: ModeProps) {
  const [money, setMoney] = useState(0);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, status: "empty", order: null, customerSprite: null },
    { id: 2, status: "empty", order: null, customerSprite: null },
    { id: 3, status: "empty", order: null, customerSprite: null },
  ]);

  const [chefQueue, setChefQueue] = useState<string[]>([]);
  const [isCooking, setIsCooking] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);

  // Random customer arrivals
  useEffect(() => {
    const interval = setInterval(() => {
      setTables((prev) => {
        const emptyTables = prev.filter(t => t.status === "empty");
        if (emptyTables.length > 0) {
          const tableToFill = emptyTables[Math.floor(Math.random() * emptyTables.length)];
          return prev.map(t => 
            t.id === tableToFill.id 
              ? { ...t, status: "ordering", order: "pizza", customerSprite: "/assets/customer_char.png" } 
              : t
          );
        }
        return prev;
      });
    }, 6000); // New customer every 6 secs if available
    return () => clearInterval(interval);
  }, []);

  // Chef logic
  useEffect(() => {
    if (chefQueue.length > 0 && !isCooking) {
      setIsCooking(true);
      const timer = setTimeout(() => {
        const cookedDish = chefQueue[0];
        setInventory(prev => [...prev, cookedDish]);
        setChefQueue(prev => prev.slice(1));
        setIsCooking(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [chefQueue, isCooking]);

  const handleTableClick = (tableId: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;

      if (t.status === "ordering") {
        setChefQueue(q => [...q, t.order!]);
        return { ...t, status: "waiting" };
      }
      
      if (t.status === "waiting") {
        const itemIndex = inventory.findIndex(item => item === t.order);
        if (itemIndex > -1) {
          setInventory(inv => {
            const newInv = [...inv];
            newInv.splice(itemIndex, 1);
            return newInv;
          });
          // Transition to eating automatically transitions to dirty after 3s
          setTimeout(() => {
            setTables(currentTables => currentTables.map(ct => 
              ct.id === tableId ? { ...ct, status: "dirty" } : ct
            ));
          }, 3000);
          return { ...t, status: "eating" };
        }
      }

      if (t.status === "dirty") {
        setMoney(m => m + 15);
        return { ...t, status: "empty", order: null, customerSprite: null };
      }

      return t;
    }));
  };

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: '#0f172a' }}>
      <Image
        src="/assets/restaurant_bg.png"
        alt="Restaurant Background"
        fill
        className="object-cover opacity-60 pointer-events-none"
      />

      {/* HUD */}
      <div className="absolute top-6 left-6 z-50 flex gap-4 items-center">
        <GameButton onClick={onBack} variant="secondary">
          <ArrowLeft size={20} />
        </GameButton>
        <div className="glass-panel px-6 py-2 flex items-center gap-2 font-bold text-xl text-green-400">
          <DollarSign size={24} /> {money}
        </div>
      </div>

      <div className="relative z-10 flex w-full h-full p-8 pt-24 gap-8">
        
        {/* Dining Area */}
        <div className="flex-1 flex flex-col gap-8">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)] glass-panel text-center py-2">DINING AREA</h2>
          <div className="flex-1 flex justify-center items-center gap-8 flex-wrap">
            {tables.map(table => (
              <motion.div 
                key={table.id}
                whileHover={table.status !== "empty" && table.status !== "eating" ? { scale: 1.05 } : {}}
                whileTap={table.status !== "empty" && table.status !== "eating" ? { scale: 0.95 } : {}}
                className={`glass-panel p-4 flex flex-col items-center justify-end w-[280px] h-[350px] relative transition-colors
                  ${table.status === "ordering" ? "border-yellow-400 cursor-pointer" : ""}
                  ${table.status === "waiting" ? "border-blue-400 cursor-pointer" : ""}
                  ${table.status === "dirty" ? "border-red-400 cursor-pointer" : ""}
                  ${table.status === "empty" || table.status === "eating" ? "opacity-90" : ""}
                `}
                onClick={() => handleTableClick(table.id)}
              >
                {/* Status Indicator bubble */}
                <AnimatePresence>
                  {table.status !== "empty" && (
                    <motion.div 
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className="absolute top-4 bg-white text-black p-3 rounded-2xl rounded-bl-none font-bold text-lg flex items-center gap-2 z-20 shadow-xl border-4 border-gray-200"
                    >
                      {table.status === "ordering" && (
                        <>Take Order: <Image src={DISHES[table.order!].image} alt="Dish" width={32} height={32} /></>
                      )}
                      {table.status === "waiting" && "Waiting..."}
                      {table.status === "eating" && "Eating... 😋"}
                      {table.status === "dirty" && <><Brush size={24} className="text-red-500" /> Clean Table</>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Customer / Table Graphic */}
                <div className="relative flex-1 w-full flex items-end justify-center pb-8">
                  {table.status !== "empty" && table.status !== "dirty" && table.customerSprite && (
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="w-48 h-64 absolute bottom-0 z-10"
                    >
                      <Image src={table.customerSprite} alt="Customer" fill className="object-contain" />
                    </motion.div>
                  )}
                  {/* Table visual */}
                  <div className="w-full h-16 bg-amber-900/80 rounded-t-xl rounded-b-md border-t-4 border-amber-700 absolute bottom-0 z-15 shadow-2xl overflow-hidden backdrop-blur-md">
                      {table.status === "dirty" && (
                        <div className="absolute inset-x-0 top-0 h-2 bg-green-900/50" />
                      )}
                      {table.status === "eating" && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-12 h-12">
                           <Image src={DISHES[table.order!].image} alt="Food" fill className="object-contain drop-shadow-xl" />
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Kitchen Area */}
        <div className="w-[400px] flex flex-col gap-6">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--primary)] glass-panel text-center py-2">KITCHEN STATION</h2>
          
          <div className="glass-panel flex-1 flex flex-col p-6 items-center gap-6">
            <div className="w-56 h-56 relative border-4 border-[var(--primary)] rounded-full overflow-hidden bg-white/5 drop-shadow-[0_0_20px_rgba(255,107,107,0.3)]">
              <Image src="/assets/chef_char.png" alt="Chef" fill className="object-cover object-top" />
              {isCooking && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
                  <Flame size={64} className="text-red-500 animate-pulse" />
                </div>
              )}
            </div>

            <div className="w-full bg-black/40 rounded-lg p-4 flex flex-col gap-2 min-h-[100px]">
              <h3 className="font-bold text-sm text-gray-400">ORDER QUEUE ({chefQueue.length})</h3>
              <div className="flex gap-2 overflow-x-auto p-2">
                {chefQueue.map((order, idx) => (
                   <div key={idx} className={`w-12 h-12 relative flex-shrink-0 bg-white/10 rounded-md p-1 ${idx === 0 && isCooking ? "animate-bounce border-2 border-orange-500" : ""}`}>
                     <Image src={DISHES[order].image} alt="Dish" fill className="object-contain" />
                   </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="glass-panel h-[150px] p-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm text-gray-400 flex items-center gap-2"><Utensils size={16} /> READY TO SERVE</h3>
            <div className="flex gap-4 overflow-x-auto p-2 h-full items-center">
              {inventory.map((item, idx) => (
                <motion.div key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 relative bg-green-500/20 border-2 border-green-500 rounded-lg p-2 flex-shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                   <Image src={DISHES[item].image} alt="Ready" fill className="object-contain" />
                </motion.div>
              ))}
              {inventory.length === 0 && <p className="text-gray-500 italic m-auto">Kitchen is empty...</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
