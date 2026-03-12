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

export const CAREER_LEVELS: CareerLevelConfig[] = [
  {
    level: 1, label: "Grand Opening", description: "Your first day! Nice and easy.",
    baseTables: [{ id:1, size:2 },{ id:2, size:4 }],
    targetScore: 80,  timeLimit: 100, baseCookTime: 3000, basePatienceDrain: 0.6, arrivalInterval: 9000, reward: 60,
  },
  {
    level: 2, label: "Word Gets Out", description: "More guests are coming!",
    baseTables: [{ id:1, size:2 },{ id:2, size:4 },{ id:3, size:4 }],
    targetScore: 180, timeLimit: 110, baseCookTime: 2800, basePatienceDrain: 0.8, arrivalInterval: 7500, reward: 80,
  },
  {
    level: 3, label: "Lunch Rush", description: "Midday madness begins.",
    baseTables: [{ id:1, size:2 },{ id:2, size:2 },{ id:3, size:4 },{ id:4, size:4 }],
    targetScore: 320, timeLimit: 115, baseCookTime: 2500, basePatienceDrain: 1.0, arrivalInterval: 6500, reward: 100,
  },
  {
    level: 4, label: "Friday Night", description: "Weekend warriors flood in.",
    baseTables: [{ id:1, size:2 },{ id:2, size:2 },{ id:3, size:4 },{ id:4, size:4 },{ id:5, size:4 }],
    targetScore: 520, timeLimit: 120, baseCookTime: 2200, basePatienceDrain: 1.2, arrivalInterval: 5500, reward: 130,
  },
  {
    level: 5, label: "Food Critic Visit", description: "A famous critic arrives today!",
    baseTables: [{ id:1, size:2 },{ id:2, size:2 },{ id:3, size:2 },{ id:4, size:4 },{ id:5, size:4 },{ id:6, size:4 }],
    targetScore: 780, timeLimit: 120, baseCookTime: 2000, basePatienceDrain: 1.4, arrivalInterval: 5000, reward: 160,
  },
  {
    level: 6, label: "Peak Season", description: "Holiday crowds are brutal.",
    baseTables: [{ id:1, size:2 },{ id:2, size:2 },{ id:3, size:2 },{ id:4, size:4 },{ id:5, size:4 },{ id:6, size:4 },{ id:7, size:4 }],
    targetScore: 1100, timeLimit: 125, baseCookTime: 1800, basePatienceDrain: 1.6, arrivalInterval: 4500, reward: 200,
  },
  {
    level: 7, label: "Championship Round", description: "Competing for best restaurant!",
    baseTables: [{ id:1, size:2 },{ id:2, size:2 },{ id:3, size:2 },{ id:4, size:2 },{ id:5, size:4 },{ id:6, size:4 },{ id:7, size:4 },{ id:8, size:4 }],
    targetScore: 1500, timeLimit: 125, baseCookTime: 1600, basePatienceDrain: 1.8, arrivalInterval: 4000, reward: 250,
  },
  {
    level: 8, label: "Michelin Star", description: "The ultimate test. Legendary difficulty.",
    baseTables: [{ id:1, size:2 },{ id:2, size:2 },{ id:3, size:2 },{ id:4, size:2 },{ id:5, size:4 },{ id:6, size:4 },{ id:7, size:4 },{ id:8, size:4 },{ id:9, size:4 }],
    targetScore: 2200, timeLimit: 130, baseCookTime: 1400, basePatienceDrain: 2.2, arrivalInterval: 3500, reward: 350,
  },
];

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
