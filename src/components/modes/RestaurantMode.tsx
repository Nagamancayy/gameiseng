"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, DollarSign, Utensils, Flame, Clock, Users,
  Star, ShoppingBag, Lock, ChevronRight, CheckCircle, Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  CAREER_LEVELS, SHOP_ITEMS, DISHES, CUSTOMER_SPRITES, CUSTOMER_NAMES,
  type CareerLevelConfig, type TableConfig,
} from "@/lib/gameData";

interface Props { onBack: () => void; }

// ─── Career save / localStorage ──────────────────────────────────────────────
interface CareerSave {
  unlockedLevels: number[];
  coins: number;
  upgrades: Record<string, number>; // shopItemId -> current level (# times bought)
  extraTables: { small: number; large: number }; // bought extra tables
}

const SAVE_KEY = "clickcook_career_v1";

function loadSave(): CareerSave {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : defaultSave();
  } catch { return defaultSave(); }
}

function defaultSave(): CareerSave {
  return { unlockedLevels: [1], coins: 0, upgrades: {}, extraTables: { small: 0, large: 0 } };
}

function persistSave(s: CareerSave) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ─── In-level types ───────────────────────────────────────────────────────────
type TableStatus = "empty" | "seated" | "waiting" | "eating" | "dirty";

interface CustomerGroup {
  id: number; size: number;   // 1–4
  name: string; sprite: string; order: string;
  patience: number; hearts: number;
}

interface GameTable {
  id: number; size: 2 | 4; status: TableStatus;
  customer: CustomerGroup | null;
}

interface ChefSlot {
  id: number;
  busy: boolean;
  dish: string | null;
}

let _gid = 0;
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Main component ───────────────────────────────────────────────────────────
type Screen = "select" | "shop" | "playing";

