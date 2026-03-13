// ─── Base game types ─────────────────────────────────────────────────────────
export type Ingredient = { id: string; name: string; image: string; emoji: string; color: string };
export type Dish       = { id: string; name: string; image: string; recipe: string[]; price: number; emoji: string; description: string };
export type Level      = { level: number; targetDish: string; instructions: string; chefTip: string };

// ─── Ingredients ─────────────────────────────────────────────────────────────
export const INGREDIENTS: Record<string, Ingredient> = {
  dough:       { id: "dough",       name: "Dough",        image: "/assets/ingredient_dough.png",             emoji: "🫓", color: "#f5d98a" },
  tomato:      { id: "tomato",      name: "Tomato Sauce",  image: "/assets/ingredient_tomato.png",            emoji: "🍅", color: "#ef4444" },
  cheese:      { id: "cheese",      name: "Cheese",        image: "/assets/ingredient_cheese.png",            emoji: "🧀", color: "#fbbf24" },
  bun:         { id: "bun",         name: "Burger Bun",    image: "/assets/ingr_bun_top_1772787942084.png",   emoji: "🫓", color: "#d97706" },
  patty:       { id: "patty",       name: "Beef Patty",    image: "/assets/ingr_meat_patty_1772787881249.png",emoji: "🥩", color: "#92400e" },
  lettuce:     { id: "lettuce",     name: "Lettuce",       image: "/assets/ingr_lettuce_leaf_1772787929115.png",emoji: "🥬", color: "#22c55e" },
  cheeseSlice: { id: "cheeseSlice", name: "Cheese Slice",  image: "/assets/ingr_cheese_slice_1772787900760.png",emoji: "🧀", color: "#eab308" },
  tomatoSlice: { id: "tomatoSlice", name: "Tomato Slice",  image: "/assets/ingr_tomato_slice_1772787915652.png",emoji: "🍅", color: "#ef4444" },
};

export const DISHES: Record<string, Dish> = {
  pizza:  { id:"pizza",  name:"Nano Pizza",    image:"/assets/food_pizza.png",                 recipe:["dough","tomato","cheese"],           price:15, emoji:"🍕", description:"A cheesy classic!" },
  burger: { id:"burger", name:"Mega Burger",   image:"/assets/food_burger_1772787725552.png",   recipe:["bun","patty","lettuce"],             price:20, emoji:"🍔", description:"Stack of deliciousness!" },
  salad:  { id:"salad",  name:"Fresh Salad",   image:"/assets/food_salad_1772787778806.png",    recipe:["lettuce","tomatoSlice","cheeseSlice"],price:12, emoji:"🥗", description:"Light and healthy!" },
  pasta:  { id:"pasta",  name:"Pasta Special", image:"/assets/food_pasta_1772787761527.png",    recipe:["dough","tomato","cheeseSlice"],       price:18, emoji:"🍝", description:"Rich and creamy!" },
};

export const STEP_BY_STEP_LEVELS: Level[] = [
  { level:1, targetDish:"pizza",  instructions:"Bake a Nano Pizza! Dough → Tomato → Cheese",  chefTip:"Add in order — wrong ingredient = lose a star!" },
  { level:2, targetDish:"burger", instructions:"Stack a Mega Burger! Bun → Patty → Lettuce",   chefTip:"Build from the bottom up!" },
  { level:3, targetDish:"salad",  instructions:"Toss a Salad! Lettuce → Tomato → Cheese Slice",chefTip:"Fresh ingredients, fresh mind!" },
  { level:4, targetDish:"pasta",  instructions:"Cook Pasta! Dough → Tomato → Cheese Slice",    chefTip:"Al dente — don't overcook!" },
];

// ─── Career mode ─────────────────────────────────────────────────────────────
export type TableSize = 2 | 4;

export interface TableConfig {
  id: number;
  size: TableSize;   // seats 2 or 4 people
}

export interface CareerLevelConfig {
  level: number;
  label: string;
  description: string;
  baseTables: TableConfig[];
  targetScore: number;
  timeLimit: number;      // seconds
  baseCookTime: number;   // ms
  basePatienceDrain: number; // per 400ms tick
  arrivalInterval: number;   // ms between guest arrivals
  reward: number;            // coins awarded on completion
}

// ──────────────────────────────────────────────────────────────────────────────
// 100-level generator — smooth difficulty curve
// ──────────────────────────────────────────────────────────────────────────────

const MILESTONE_LABELS: Partial<Record<number, [string, string]>> = {
   1:  ["Grand Opening",       "Your very first day! Take it easy."],
   5:  ["Word Gets Out",       "Reviews are in — guests are coming!"],
  10:  ["Lunch Crowd",         "Midday diners packing in."],
  15:  ["Weekend Buzz",        "Saturday vibes. Stay on your toes!"],
  20:  ["Food Blogger Visit",  "A famous blogger is at table 3!"],
  25:  ["Prime Time",          "Peak dinner service begins."],
  30:  ["Rainy Day Rush",      "Everyone chose tonight to eat out."],
  35:  ["Festival Season",     "The block party spills into your restaurant."],
  40:  ["Celebrity Sighting",  "Is that… a celebrity? You better deliver!"],
  45:  ["Double Shift",        "Staff called in sick. You're doing it all."],
  50:  ["Halfway Hero",        "50 levels down! The real challenge begins."],
  55:  ["VIP Reservation",     "Their expectations are sky-high."],
  60:  ["Food Network Scout",  "A producer is watching every move."],
  65:  ["Citywide Hunger",     "The other restaurants are closed today."],
  70:  ["Championship Prelim", "Competing against the best in the city."],
  75:  ["Michelin Inspector",  "One wrong move loses the star."],
  80:  ["Iron Chef Night",     "Prove you belong among legends."],
  85:  ["Sold-Out Show",       "Every seat booked 2 weeks in advance."],
  90:  ["Grand Finale Prep",   "The last push before the championship."],
  95:  ["Hall of Fame",        "Only the elite have made it this far."],
 100:  ["LEGENDARY CHEF",      "Level 100. You are the greatest chef alive."],
};

