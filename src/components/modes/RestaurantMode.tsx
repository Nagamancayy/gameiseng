"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, DollarSign, Utensils, Flame, Star, Clock, Brush } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DISHES, CUSTOMER_SPRITES, CUSTOMER_NAMES, RESTAURANT_LEVELS } from "@/lib/gameData";

interface Props { onBack: () => void; }

type TableStatus = "empty" | "ordering" | "waiting" | "eating" | "dirty";

interface Table {
  id: number; status: TableStatus;
  order: string | null; customerSprite: string | null;
  customerName: string | null; patience: number;
}

const DISH_KEYS = Object.keys(DISHES);

function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function RestaurantMode({ onBack }: Props) {
  const [levelIdx, setLevelIdx]   = useState(0);
  const [money, setMoney]         = useState(0);
  const [timeLeft, setTimeLeft]   = useState(RESTAURANT_LEVELS[0].timeLimit);
  const [gameOver, setGameOver]   = useState(false);
  const [won, setWon]             = useState(false);
  const [tables, setTables]       = useState<Table[]>([
    { id: 1, status: "empty", order: null, customerSprite: null, customerName: null, patience: 100 },
    { id: 2, status: "empty", order: null, customerSprite: null, customerName: null, patience: 100 },
    { id: 3, status: "empty", order: null, customerSprite: null, customerName: null, patience: 100 },
  ]);
  const [chefQueue, setChefQueue] = useState<string[]>([]);
  const [isCooking, setIsCooking] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [floatingTip, setFloatingTip] = useState<string | null>(null);
  const [combo, setCombo]         = useState(0);

  const level = RESTAURANT_LEVELS[levelIdx];
  const target = level.targetMoney;

  const showTip = useCallback((msg: string) => {
    setFloatingTip(msg);
    setTimeout(() => setFloatingTip(null), 2000);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver || won) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, won]);

  // Check win
  useEffect(() => {
    if (!gameOver && money >= target) setWon(true);
  }, [money, target, gameOver]);

  // Customer arrivals
  useEffect(() => {
    if (gameOver || won) return;
    const interval = setInterval(() => {
      setTables(prev => {
        const empty = prev.filter(t => t.status === "empty");
        if (empty.length === 0) return prev;
        const tableToFill = randItem(empty);
        const order = randItem(DISH_KEYS);
        const sprite = randItem(CUSTOMER_SPRITES);
        const name = randItem(CUSTOMER_NAMES);
        return prev.map(t => t.id === tableToFill.id
          ? { ...t, status: "ordering", order, customerSprite: sprite, customerName: name, patience: 100 }
          : t
        );
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [gameOver, won]);

  // Patience drain
  useEffect(() => {
    if (gameOver || won) return;
    const interval = setInterval(() => {
      setTables(prev => prev.map(t => {
        if (t.status === "ordering" || t.status === "waiting") {
          const newPat = Math.max(0, t.patience - 2);
          if (newPat === 0) return { ...t, status: "empty", order: null, customerSprite: null, customerName: null, patience: 100 };
          return { ...t, patience: newPat };
        }
        return t;
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [gameOver, won]);

  // Chef cooking
  useEffect(() => {
    if (chefQueue.length > 0 && !isCooking) {
      setIsCooking(true);
      const timer = setTimeout(() => {
        const cooked = chefQueue[0];
        setInventory(p => [...p, cooked]);
        setChefQueue(p => p.slice(1));
        setIsCooking(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [chefQueue, isCooking]);

  const handleTable = (tableId: number) => {
    if (gameOver || won) return;
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      if (t.status === "ordering") {
        setChefQueue(q => [...q, t.order!]);
        showTip(`🍳 Order sent to kitchen!`);
        return { ...t, status: "waiting" };
      }
      if (t.status === "waiting") {
        const idx = inventory.findIndex(item => item === t.order);
        if (idx > -1) {
          setInventory(inv => { const n = [...inv]; n.splice(idx, 1); return n; });
          setCombo(c => c + 1);
          showTip(`🍽️ Served! Combo x${combo + 1}!`);
          setTimeout(() => {
            setTables(cur => cur.map(ct => ct.id === tableId ? { ...ct, status: "dirty" } : ct));
          }, 3000);
          return { ...t, status: "eating" };
        } else {
          showTip("⚠️ Not ready yet! Wait for chef.");
        }
      }
      if (t.status === "dirty") {
        const earned = DISHES[t.order!]?.price ?? 10;
        const comboBonus = Math.min(combo, 3) * 3;
        setMoney(m => m + earned + comboBonus);
        setCombo(0);
        showTip(`+$${earned + comboBonus} 💰`);
        return { ...t, status: "empty", order: null, customerSprite: null, customerName: null, patience: 100 };
      }
      return t;
    }));
  };

  const pctTime = timeLeft / level.timeLimit;

  const statusMeta: Record<TableStatus, { label: string; color: string; emoji: string }> = {
    empty:    { label: "",            color: "transparent", emoji: "" },
    ordering: { label: "TAKE ORDER",  color: "#ffd93d",     emoji: "📋" },
    waiting:  { label: "SERVE FOOD",  color: "#4ecdc4",     emoji: "🍽️" },
    eating:   { label: "EATING...",   color: "#6bcb77",     emoji: "😋" },
    dirty:    { label: "COLLECT $",   color: "#ff6b6b",     emoji: "💰" },
  };

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #1a0505 100%)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <Image src="/assets/restaurant_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* HUD */}
      <div className="relative z-20 flex items-center gap-4 px-6 pt-4 pb-3">
        <button onClick={onBack} className="hud-badge" style={{ color: "#9ca3af" }}>
          <ArrowLeft size={18} /> Menu
        </button>
        <div className="hud-badge flex-1" style={{ justifyContent: "center" }}>
          <Clock size={18} color={pctTime > 0.4 ? "#4ecdc4" : "#ff6b6b"} />
          <span className="font-black" style={{ color: pctTime > 0.4 ? "#4ecdc4" : "#ff6b6b" }}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
          <div className="progress-bar w-24 ml-2">
            <div className="progress-fill" style={{ width: `${pctTime * 100}%`, background: pctTime > 0.4 ? "linear-gradient(90deg,#4ecdc4,#6bcb77)" : "linear-gradient(90deg,#ff6b6b,#ff9a3c)" }} />
          </div>
        </div>
        <div className="hud-badge" style={{ color: "#6bcb77" }}>
          <DollarSign size={18} color="#6bcb77" /> {money}
          <span className="text-gray-500 text-xs">/{target}</span>
        </div>
        {combo > 1 && (
          <motion.div className="hud-badge" style={{ color: "#ffd93d" }}
            animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
            🔥 COMBO x{combo}
          </motion.div>
        )}
      </div>

      {/* Money progress bar */}
      <div className="relative z-20 px-6 pb-3">
        <div className="progress-bar w-full">
          <motion.div className="progress-fill" animate={{ width: `${Math.min((money / target) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Main game area */}
      <div className="relative z-10 flex flex-1 gap-6 px-6 pb-6 overflow-hidden">

        {/* Tables area */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-sm font-black tracking-widest text-gray-500 text-center">DINING AREA</h2>
          <div className="flex-1 flex justify-center items-center gap-6 flex-wrap">
            {tables.map(table => {
              const meta = statusMeta[table.status];
              const isClickable = ["ordering", "waiting", "dirty"].includes(table.status);
              return (
                <motion.div
                  key={table.id}
                  className={`table-card ${table.status}`}
                  style={{ width: 260, height: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", position: "relative", padding: 16 }}
                  whileHover={isClickable ? { scale: 1.04, y: -4 } : {}}
                  whileTap={isClickable ? { scale: 0.97 } : {}}
                  onClick={() => handleTable(table.id)}
                >
                  {/* Clickable indicator */}
                  {isClickable && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute top-4 z-20 px-4 py-2 rounded-2xl rounded-bl-none font-black text-sm flex items-center gap-2"
                      style={{ background: meta.color, color: "#000", boxShadow: `0 0 20px ${meta.color}80` }}
                    >
                      {meta.emoji} {meta.label}
                    </motion.div>
                  )}

                  {/* Patience bar */}
                  {(table.status === "ordering" || table.status === "waiting") && (
                    <div className="absolute top-14 left-4 right-4">
                      <div className="progress-bar w-full" style={{ height: 6 }}>
                        <div className="progress-fill" style={{
                          width: `${table.patience}%`,
                          background: table.patience > 60 ? "#6bcb77" : table.patience > 30 ? "#ffd93d" : "#ff6b6b",
                          transition: "width 0.5s"
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Customer with name */}
                  <div className="flex-1 flex flex-col items-center justify-end w-full relative">
                    {table.customerSprite && table.status !== "empty" && table.status !== "dirty" && (
                      <div className="flex flex-col items-center">
                        {table.customerName && (
                          <span className="font-black text-sm mb-1" style={{ color: "#ffd93d" }}>{table.customerName}</span>
                        )}
                        <div className="relative w-40 h-52 bg-white rounded-t-full shadow-xl overflow-hidden">
                          <Image src={table.customerSprite} alt="Customer" fill
                            className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
                        </div>
                      </div>
                    )}

                    {table.status === "dirty" && (
                      <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                          <Brush size={60} color="#ff6b6b" />
                        </motion.div>
                        <span className="font-black text-sm" style={{ color: "#ff6b6b" }}>Clean & Collect!</span>
                      </div>
                    )}

                    {table.status === "eating" && table.order && (
                      <motion.div className="flex flex-col items-center gap-2 mb-4"
                        animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <div className="relative w-20 h-20 bg-white rounded-full shadow-lg border-2 border-green-400 p-2">
                          <Image src={DISHES[table.order].image} alt="Food" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                        </div>
                        <span className="text-lg">😋</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Table surface */}
                  <div className="w-full h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#78350f,#431407)", borderTop: "3px solid #b45309" }}>
                    <span className="font-black text-xs text-amber-200/50">TABLE {table.id}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Kitchen sidebar */}
        <div className="w-80 flex flex-col gap-4">

          <h2 className="text-sm font-black tracking-widest text-gray-500 text-center">KITCHEN STATION</h2>

          {/* Chef */}
          <div className="glass p-5 flex flex-col items-center gap-4" style={{ border: "1px solid rgba(255,107,107,0.2)" }}>
            <div className="relative w-36 h-36 bg-white rounded-full overflow-hidden border-4 shadow-2xl"
              style={{ borderColor: isCooking ? "#ff9a3c" : "#ff6b6b", boxShadow: isCooking ? "0 0 30px rgba(255,154,60,0.6)" : "0 0 20px rgba(255,107,107,0.3)" }}>
              <Image src="/assets/chef_char.png" alt="Chef" fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
              {isCooking && (
                <motion.div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center"
                  animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                  <Flame size={48} className="text-orange-400" />
                </motion.div>
              )}
            </div>
            <p className="font-black text-sm" style={{ color: isCooking ? "#ff9a3c" : "#9ca3af" }}>
              {isCooking ? "🔥 Cooking..." : "👨‍🍳 Chef Nana — Idle"}
            </p>
          </div>

          {/* Order Queue */}
          <div className="glass p-4 flex flex-col gap-3" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-black text-xs tracking-widest text-gray-500">ORDER QUEUE ({chefQueue.length})</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {chefQueue.length === 0
                ? <span className="text-gray-600 text-xs italic">Queue empty...</span>
                : chefQueue.map((order, idx) => (
                  <motion.div key={`${order}-${idx}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="relative w-14 h-14 bg-white rounded-xl flex-shrink-0 p-1 shadow-md"
                    style={{ border: idx === 0 && isCooking ? "2px solid #ff9a3c" : "2px solid rgba(255,255,255,0.1)" }}>
                    <Image src={DISHES[order].image} alt="Dish" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                    {idx === 0 && isCooking && (
                      <motion.div className="absolute -top-2 -right-2 text-sm"
                        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>🔥</motion.div>
                    )}
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Inventory */}
          <div className="glass flex-1 p-4 flex flex-col gap-3" style={{ border: "1px solid rgba(107,203,119,0.15)" }}>
            <h3 className="font-black text-xs tracking-widest text-gray-500 flex items-center gap-2">
              <Utensils size={14} /> READY TO SERVE ({inventory.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {inventory.length === 0
                ? <p className="text-gray-600 text-xs italic">Nothing ready...</p>
                : inventory.map((item, idx) => (
                  <motion.div key={idx} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="relative w-16 h-16 bg-white rounded-xl p-1 shadow-lg"
                    style={{ border: "2px solid #6bcb77", boxShadow: "0 0 12px rgba(107,203,119,0.4)" }}>
                    <Image src={DISHES[item].image} alt="Ready" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                    <span className="absolute -top-2 -right-2" style={{ fontSize: "0.9rem" }}>✅</span>
                  </motion.div>
                ))
              }
            </div>
          </div>

        </div>
      </div>

      {/* Floating tip */}
      <AnimatePresence>
        {floatingTip && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-2xl font-black text-xl pointer-events-none"
            style={{ background: "rgba(0,0,0,0.85)", color: "#ffd93d", border: "2px solid rgba(255,217,61,0.3)", backdropFilter: "blur(12px)" }}
          >
            {floatingTip}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over / Win Modal */}
      <AnimatePresence>
        {(gameOver || won) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="glass flex flex-col items-center gap-6 p-10 max-w-md w-full mx-6"
              style={{ border: `2px solid ${won ? "#6bcb77" : "#ff6b6b"}`, boxShadow: `0 0 60px ${won ? "rgba(107,203,119,0.4)" : "rgba(255,107,107,0.4)"}` }}
            >
              <div style={{ fontSize: "5rem" }}>{won ? "🏆" : "💀"}</div>
              <h2 className="title-font" style={{ fontSize: "2.5rem", color: won ? "#6bcb77" : "#ff6b6b" }}>
                {won ? "AMAZING! YOU WON!" : "TIME'S UP!"}
              </h2>
              <p className="text-gray-300 text-center">
                {won ? `You earned $${money} and impressed all customers!` : `You collected $${money} / $${target}. Keep practicing!`}
              </p>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <motion.span key={i} className={`star ${money >= i * target / 3 ? "active" : ""}`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>⭐</motion.span>
                ))}
              </div>
              <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="px-6 py-3 rounded-xl font-black"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                  Menu
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setMoney(0); setTimeLeft(level.timeLimit); setTables(t => t.map(tb => ({ ...tb, status: "empty", order: null, customerSprite: null, customerName: null, patience: 100 }))); setChefQueue([]); setInventory([]); setCombo(0); setGameOver(false); setWon(false); }}
                  className="px-6 py-3 rounded-xl font-black"
                  style={{ background: "linear-gradient(135deg,#ff6b6b,#ff9a3c)", color: "white" }}>
                  Try Again 🔄
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
