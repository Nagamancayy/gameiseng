export type Ingredient = {
  id: string;
  name: string;
  image: string;
  emoji: string;
  color: string;
};

export type Dish = {
  id: string;
  name: string;
  image: string;
  recipe: string[];
  price: number;
  emoji: string;
  description: string;
};

export type Level = {
  level: number;
  targetDish: string;
  instructions: string;
  chefTip: string;
};

export const INGREDIENTS: Record<string, Ingredient> = {
  dough:  { id: "dough",  name: "Dough",        image: "/assets/ingredient_dough.png",  emoji: "🫓", color: "#f5d98a" },
  tomato: { id: "tomato", name: "Tomato Sauce",  image: "/assets/ingredient_tomato.png", emoji: "🍅", color: "#ef4444" },
  cheese: { id: "cheese", name: "Cheese",        image: "/assets/ingredient_cheese.png", emoji: "🧀", color: "#fbbf24" },
  bun:    { id: "bun",    name: "Burger Bun",    image: "/assets/ingr_bun_top_1772787942084.png", emoji: "🫓", color: "#d97706" },
  patty:  { id: "patty",  name: "Beef Patty",    image: "/assets/ingr_meat_patty_1772787881249.png", emoji: "🥩", color: "#92400e" },
  lettuce:{ id: "lettuce",name: "Lettuce",       image: "/assets/ingr_lettuce_leaf_1772787929115.png", emoji: "🥬", color: "#22c55e" },
  cheeseSlice: { id: "cheeseSlice", name: "Cheese Slice", image: "/assets/ingr_cheese_slice_1772787900760.png", emoji: "🧀", color: "#eab308" },
  tomatoSlice: { id: "tomatoSlice", name: "Tomato Slice", image: "/assets/ingr_tomato_slice_1772787915652.png",  emoji: "🍅", color: "#ef4444" },
};

export const DISHES: Record<string, Dish> = {
  pizza: {
    id: "pizza", name: "Nano Pizza",
    image: "/assets/food_pizza.png",
    recipe: ["dough", "tomato", "cheese"],
    price: 15, emoji: "🍕",
    description: "A cheesy classic with crispy dough!",
  },
  burger: {
    id: "burger", name: "Mega Burger",
    image: "/assets/food_burger_1772787725552.png",
    recipe: ["bun", "patty", "lettuce"],
    price: 20, emoji: "🍔",
    description: "A towering stack of pure deliciousness!",
  },
  salad: {
    id: "salad", name: "Fresh Salad",
    image: "/assets/food_salad_1772787778806.png",
    recipe: ["lettuce", "tomatoSlice", "cheeseSlice"],
    price: 12, emoji: "🥗",
    description: "Light, fresh and healthy!",
  },
  pasta: {
    id: "pasta", name: "Pasta Special",
    image: "/assets/food_pasta_1772787761527.png",
    recipe: ["dough", "tomato", "cheeseSlice"],
    price: 18, emoji: "🍝",
    description: "Rich and creamy with a twist!",
  },
};

export const STEP_BY_STEP_LEVELS: Level[] = [
  {
    level: 1,
    targetDish: "pizza",
    instructions: "Let's bake a Nano Pizza! Add Dough → Tomato Sauce → Cheese in order!",
    chefTip: "Press each ingredient in order! Wrong ingredient = penalty star ⭐",
  },
  {
    level: 2,
    targetDish: "burger",
    instructions: "Stack a Mega Burger! Bun → Beef Patty → Lettuce!",
    chefTip: "Burgers need layers! Build from the bottom up!",
  },
  {
    level: 3,
    targetDish: "salad",
    instructions: "Toss a Fresh Salad! Lettuce → Tomato Slice → Cheese Slice!",
    chefTip: "Salads are art! Add each ingredient with love!",
  },
  {
    level: 4,
    targetDish: "pasta",
    instructions: "Cook Pasta Special! Dough → Tomato Sauce → Cheese Slice!",
    chefTip: "Al dente! Don't overcook your masterpiece!",
  },
];

export const CUSTOMER_NAMES = ["Akira", "Sakura", "Hana", "Kenji", "Yuki", "Momo"];
export const CUSTOMER_SPRITES = [
  "/assets/customer_char.png",
  "/assets/customer_variant_1_1772787643564.png",
  "/assets/customer_variant_2_1772787661295.png",
  "/assets/customer_variant_3_1772787675752.png",
];

export const RESTAURANT_LEVELS = [
  { level: 1, targetMoney: 100, timeLimit: 120, description: "Soft opening! 2 tables" },
  { level: 2, targetMoney: 250, timeLimit: 90,  description: "Weekend rush! 3 tables" },
  { level: 3, targetMoney: 500, timeLimit: 80,  description: "Full house! More customers!" },
];