export default function RestaurantMode({ onBack }: Props) {
  const [save, setSave]           = useState<CareerSave>(loadSave);
  const [screen, setScreen]       = useState<Screen>("select");
  const [playingLevel, setPlayingLevel] = useState<CareerLevelConfig | null>(null);

  const updateSave = (fn: (prev: CareerSave) => CareerSave) => {
    setSave(prev => { const next = fn(prev); persistSave(next); return next; });
  };

  const handleWin = (levelNum: number, earned: number) => {
    updateSave(prev => ({
      ...prev,
      coins: prev.coins + earned,
      unlockedLevels: prev.unlockedLevels.includes(levelNum + 1) ||
        levelNum >= CAREER_LEVELS.length
        ? prev.unlockedLevels
        : [...prev.unlockedLevels, levelNum + 1],
    }));
  };

  if (screen === "shop")    return <ShopScreen save={save} updateSave={updateSave} onBack={() => setScreen("select")} />;
  if (screen === "playing" && playingLevel) {
    return (
      <GameplayScreen
        levelCfg={playingLevel}
        save={save}
        onWin={(earned) => { handleWin(playingLevel.level, earned); setScreen("select"); }}
        onLose={() => setScreen("select")}
        onBack={() => setScreen("select")}
      />
    );
  }

  // ─── Level Select ────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col relative"
      style={{ background: "linear-gradient(160deg,#0a0a18 0%,#1a0505 100%)" }}>
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <Image src="/assets/restaurant_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-4">
        <button onClick={onBack} className="hud-badge" style={{ color: "#9ca3af" }}>
          <ArrowLeft size={16} /> Menu
        </button>
        <h1 className="title-font text-gradient" style={{ fontSize: "2rem" }}>RESTAURANT CAREER</h1>
        <div className="flex items-center gap-3">
          <div className="hud-badge" style={{ color: "#ffd93d" }}>
            <DollarSign size={16} color="#ffd93d" /> {save.coins}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setScreen("shop")}
            className="hud-badge"
            style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)", cursor: "pointer" }}
          >
            <ShoppingBag size={16} /> Shop
          </motion.button>
        </div>
      </div>

      {/* Level grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-5 max-w-3xl mx-auto" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {CAREER_LEVELS.map(lvl => {
            const unlocked = save.unlockedLevels.includes(lvl.level);
            const completed = save.unlockedLevels.includes(lvl.level + 1) || (lvl.level === CAREER_LEVELS.length && save.unlockedLevels.includes(lvl.level));
            return (
              <motion.div
                key={lvl.level}
                whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                whileTap={unlocked ? { scale: 0.97 } : {}}
                onClick={() => { if (unlocked) { setPlayingLevel(lvl); setScreen("playing"); } }}
                className="glass flex flex-col gap-3 p-5 relative overflow-hidden"
                style={{
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.5,
                  border: completed
                    ? "2px solid rgba(107,203,119,0.5)"
                    : unlocked ? "2px solid rgba(255,217,61,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Level number badge */}
                <div className="flex items-center justify-between">
                  <span className="title-font text-3xl" style={{ color: unlocked ? "#ffd93d" : "#4b5563" }}>
                    LV {lvl.level}
                  </span>
                  {completed && <CheckCircle size={22} color="#6bcb77" />}
                  {!unlocked && <Lock size={20} color="#4b5563" />}
                </div>

                <div>
                  <p className="font-black text-base text-white">{lvl.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lvl.description}</p>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 text-xs font-bold flex-wrap">
                  <span className="flex items-center gap-1" style={{ color: "#6bcb77" }}>
                    <DollarSign size={12} /> ${lvl.targetScore}
                  </span>
                  <span className="flex items-center gap-1" style={{ color: "#4ecdc4" }}>
                    <Clock size={12} /> {lvl.timeLimit}s
                  </span>
                  <span className="flex items-center gap-1" style={{ color: "#ffd93d" }}>
                    🏆 +{lvl.reward} coins
                  </span>
                </div>

                {/* Table preview */}
                <div className="flex gap-1 flex-wrap">
                  {lvl.baseTables.map(t => (
                    <span key={t.id} className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: t.size === 4 ? "rgba(167,139,250,0.15)" : "rgba(78,205,196,0.15)", color: t.size === 4 ? "#a78bfa" : "#4ecdc4" }}>
                      {t.size === 4 ? "🛋️" : "🪑"}×{t.size}
                    </span>
                  ))}
                </div>

                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}>
                    <div className="flex flex-col items-center gap-1">
                      <Lock size={32} color="#6b7280" />
                      <span className="text-xs font-bold text-gray-500">Complete LV {lvl.level - 1} first</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SHOP SCREEN ────────────────────────────────────────────────────────────