function generateCareerLevel(n: number): CareerLevelConfig {
  // t: 0 → 1, gentle start (power < 1 = slow start, steeper finish)
  const t = Math.pow((n - 1) / 99, 0.8);

  // Target score: $55 → ~$20 000 (exponential feel)
  const targetScore = Math.round(55 * Math.pow(380, t));

  // Timer: 180s (3 min) → 240s (4 min)
  const timeLimit = Math.round(180 + t * 60);

  // Cook time: 3000ms → 1000ms
  const baseCookTime = Math.round(3000 - t * 2000);

  // Patience drain: 0.35 → 2.5 per 400ms tick
  const basePatienceDrain = Math.round((0.35 + t * 2.15) * 100) / 100;

  // Arrival interval: 11 000ms → 2 800ms
  const arrivalInterval = Math.round(11000 - t * 8200);

  // Reward: 50 → 900 coins
  const reward = Math.round(50 + t * 850);

  // Tables: grow every ~10 levels, capped
  const numSmall = Math.min(1 + Math.floor((n - 1) / 10), 6);
  const numLarge = Math.min(1 + Math.floor((n - 1) / 8),  10);
  const baseTables: TableConfig[] = [];
  let tid = 1;
  for (let i = 0; i < numSmall; i++) baseTables.push({ id: tid++, size: 2 });
  for (let i = 0; i < numLarge; i++) baseTables.push({ id: tid++, size: 4 });

  const [label, description] = MILESTONE_LABELS[n] ?? [
    `Stage ${n}`,
    n < 30  ? "Getting busier — keep your cool!"
    : n < 60 ? "No time to rest. Keep those tables turning!"
    : n < 85 ? "Every second counts. Don't drop the ball!"
               : "Only legends survive these shifts.",
  ];

  return {
    level: n, label, description, baseTables,
    targetScore, timeLimit, baseCookTime, basePatienceDrain, arrivalInterval, reward,
  };
}

export const CAREER_LEVELS: CareerLevelConfig[] = Array.from(
  { length: 100 },
  (_, i) => generateCareerLevel(i + 1)
);


// ─── Shop catalogue ───────────────────────────────────────────────────────────
export interface ShopItem {
  id: string;
  category: "table" | "chef" | "upgrade";
  label: string;
  description: string;
  emoji: string;
  maxLevel: number;           // how many times this can be bought (or added)
  costs: number[];            // cost[i] = price of upgrade from level i to i+1
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── Tables ───────────────────────────────────────────────────────────────
  {
    id: "small_table", category: "table", emoji: "🪑",
    label: "Small Table (2-seat)",
    description: "Add a cozy 2-seat table. Faster turnaround!",
    maxLevel: 3, costs: [50, 70, 90],
  },
  {
    id: "large_table", category: "table", emoji: "🛋️",
    label: "Large Table (4-seat)",
    description: "Add a roomy 4-seat table. Bigger groups = bigger tips!",
    maxLevel: 3, costs: [80, 100, 130],
  },
  // ── Chefs ────────────────────────────────────────────────────────────────
  {
    id: "extra_chef", category: "chef", emoji: "👨‍🍳",
    label: "Hire Extra Chef",
    description: "Each chef cooks one order at a time simultaneously!",
    maxLevel: 2, costs: [120, 200],
  },
  // ── Upgrades ─────────────────────────────────────────────────────────────
  {
    id: "cook_speed", category: "upgrade", emoji: "⚡",
    label: "Chef Speed Boost",
    description: "Reduce cook time by 20% per tier.",
    maxLevel: 3, costs: [40, 70, 110],
  },
  {
    id: "patience", category: "upgrade", emoji: "💛",
    label: "Patient Guests",
    description: "Customers wait 25% longer per tier.",
    maxLevel: 3, costs: [35, 65, 100],
  },
  {
    id: "extra_time", category: "upgrade", emoji: "⏱️",
    label: "Extra Time (+30s)",
    description: "+30 seconds added to every level timer.",
    maxLevel: 3, costs: [45, 75, 120],
  },
];

// ─── Misc shared lists ────────────────────────────────────────────────────────
export const CUSTOMER_NAMES   = ["Akira","Sakura","Hana","Kenji","Yuki","Momo","Riku","Nana","Sora","Taro"];
export const CUSTOMER_SPRITES = [
  "/assets/customer_char.png",
  "/assets/customer_variant_1_1772787643564.png",
  "/assets/customer_variant_2_1772787661295.png",
  "/assets/customer_variant_3_1772787675752.png",
];
