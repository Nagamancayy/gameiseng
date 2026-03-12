"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, DollarSign, Utensils, Flame, Clock, Heart, Star, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DISHES, CUSTOMER_SPRITES, CUSTOMER_NAMES } from "@/lib/gameData";

interface Props { onBack: () => void; }

// ─── Types ───────────────────────────────────────────────────────────────
type TableStatus = "empty" | "seated" | "ordering" | "waiting" | "eating" | "dirty";

interface Customer {
  id: number;
  name: string;
  sprite: string;
  order: string;
  patience: number; // 0–100
  hearts: number;   // 0–3 tip hearts remaining
}

interface Table {
  id: number;
  status: TableStatus;
  customer: Customer | null;
  cookProgress: number; // 0–100, cooking progress
}

// ─── Level configs ─────────────────────────────────────────────────────────
const LEVELS = [
  { level: 1, tableCount: 2, cookTime: 2500, patienceDrain: 0.8, arrivalInterval: 8000, targetScore: 120, timeLimit: 90,  label: "Quiet Morning" },
  { level: 2, tableCount: 3, cookTime: 2000, patienceDrain: 1.2, arrivalInterval: 6000, targetScore: 280, timeLimit: 120, label: "Lunch Rush" },
  { level: 3, tableCount: 4, cookTime: 1500, patienceDrain: 1.8, arrivalInterval: 4500, targetScore: 500, timeLimit: 120, label: "Dinner Chaos" },
];