function ShopScreen({ save, updateSave, onBack }: {
  save: CareerSave;
  updateSave: (fn: (prev: CareerSave) => CareerSave) => void;
  onBack: () => void;
}) {
  const categories = [
    { id: "table",   label: "Tables",   emoji: "🪑" },
    { id: "chef",    label: "Chefs",    emoji: "👨‍🍳" },
    { id: "upgrade", label: "Upgrades", emoji: "⚡" },
  ];
  const [cat, setCat] = useState<string>("table");
  const items = SHOP_ITEMS.filter(i => i.category === cat);

  const buy = (itemId: string) => {
    updateSave(prev => {
      const item = SHOP_ITEMS.find(i => i.id === itemId)!;
      const currentLvl = prev.upgrades[itemId] ?? 0;
      if (currentLvl >= item.maxLevel) return prev;
      const cost = item.costs[currentLvl];
      if (prev.coins < cost) return prev;
      const newUpgrades = { ...prev.upgrades, [itemId]: currentLvl + 1 };
      const newTables = { ...prev.extraTables };
      if (itemId === "small_table") newTables.small += 1;
      if (itemId === "large_table") newTables.large += 1;
      return { ...prev, coins: prev.coins - cost, upgrades: newUpgrades, extraTables: newTables };
    });
  };

  return (
    <div className="h-full w-full flex flex-col relative"
      style={{ background: "linear-gradient(160deg,#0a0014 0%,#1a0a00 100%)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Image src="/assets/kitchen_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-4">
        <button onClick={onBack} className="hud-badge" style={{ color: "#9ca3af" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="title-font text-gradient" style={{ fontSize: "2rem" }}>🛒 UPGRADE SHOP</h1>
        <div className="hud-badge" style={{ color: "#ffd93d" }}>
          <DollarSign size={16} color="#ffd93d" /> {save.coins} coins
        </div>
      </div>

      {/* Category tabs */}
      <div className="relative z-10 flex gap-3 px-6 pb-4">
        {categories.map(c => (
          <motion.button key={c.id} whileTap={{ scale: 0.95 }}
            onClick={() => setCat(c.id)}
            className="px-5 py-2.5 rounded-xl font-black text-sm"
            style={{
              background: cat === c.id ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "rgba(255,255,255,0.06)",
              color: cat === c.id ? "white" : "#6b7280",
              cursor: "pointer",
            }}
          >
            {c.emoji} {c.label}
          </motion.button>
        ))}
      </div>

      {/* Items */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {items.map(item => {
            const currentLvl = save.upgrades[item.id] ?? 0;
            const maxed = currentLvl >= item.maxLevel;
            const cost = maxed ? 0 : item.costs[currentLvl];
            const canAfford = save.coins >= cost;

            return (
              <motion.div key={item.id} whileHover={{ scale: 1.02 }}
                className="glass flex items-center gap-5 p-5"
                style={{ border: maxed ? "1px solid rgba(107,203,119,0.4)" : "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="text-4xl flex-shrink-0">{item.emoji}</div>
                <div className="flex-1">
                  <p className="font-black text-base text-white">{item.label}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{item.description}</p>
                  {/* Level dots */}
                  <div className="flex gap-1.5 mt-2">
                    {Array.from({ length: item.maxLevel }, (_, i) => (
                      <div key={i} className="w-5 h-2 rounded-full"
                        style={{ background: i < currentLvl ? "#6bcb77" : "rgba(255,255,255,0.1)" }} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {currentLvl}/{item.maxLevel}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={!maxed && canAfford ? { scale: 1.08 } : {}}
                  whileTap={!maxed && canAfford ? { scale: 0.95 } : {}}
                  onClick={() => !maxed && canAfford && buy(item.id)}
                  disabled={maxed || !canAfford}
                  className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl font-black text-sm flex-shrink-0"
                  style={{
                    background: maxed
                      ? "rgba(107,203,119,0.15)"
                      : canAfford
                        ? "linear-gradient(135deg,#ffd93d,#ff9a3c)"
                        : "rgba(255,255,255,0.06)",
                    color: maxed ? "#6bcb77" : canAfford ? "#000" : "#4b5563",
                    cursor: maxed || !canAfford ? "not-allowed" : "pointer",
                    minWidth: 90,
                  }}
                >
                  {maxed ? (
                    <><CheckCircle size={18} /> MAX</>
                  ) : (
                    <><Plus size={16} /> ${cost}</>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── GAMEPLAY SCREEN ─────────────────────────────────────────────────────────
function GameplayScreen({ levelCfg, save, onWin, onLose, onBack }: {
  levelCfg: CareerLevelConfig;
  save: CareerSave;
  onWin: (earned: number) => void;
  onLose: () => void;
  onBack: () => void;
}) {
  // Compute effective values from upgrades
  const speedLvl   = save.upgrades["cook_speed"]   ?? 0;
  const patienceLvl= save.upgrades["patience"]     ?? 0;
  const timeLvl    = save.upgrades["extra_time"]   ?? 0;
  const chefLvl    = save.upgrades["extra_chef"]   ?? 0;

  const cookTime     = Math.round(levelCfg.baseCookTime * (1 - speedLvl * 0.2));
  const drainMult    = 1 - patienceLvl * 0.25;
  const timeBonus    = timeLvl * 30;
  const totalChefs   = 1 + chefLvl;

  // Compose table list: base tables + shop-bought extras
  const allTables: TableConfig[] = (() => {
    const base = [...levelCfg.baseTables];
    let nextId = base.length + 1;
    for (let i = 0; i < (save.extraTables.small ?? 0); i++) base.push({ id: nextId++, size: 2 });
    for (let i = 0; i < (save.extraTables.large ?? 0); i++) base.push({ id: nextId++, size: 4 });
    return base;
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [score, setScore]   = useState(0);
  const [combo, setCombo]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(levelCfg.timeLimit + timeBonus);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon]           = useState(false);

  const [lobby, setLobby]   = useState<CustomerGroup[]>([]);
  const [tables, setTables] = useState<GameTable[]>(
    allTables.map(tc => ({ ...tc, status: "empty", customer: null }))
  );
  const [chefs, setChefs]   = useState<ChefSlot[]>(
    Array.from({ length: totalChefs }, (_, i) => ({ id: i + 1, busy: false, dish: null }))
  );
  const [ready, setReady]   = useState<string[]>([]);         // cooked dish queue
  const [kitchenQueue, setKitchenQueue] = useState<string[]>([]); // waiting to cook
  const [tip, setTip]       = useState<{ msg: string; color: string } | null>(null);

  const kitchenRef = useRef(kitchenQueue);
  const chefsRef   = useRef(chefs);
  kitchenRef.current = kitchenQueue;
  chefsRef.current   = chefs;

  const showTip = useCallback((msg: string, color = "#ffd93d") => {
    setTip({ msg, color });
    setTimeout(() => setTip(null), 1800);
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, won]);

  // ── Win check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameOver && score >= levelCfg.targetScore) { setWon(true); onWin(levelCfg.reward); }
  }, [score, levelCfg.targetScore, levelCfg.reward, gameOver, onWin]);

  // ── Patience drain ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    const t = setInterval(() => {
      setLobby(prev => prev.map(c => ({ ...c, patience: Math.max(0, c.patience - levelCfg.basePatienceDrain * drainMult * 1.8) }))
        .filter(c => { if (c.patience <= 0) { showTip(`${c.name} left! 😤`, "#ff6b6b"); return false; } return true; }));
      setTables(prev => prev.map(t => {
        if (!t.customer || !["seated", "waiting"].includes(t.status)) return t;
        const newPat = Math.max(0, t.customer.patience - levelCfg.basePatienceDrain * drainMult);
        const hearts = newPat > 66 ? 3 : newPat > 33 ? 2 : newPat > 0 ? 1 : 0;
        if (newPat === 0) { showTip(`${t.customer.name}'s group left! 😤`, "#ff6b6b"); return { ...t, status: "empty", customer: null }; }
        return { ...t, customer: { ...t.customer, patience: newPat, hearts } };
      }));
    }, 400);
    return () => clearInterval(t);
  }, [levelCfg.basePatienceDrain, drainMult, gameOver, won, showTip]);

  // ── Customer arrivals ──────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver || won) return;
    const arrive = () => {
      setLobby(prev => {
        if (prev.length >= 4) return prev;
        const availableSizes = allTables.map(t => t.size);
        const partySize = Math.random() < 0.5 && availableSizes.includes(4)
          ? Math.ceil(Math.random() * 4)
          : Math.ceil(Math.random() * 2);
        const group: CustomerGroup = {
          id: ++_gid, size: partySize,
          name: randItem(CUSTOMER_NAMES),
          sprite: randItem(CUSTOMER_SPRITES),
          order: randItem(Object.keys(DISHES)),
          patience: 100, hearts: 3,
        };
        return [...prev, group];
      });
    };
    arrive();
    const t = setInterval(arrive, levelCfg.arrivalInterval);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelCfg.arrivalInterval, gameOver, won]);

  // ── Multi-chef cooking ─────────────────────────────────────────────────────
  // Each free chef picks the next item from kitchenQueue.
  // Using refs so new orders don't cancel running timers.
  useEffect(() => {
    const freeChefIdx = chefsRef.current.findIndex(c => !c.busy);
    if (freeChefIdx === -1 || kitchenRef.current.length === 0) return;

    const dish = kitchenRef.current[0];
    setKitchenQueue(q => q.slice(1));
    setChefs(prev => prev.map((c, i) => i === freeChefIdx ? { ...c, busy: true, dish } : c));

    const chefId = chefsRef.current[freeChefIdx].id;
    setTimeout(() => {
      setReady(r => [...r, dish]);
      setChefs(prev => prev.map(c => c.id === chefId ? { ...c, busy: false, dish: null } : c));
    }, cookTime);
  // kitchenQueue intentionally excluded from deps — same stale-closure fix as before
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitchenQueue, chefs, cookTime]);

  // ── Table click dispatcher ─────────────────────────────────────────────────
  const handleTable = (tableId: number) => {
    if (gameOver || won) return;
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.status === "empty") {
      // Seat a group that fits
      const group = lobby.find(g => g.size <= table.size);
      if (!group) { showTip("No fitting group in lobby!", "#6b7280"); return; }
      setLobby(prev => prev.filter(g => g.id !== group.id));
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: "seated", customer: group } : t));
      showTip(`${group.name} & party seated! (×${group.size})`, "#4ecdc4");
      return;
    }

    if (table.status === "seated" && table.customer) {
      setKitchenQueue(q => [...q, table.customer!.order]);
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: "waiting" } : t));
      showTip("Order sent to kitchen! 🍳", "#ffd93d");
      return;
    }

    if (table.status === "waiting" && table.customer) {
      const dishIdx = ready.findIndex(d => d === table.customer!.order);
      if (dishIdx === -1) { showTip("Still cooking! ⏳", "#6b7280"); return; }
      setReady(r => { const n = [...r]; n.splice(dishIdx, 1); return n; });
      const newCombo = combo + 1;
      setCombo(newCombo);
      showTip(`Served! ${newCombo > 2 ? "🔥 COMBO x" + newCombo : "✅"}`, newCombo > 2 ? "#ff9a3c" : "#6bcb77");
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: "eating" } : t));
      setTimeout(() => setTables(cur => cur.map(t => t.id === tableId ? { ...t, status: "dirty" } : t)), 4000);
      return;
    }

    if (table.status === "dirty" && table.customer) {
      const earned = (DISHES[table.customer.order]?.price ?? 10) * table.customer.size
        + table.customer.hearts * 5 + Math.min(combo, 4) * 5;
      setScore(s => s + earned);
      setCombo(0);
      showTip(`+$${earned}! (×${table.customer.size} guests)`, "#6bcb77");
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: "empty", customer: null } : t));
    }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const pctTime  = timeLeft / (levelCfg.timeLimit + timeBonus);
  const pctScore = Math.min(score / levelCfg.targetScore, 1);
  const statusMeta: Record<TableStatus, { text: string; color: string; emoji: string }> = {
    empty:   { text: lobby.some(g => g.size <= 2) || lobby.some(g => g.size <= 4) ? "SEAT GUESTS" : "WAITING", color: "#4ecdc4", emoji: "🪑" },
    seated:  { text: "TAKE ORDER", color: "#ffd93d", emoji: "📋" },
    waiting: { text: "SERVE FOOD", color: "#a78bfa", emoji: "🍽️" },
    eating:  { text: "EATING",     color: "#6bcb77", emoji: "😋" },
    dirty:   { text: "COLLECT $",  color: "#ff6b6b", emoji: "💰" },
  };
  const isClickable = (t: GameTable) =>
    t.status === "dirty" || t.status === "seated" ||
    (t.status === "waiting") ||
    (t.status === "empty" && lobby.some(g => g.size <= t.size));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col relative select-none"
      style={{ background: "linear-gradient(160deg,#0a0a0a 0%,#1a0505 100%)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image src="/assets/restaurant_bg.png" alt="" fill className="object-cover" />
      </div>

      {/* HUD */}
      <div className="relative z-20 flex flex-wrap items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={onBack} className="hud-badge" style={{ color: "#9ca3af" }}>
          <ArrowLeft size={16} />
        </button>
        <div className="hud-badge" style={{ color: "#ffd93d" }}>
          <Star size={14} color="#ffd93d" /> LV {levelCfg.level}: {levelCfg.label}
        </div>
        <div className="hud-badge flex-1 justify-center" style={{ color: pctTime > 0.4 ? "#4ecdc4" : "#ff6b6b" }}>
          <Clock size={14} />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          <div className="progress-bar w-16 ml-2" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${pctTime * 100}%`, background: pctTime > 0.4 ? "linear-gradient(90deg,#4ecdc4,#6bcb77)" : "linear-gradient(90deg,#ff9a3c,#ff6b6b)" }} />
          </div>
        </div>
        <div className="hud-badge" style={{ color: "#6bcb77" }}>
          <DollarSign size={14} color="#6bcb77" /> {score}<span className="text-gray-500 text-xs">/{levelCfg.targetScore}</span>
        </div>
        {combo > 1 && (
          <motion.div className="hud-badge" style={{ color: "#ff9a3c" }}
            animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
            🔥 ×{combo}
          </motion.div>
        )}
      </div>

      {/* Score bar */}
      <div className="relative z-20 px-5 pb-2">
        <div className="progress-bar w-full" style={{ height: 8 }}>
          <motion.div className="progress-fill" animate={{ width: `${pctScore * 100}%` }}
            style={{ background: "linear-gradient(90deg,#4ecdc4,#6bcb77,#ffd93d)" }} />
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex flex-1 gap-5 px-5 pb-5 overflow-hidden">

        {/* Left: Lobby + Tables */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Lobby */}
          <div className="glass px-5 py-3 flex items-center gap-4 flex-shrink-0"
            style={{ border: "1px solid rgba(78,205,196,0.2)" }}>
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 flex-shrink-0">
              <Users size={14} /> LOBBY ({lobby.length})
            </div>
            <div className="flex gap-4 overflow-x-auto">
              {lobby.length === 0
                ? <span className="text-gray-600 text-xs italic">Nobody waiting…</span>
                : lobby.map(g => (
                  <motion.div key={g.id} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="relative w-12 h-14 rounded-t-full overflow-hidden bg-white shadow-md"
                      style={{ border: `2px solid ${g.patience > 60 ? "#4ecdc4" : g.patience > 30 ? "#ffd93d" : "#ff6b6b"}` }}>
                      <Image src={g.sprite} alt="" fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span style={{ fontSize: "0.6rem" }}>👥</span>
                      <span className="text-xs font-bold text-white">×{g.size}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[0,1,2].map(h => (
                        <span key={h} style={{ fontSize: "0.55rem", filter: h < g.hearts ? "none" : "grayscale(1) opacity(0.2)" }}>❤️</span>
                      ))}
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Tables grid */}
          <div className="flex-1 flex justify-center items-center gap-4 flex-wrap content-center overflow-y-auto">
            {tables.map(table => {
              const meta = statusMeta[table.status];
              const clickable = isClickable(table);
              const c = table.customer;
              const isLarge = table.size === 4;

              return (
                <motion.div key={table.id}
                  className={`table-card ${table.status}`}
                  style={{
                    width: isLarge ? 220 : 180,
                    height: isLarge ? 300 : 260,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "flex-end",
                    position: "relative", padding: 10,
                    cursor: clickable ? "pointer" : "default",
                  }}
                  whileHover={clickable ? { scale: 1.05, y: -4 } : {}}
                  whileTap={clickable ? { scale: 0.96 } : {}}
                  onClick={() => handleTable(table.id)}
                >
                  {/* Size badge */}
                  <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-lg text-xs font-black"
                    style={{ background: isLarge ? "rgba(167,139,250,0.3)" : "rgba(78,205,196,0.3)", color: isLarge ? "#a78bfa" : "#4ecdc4" }}>
                    {isLarge ? "🛋️" : "🪑"}×{table.size}
                  </div>

                  {/* Action badge */}
                  {clickable && (
                    <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                      className="absolute top-2 right-2 z-20 px-2 py-1 rounded-lg font-black text-xs flex items-center gap-1"
                      style={{ background: meta.color, color: "#000", boxShadow: `0 0 12px ${meta.color}99` }}>
                      {meta.emoji} {table.status === "empty" ? "SEAT" : meta.text.split(" ")[0]}
                    </motion.div>
                  )}

                  {/* Patience bar */}
                  {c && ["seated","waiting"].includes(table.status) && (
                    <div className="absolute top-10 left-2 right-2 z-10">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs font-bold text-white">{c.name} ×{c.size}</span>
                        <div className="flex gap-0.5">
                          {[0,1,2].map(h => (
                            <span key={h} style={{ fontSize: "0.55rem", filter: h < c.hearts ? "none" : "grayscale(1) opacity(0.2)" }}>❤️</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ height: 4, borderRadius: 9, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 9, width: `${c.patience}%`, transition: "width 0.4s",
                          background: c.patience > 60 ? "#6bcb77" : c.patience > 30 ? "#ffd93d" : "#ff6b6b" }} />
                      </div>
                    </div>
                  )}

                  {/* Order icon */}
                  {c && ["seated","waiting"].includes(table.status) && (
                    <div className="absolute top-[78px] right-2 z-10">
                      <div className="relative w-10 h-10 bg-white rounded-lg shadow-md p-1">
                        <Image src={DISHES[c.order].image} alt="" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                      </div>
                    </div>
                  )}

                  {/* Customer / eating / dirty */}
                  <div className="flex-1 flex flex-col items-center justify-end w-full pb-2 relative">
                    {c && !["empty","dirty"].includes(table.status) ? (
                      <div className="flex flex-col items-center">
                        <div className="relative rounded-t-full bg-white shadow-xl overflow-hidden"
                          style={{ width: isLarge ? 120 : 100, height: isLarge ? 160 : 135, border: `2px solid ${meta.color}` }}>
                          <Image src={c.sprite} alt="" fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
                          {c.size > 1 && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-black text-white border border-gray-600">
                              +{c.size - 1}
                            </div>
                          )}
                        </div>
                        {table.status === "eating" && (
                          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                            className="relative bg-white rounded-full border-2 border-green-400 shadow-lg p-1 -mt-1 flex-shrink-0"
                            style={{ width: 40, height: 40 }}>
                            <Image src={DISHES[c.order].image} alt="" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                          </motion.div>
                        )}
                      </div>
                    ) : table.status === "dirty" ? (
                      <motion.div animate={{ rotate: [0,10,-10,0] }} transition={{ repeat: Infinity, duration: 1 }}
                        className="flex flex-col items-center gap-1">
                        <span style={{ fontSize: "2.5rem" }}>🧽</span>
                        <span className="text-xs font-black text-red-400">Clean!</span>
                      </motion.div>
                    ) : (
                      <div className="opacity-20 flex flex-col items-center gap-1">
                        <span style={{ fontSize: isLarge ? "2rem" : "1.8rem" }}>{isLarge ? "🛋️" : "🪑"}</span>
                        {lobby.some(g => g.size <= table.size) && (
                          <span className="text-xs font-bold text-teal-400 opacity-100">Tap!</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Table surface */}
                  <div className="w-full h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#78350f,#431407)", borderTop: "2px solid #b45309" }}>
                    <span className="text-amber-200/40 font-black text-xs">T{table.id}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Kitchen */}
        <div className="w-64 flex flex-col gap-3 flex-shrink-0">
          <h2 className="text-xs font-black tracking-widest text-gray-500 text-center">KITCHEN</h2>

          {/* Chefs */}
          {chefs.map(chef => (
            <div key={chef.id} className="glass p-3 flex items-center gap-3"
              style={{ border: `1px solid ${chef.busy ? "rgba(255,154,60,0.3)" : "rgba(255,107,107,0.15)"}` }}>
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white border-2 shadow-xl flex-shrink-0"
                style={{ borderColor: chef.busy ? "#ff9a3c" : "#ff6b6b", boxShadow: chef.busy ? "0 0 16px rgba(255,154,60,0.5)" : "none" }}>
                <Image src="/assets/chef_char.png" alt="Chef" fill className="object-cover object-top" style={{ mixBlendMode: "multiply" }} />
                {chef.busy && (
                  <motion.div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center"
                    animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 0.7 }}>
                    <Flame size={24} className="text-orange-300" />
                  </motion.div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black" style={{ color: chef.busy ? "#ff9a3c" : "#4b5563" }}>
                  Chef #{chef.id} {chef.busy ? "🔥" : "💤"}
                </p>
                {chef.busy && chef.dish && (
                  <>
                    <p className="text-xs text-gray-400 truncate">{DISHES[chef.dish]?.emoji} {DISHES[chef.dish]?.name}</p>
                    <div className="progress-bar w-full mt-1" style={{ height: 4 }}>
                      <motion.div className="progress-fill"
                        initial={{ width: "0%" }} animate={{ width: "100%" }}
                        transition={{ duration: cookTime / 1000, ease: "linear" }}
                        style={{ background: "linear-gradient(90deg,#ff9a3c,#ffd93d)" }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Kitchen queue */}
          <div className="glass p-3 flex flex-col gap-2" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-xs font-black tracking-widest text-gray-500">QUEUE ({kitchenQueue.length})</h3>
            <div className="flex flex-wrap gap-2">
              {kitchenQueue.length === 0
                ? <span className="text-gray-600 text-xs italic">Empty</span>
                : kitchenQueue.map((d, i) => (
                  <div key={i} className="relative w-10 h-10 bg-white rounded-lg p-1 shadow-sm"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Image src={DISHES[d].image} alt="" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                  </div>
                ))
              }
            </div>
          </div>

          {/* Ready tray */}
          <div className="glass flex-1 p-3 flex flex-col gap-2"
            style={{ border: "1px solid rgba(107,203,119,0.2)", minHeight: 80 }}>
            <h3 className="text-xs font-black tracking-widest text-gray-500 flex items-center gap-1">
              <Utensils size={11} /> READY ({ready.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {ready.length === 0
                ? <span className="text-gray-600 text-xs italic">Nothing yet</span>
                : ready.map((d, i) => (
                  <motion.div key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="relative w-12 h-12 bg-white rounded-xl p-1 shadow-lg"
                    style={{ border: "2px solid #6bcb77", boxShadow: "0 0 10px rgba(107,203,119,0.4)" }}>
                    <Image src={DISHES[d].image} alt="" fill className="object-contain" style={{ mixBlendMode: "multiply" }} />
                    <span className="absolute -top-1.5 -right-1.5 text-xs">✅</span>
                  </motion.div>
                ))
              }
            </div>
          </div>

          {/* Quick guide */}
          <div className="glass p-3 text-xs text-gray-500 flex flex-col gap-0.5"
            style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
            <p>🪑 Empty → <strong className="text-teal-400">Seat group</strong></p>
            <p>📋 Seated → <strong className="text-yellow-400">Take order</strong></p>
            <p>🍽️ Waiting → <strong className="text-purple-400">Serve dish</strong></p>
            <p>💰 After eating → <strong className="text-green-400">Collect</strong></p>
          </div>
        </div>
      </div>

      {/* Floating tip */}
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-4 rounded-2xl font-black text-xl pointer-events-none"
            style={{ background: "rgba(0,0,0,0.85)", color: tip.color, border: `2px solid ${tip.color}44`, backdropFilter: "blur(12px)" }}
          >
            {tip.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win / Lose modal */}
      <AnimatePresence>
        {(won || gameOver) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.45 }}
              className="glass flex flex-col items-center gap-5 p-10 max-w-md w-full mx-6"
              style={{ border: `2px solid ${won ? "#6bcb77" : "#ff6b6b"}`, boxShadow: `0 0 60px ${won ? "rgba(107,203,119,0.4)" : "rgba(255,107,107,0.4)"}` }}>
              <div style={{ fontSize: "4rem" }}>{won ? "🏆" : "😰"}</div>
              <h2 className="title-font text-center" style={{ fontSize: "2rem", color: won ? "#6bcb77" : "#ff6b6b" }}>
                {won ? "LEVEL COMPLETE!" : "TIME'S UP!"}
              </h2>
              <p className="text-gray-300 text-center text-sm">
                {won ? `You earned $${score}! +${levelCfg.reward} coins added to your shop fund!` : `Earned $${score} out of $${levelCfg.targetScore}.`}
              </p>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    style={{ fontSize: "2rem", filter: score >= i * levelCfg.targetScore / 3 ? "none" : "grayscale(1) opacity(0.2)" }}>
                    ⭐
                  </motion.span>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="px-5 py-3 rounded-xl font-black text-sm"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af", cursor: "pointer" }}>
                  ← Level Select
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