const DISH_KEYS = Object.keys(DISHES);
let gCustomerId = 0;
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function newCustomer(): Customer {
  return {
    id: ++gCustomerId,
    name: randItem(CUSTOMER_NAMES),
    sprite: randItem(CUSTOMER_SPRITES),
    order: randItem(DISH_KEYS),
    patience: 100,
    hearts: 3,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function RestaurantMode({ onBack }: Props) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore]       = useState(0);
  const [combo, setCombo]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon]           = useState(false);
  const [tip, setTip]           = useState<{ msg: string; color: string } | null>(null);

  // Diner Dash state
  const [lobby, setLobby]       = useState<Customer[]>([]); // waiting at door
  const [tables, setTables]     = useState<Table[]>([]);
  const [kitchen, setKitchen]   = useState<string[]>([]);   // dish IDs cooking
  const [ready, setReady]       = useState<string[]>([]);   // cooked & ready
  const [isCooking, setIsCooking] = useState(false);

  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const cookTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Init tables on level ──────────────────────────────────────────────
  useEffect(() => {
    setTables(Array.from({ length: cfg.tableCount }, (_, i) => ({
      id: i + 1, status: "empty", customer: null, cookProgress: 0,
    })));
    setScore(0); setCombo(0); setTimeLeft(cfg.timeLimit);
    setLobby([]); setKitchen([]); setReady([]);
    setGameOver(false); setWon(false);
  }, [levelIdx, cfg.tableCount, cfg.timeLimit]);

  // ── Show floating tip ─────────────────────────────────────────────────
  const showTip = useCallback((msg: string, color = "#ffd93d") => {
    setTip({ msg, color });
    setTimeout(() => setTip(null), 1800);
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, won]);

  // ── Win check ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameOver && score >= cfg.targetScore) setWon(true);
  }, [score, cfg.targetScore, gameOver]);

  // ── Patience drain (polling every 400ms) ──────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    const t = setInterval(() => {
      // Drain lobby patience
      setLobby(prev =>
        prev
          .map(c => ({ ...c, patience: Math.max(0, c.patience - cfg.patienceDrain * 1.5) }))
          .filter(c => {
            if (c.patience <= 0) { showTip(`${c.name} left! 😤`, "#ff6b6b"); return false; }
            return true;
          })
      );
      // Drain table patience for seated/waiting states
      setTables(prev =>
        prev.map(t => {
          if (!t.customer) return t;
          if (t.status === "seated" || t.status === "ordering" || t.status === "waiting") {
            const drained = Math.max(0, t.customer.patience - cfg.patienceDrain);
            const newHearts = Math.max(0, drained > 50 ? 3 : drained > 25 ? 2 : drained > 0 ? 1 : 0);
            if (drained === 0) {
              showTip(`${t.customer.name} stormed out! 😤`, "#ff6b6b");
              return { ...t, status: "empty", customer: null };
            }
            return { ...t, customer: { ...t.customer, patience: drained, hearts: newHearts } };
          }
          return t;
        })
      );
    }, 400);
    return () => clearInterval(t);
  }, [cfg.patienceDrain, gameOver, won, showTip]);

  // ── Customer arrivals ─────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    const arriveOne = () => {
      setLobby(prev => {
        if (prev.length >= 3) return prev;  // max 3 in lobby
        return [...prev, { ...newCustomer(), patience: 100 }];
      });
    };
    arriveOne(); // first one immediately
    const t = setInterval(arriveOne, cfg.arrivalInterval);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.arrivalInterval, gameOver, won, levelIdx]);

  // ── Chef cooking: pick from kitchen queue ─────────────────────────────
  useEffect(() => {
    if (kitchen.length === 0 || isCooking) return;
    setIsCooking(true);
    const dish = kitchen[0];
    cookTimerRef.current = setTimeout(() => {
      setReady(r => [...r, dish]);
      setKitchen(q => q.slice(1));
      setIsCooking(false);
    }, cfg.cookTime);
    return () => { if (cookTimerRef.current) clearTimeout(cookTimerRef.current); };
  }, [kitchen, isCooking, cfg.cookTime]);

  // ─────────────── CLICK HANDLERS ───────────────────────────────────────

  // Seat a lobby customer to an empty table
  const seatCustomer = (tableId: number) => {
    if (lobby.length === 0) return;
    const customer = lobby[0];
    setLobby(prev => prev.slice(1));
    setTables(prev => prev.map(t =>
      t.id === tableId && t.status === "empty"
        ? { ...t, status: "seated", customer }
        : t
    ));
    showTip(`${customer.name} seated! 😊`, "#4ecdc4");
  };

  // Take order from seated customer
  const takeOrder = (tableId: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId || t.status !== "seated" || !t.customer) return t;
      setKitchen(q => [...q, t.customer!.order]);
      showTip(`Order sent to kitchen! 🍳`, "#ffd93d");
      return { ...t, status: "waiting" };
    }));
  };

  // Serve ready dish to waiting table
  const serveDish = (tableId: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId || t.status !== "waiting" || !t.customer) return t;
      const dishIdx = ready.findIndex(d => d === t.customer!.order);
      if (dishIdx === -1) { showTip("Still cooking! ⏳", "#6b7280"); return t; }
      setReady(r => { const n = [...r]; n.splice(dishIdx, 1); return n; });
      const newCombo = combo + 1;
      setCombo(newCombo);
      showTip(`Served! ${newCombo > 2 ? "🔥 COMBO x" + newCombo + "!" : "✅"}`, newCombo > 2 ? "#ff9a3c" : "#6bcb77");
      // After 4s eating → dirty
      setTimeout(() => {
        setTables(cur => cur.map(ct =>
          ct.id === tableId ? { ...ct, status: "dirty" } : ct
        ));
      }, 4000);
      return { ...t, status: "eating" };
    }));
  };

  // Collect payment + clean table
  const collectAndClean = (tableId: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId || t.status !== "dirty" || !t.customer) return t;
      const dishPrice = DISHES[t.customer.order]?.price ?? 10;
      const heartBonus = t.customer.hearts * 5;
      const comboBonus = Math.min(combo, 4) * 5;
      const earned = dishPrice + heartBonus + comboBonus;
      setScore(s => s + earned);
      setCombo(0);
      showTip(`+$${earned}! 💰 (${t.customer.hearts}❤️ tips)`, "#6bcb77");
      return { ...t, status: "empty", customer: null };
    }));
  };

  // Unified table click dispatcher
  const handleTable = (tableId: number) => {
    if (gameOver || won) return;
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    if (table.status === "empty")   seatCustomer(tableId);
    if (table.status === "seated")  takeOrder(tableId);
    if (table.status === "waiting") serveDish(tableId);
    if (table.status === "dirty")   collectAndClean(tableId);
  };

  // ─────────────── UI HELPERS ─────────────────────────────────────────────

  const pctTime = timeLeft / cfg.timeLimit;
  const pctScore = Math.min(score / cfg.targetScore, 1);

  const statusLabel: Record<TableStatus, { text: string; color: string; emoji: string }> = {
    empty:    { text: lobby.length > 0 ? "SEAT GUEST" : "WAITING...", color: lobby.length > 0 ? "#4ecdc4" : "#374151", emoji: lobby.length > 0 ? "🪑" : "🍽️" },
    seated:   { text: "TAKE ORDER", color: "#ffd93d",  emoji: "📋" },
    ordering: { text: "TAKE ORDER", color: "#ffd93d",  emoji: "📋" },
    waiting:  { text: "SERVE FOOD", color: "#a78bfa",  emoji: "🍽️" },
    eating:   { text: "EATING",     color: "#6bcb77",  emoji: "😋" },
    dirty:    { text: "COLLECT $",  color: "#ff6b6b",  emoji: "💰" },
  };

  const isClickable = (s: TableStatus) => s === "seated" || s === "waiting" || s === "dirty" || (s === "empty" && lobby.length > 0);

  const resetLevel = () => {
    gCustomerId = 0;
    setLevelIdx(l => l); // trigger re-init via useEffect
    setTables(Array.from({ length: cfg.tableCount }, (_, i) => ({
      id: i + 1, status: "empty", customer: null, cookProgress: 0,
    })));
    setScore(0); setCombo(0); setTimeLeft(cfg.timeLimit);
    setLobby([]); setKitchen([]); setReady([]);
    setIsCooking(false); setGameOver(false); setWon(false);
  };

  // ─────────────── RENDER ──────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col relative select-none"
      style={{ background: "linear-gradient(160deg,#0a0a0a 0%,#1a0505 100%)" }}>
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image src="/assets/restaurant_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* ── HUD ── */}
      <div className="relative z-20 px-5 pt-4 pb-2 flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="hud-badge" style={{ color: "#9ca3af" }}>
          <ArrowLeft size={16} /> Menu
        </button>

        {/* Level */}
        <div className="hud-badge" style={{ color: "#ffd93d" }}>
          <Star size={16} color="#ffd93d" /> {cfg.label}
        </div>

        {/* Timer */}
        <div className="hud-badge flex-1 justify-center"
          style={{ color: pctTime > 0.4 ? "#4ecdc4" : "#ff6b6b" }}>
          <Clock size={16} />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          <div className="progress-bar w-20 ml-2" style={{ height: 8 }}>
            <div className="progress-fill" style={{
              width: `${pctTime * 100}%`,
              background: pctTime > 0.4 ? "linear-gradient(90deg,#4ecdc4,#6bcb77)" : "linear-gradient(90deg,#ff9a3c,#ff6b6b)",
            }} />
          </div>
        </div>

        {/* Score */}
        <div className="hud-badge" style={{ color: "#6bcb77" }}>
          <DollarSign size={16} color="#6bcb77" /> {score}
          <span className="text-gray-500 text-xs">/{cfg.targetScore}</span>
        </div>

        {/* Combo */}
        {combo > 1 && (
          <motion.div className="hud-badge" style={{ color: "#ff9a3c" }}
            animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
            🔥 x{combo}
          </motion.div>
        )}
      </div>

      {/* Score progress bar */}
      <div className="relative z-20 px-5 pb-2">
        <div className="progress-bar w-full" style={{ height: 8 }}>
          <motion.div className="progress-fill"
            animate={{ width: `${pctScore * 100}%` }}
            style={{ background: "linear-gradient(90deg,#4ecdc4,#6bcb77,#ffd93d)" }} />
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 flex flex-1 gap-5 px-5 pb-5 overflow-hidden">

        {/* ── LEFT: Lobby + Tables ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Lobby waiting area */}
          <div className="glass px-5 py-3 flex items-center gap-4 flex-shrink-0"
            style={{ border: "1px solid rgba(78,205,196,0.2)" }}>
            <div className="flex items-center gap-2 text-sm font-black text-gray-400">
              <Users size={16} /> DOOR QUEUE ({lobby.length})
            </div>
            <div className="flex gap-3 flex-1 overflow-x-auto">
              {lobby.length === 0
                ? <span className="text-gray-600 text-xs italic">Nobody waiting...</span>
                : lobby.map((c, i) => (
                  <motion.div key={c.id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="relative w-12 h-16 bg-white rounded-t-full overflow-hidden shadow-md"
                      style={{ border: `2px solid ${c.patience > 60 ? "#4ecdc4" : c.patience > 30 ? "#ffd93d" : "#ff6b6b"}` }}>
                      <Image src={c.sprite} alt={c.name} fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
                    </div>
                    <span className="text-xs font-bold text-white">{c.name}</span>
                    {/* Patience dots */}
                    <div className="flex gap-0.5">
                      {[0,1,2].map(h => (
                        <span key={h} style={{ fontSize: "0.6rem", filter: h < c.hearts ? "none" : "grayscale(1) opacity(0.3)" }}>❤️</span>
                      ))}
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Tables */}
          <div className="flex-1 flex justify-center items-center gap-5 flex-wrap content-center">
            {tables.map(table => {
              const meta = statusLabel[table.status];
              const clickable = isClickable(table.status);
              const c = table.customer;

              return (
                <motion.div key={table.id}
                  className={`table-card ${table.status}`}
                  style={{
                    width: 220, height: 310,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "flex-end",
                    position: "relative", padding: 12,
                    cursor: clickable ? "pointer" : "default",
                  }}
                  whileHover={clickable ? { scale: 1.05, y: -5 } : {}}
                  whileTap={clickable ? { scale: 0.96 } : {}}
                  onClick={() => handleTable(table.id)}
                >
                  {/* Action badge */}
                  {clickable && (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-3 z-20 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1"
                      style={{ background: meta.color, color: "#000",
                        boxShadow: `0 0 16px ${meta.color}99`,
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    >
                      {meta.emoji} {meta.text}
                    </motion.div>
                  )}

                  {/* Patience bar (above table) */}
                  {c && (table.status === "seated" || table.status === "waiting") && (
                    <div className="absolute top-10 left-3 right-3 z-10">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <div className="flex gap-0.5">
                          {[0,1,2].map(h => (
                            <span key={h} style={{ fontSize: "0.65rem", filter: h < c.hearts ? "none" : "grayscale(1) opacity(0.2)" }}>❤️</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ height: 5, borderRadius: 9, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 9, transition: "width 0.4s",
                          width: `${c.patience}%`,
                          background: c.patience > 60 ? "#6bcb77" : c.patience > 30 ? "#ffd93d" : "#ff6b6b",
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Dish order icon */}
                  {c && (table.status === "seated" || table.status === "waiting") && (
                    <div className="absolute top-[80px] right-3 z-10">
                      <div className="relative w-11 h-11 bg-white rounded-xl shadow-lg p-1 border border-gray-200">
                        <Image src={DISHES[c.order].image} alt="Order" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                      </div>
                    </div>
                  )}

                  {/* Customer character */}
                  <div className="flex-1 flex flex-col items-center justify-end w-full pb-2 relative">
                    {c && table.status !== "empty" && table.status !== "dirty" ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-44 overflow-hidden rounded-t-full bg-white shadow-xl"
                          style={{ border: `2px solid ${meta.color}` }}>
                          <Image src={c.sprite} alt={c.name} fill
                            className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
                        </div>
                        {/* Eating food on table */}
                        {table.status === "eating" && (
                          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                            className="relative w-14 h-14 bg-white rounded-full border-2 border-green-400 shadow-lg p-1 -mt-2">
                            <Image src={DISHES[c.order].image} alt="" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                          </motion.div>
                        )}
                      </div>
                    ) : table.status === "dirty" ? (
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}
                        className="flex flex-col items-center gap-1">
                        <span style={{ fontSize: "3.5rem" }}>🧽</span>
                        <span className="text-xs font-black text-red-400">Clean & Collect!</span>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <span style={{ fontSize: "2.5rem" }}>🪑</span>
                        {lobby.length > 0 && <span className="text-xs font-bold text-teal-400">Tap to seat!</span>}
                      </div>
                    )}
                  </div>

                  {/* Table surface */}
                  <div className="w-full h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#78350f,#431407)", borderTop: "3px solid #b45309" }}>
                    <span className="text-amber-200/40 font-black text-xs">TABLE {table.id}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Kitchen ── */}
        <div className="w-72 flex flex-col gap-4 flex-shrink-0">
          <h2 className="text-xs font-black tracking-widest text-gray-500 text-center">KITCHEN</h2>

          {/* Chef */}
          <div className="glass p-4 flex flex-col items-center gap-3"
            style={{ border: "1px solid rgba(255,107,107,0.2)" }}>
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-white border-4 shadow-2xl"
              style={{
                borderColor: isCooking ? "#ff9a3c" : "#ff6b6b",
                boxShadow: isCooking ? "0 0 30px rgba(255,154,60,0.6)" : "0 0 16px rgba(255,107,107,0.3)",
              }}>
              <Image src="/assets/chef_char.png" alt="Chef" fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
              {isCooking && (
                <motion.div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center"
                  animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 0.7 }}>
                  <Flame size={40} className="text-orange-300" />
                </motion.div>
              )}
            </div>
            <p className="text-xs font-black" style={{ color: isCooking ? "#ff9a3c" : "#4b5563" }}>
              {isCooking ? "🔥 Cooking..." : "👨‍🍳 Chef Idle"}
            </p>
            {/* Cook progress bar */}
            {isCooking && (
              <div className="progress-bar w-full" style={{ height: 6 }}>
                <motion.div className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: cfg.cookTime / 1000, ease: "linear" }}
                  style={{ background: "linear-gradient(90deg,#ff9a3c,#ffd93d)" }} />
              </div>
            )}
          </div>

          {/* Kitchen queue */}
          <div className="glass p-4 flex flex-col gap-2" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-xs font-black tracking-widest text-gray-500">
              QUEUE ({kitchen.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {kitchen.length === 0
                ? <span className="text-gray-600 text-xs italic">Queue empty</span>
                : kitchen.map((d, i) => (
                  <motion.div key={`${d}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="relative w-12 h-12 bg-white rounded-xl p-1 shadow-md flex-shrink-0"
                    style={{ border: i === 0 ? "2px solid #ff9a3c" : "2px solid rgba(255,255,255,0.1)" }}>
                    <Image src={DISHES[d].image} alt="Queue" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                    {i === 0 && isCooking && (
                      <span className="absolute -top-2 -right-2 text-xs">🔥</span>
                    )}
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Ready to serve */}
          <div className="glass flex-1 p-4 flex flex-col gap-2"
            style={{ border: "1px solid rgba(107,203,119,0.2)", minHeight: 100 }}>
            <h3 className="text-xs font-black tracking-widest text-gray-500 flex items-center gap-1">
              <Utensils size={12} /> READY ({ready.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {ready.length === 0
                ? <span className="text-gray-600 text-xs italic">Nothing ready yet</span>
                : ready.map((d, i) => (
                  <motion.div key={`ready-${d}-${i}`}
                    initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="relative w-14 h-14 bg-white rounded-xl p-1 shadow-lg flex-shrink-0"
                    style={{ border: "2px solid #6bcb77", boxShadow: "0 0 12px rgba(107,203,119,0.5)" }}>
                    <Image src={DISHES[d].image} alt="Ready" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                    <span className="absolute -top-2 -right-2 text-xs">✅</span>
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Tips panel */}
          <div className="glass p-3 text-xs text-gray-500 flex flex-col gap-1"
            style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
            <p>🪑 Empty table → <strong className="text-teal-400">Seat guest</strong></p>
            <p>📋 Seated → <strong className="text-yellow-400">Take order</strong></p>
            <p>🍽️ Waiting + dish ready → <strong className="text-purple-400">Serve!</strong></p>
            <p>💰 After eating → <strong className="text-green-400">Collect & clean</strong></p>
          </div>
        </div>
      </div>

      {/* ── Floating Tip ── */}
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-2xl font-black text-xl pointer-events-none"
            style={{
              background: "rgba(0,0,0,0.85)", color: tip.color,
              border: `2px solid ${tip.color}44`,
              backdropFilter: "blur(12px)",
            }}
          >
            {tip.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Win / Game Over Modal ── */}
      <AnimatePresence>
        {(won || gameOver) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.45 }}
              className="glass flex flex-col items-center gap-5 p-10 max-w-md w-full mx-6"
              style={{
                border: `2px solid ${won ? "#6bcb77" : "#ff6b6b"}`,
                boxShadow: `0 0 60px ${won ? "rgba(107,203,119,0.4)" : "rgba(255,107,107,0.4)"}`,
              }}
            >
              <div style={{ fontSize: "4.5rem" }}>{won ? "🏆" : "😰"}</div>
              <h2 className="title-font text-center"
                style={{ fontSize: "2.2rem", color: won ? "#6bcb77" : "#ff6b6b" }}>
                {won ? "LEVEL PASSED!" : "TIME'S UP!"}
              </h2>
              <p className="text-gray-300 text-center text-sm">
                {won
                  ? `You earned $${score} and crushed the target of $${cfg.targetScore}!`
                  : `You earned $${score} out of $${cfg.targetScore} target.`}
              </p>
              {/* Stars */}
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <motion.span key={i}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    style={{ fontSize: "2rem", filter: score >= i * cfg.targetScore / 3 ? "none" : "grayscale(1) opacity(0.2)" }}>
                    ⭐
                  </motion.span>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="px-5 py-3 rounded-xl font-black text-sm"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                  ← Menu
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={resetLevel}
                  className="px-5 py-3 rounded-xl font-black text-sm"
                  style={{ background: "linear-gradient(135deg,#ff6b6b,#ff9a3c)", color: "white" }}>
                  🔄 Retry
                </motion.button>
                {won && levelIdx + 1 < LEVELS.length && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setLevelIdx(l => l + 1)}
                    className="px-5 py-3 rounded-xl font-black text-sm"
                    style={{ background: "linear-gradient(135deg,#6bcb77,#4ecdc4)", color: "#000" }}>
                    Next Level ▶
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
