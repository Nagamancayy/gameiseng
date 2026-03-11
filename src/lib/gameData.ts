export type Ingredient = {
  id: string;
  name: string;
  image: string;
};

export type Dish = {
  id: string;
  name: string;
  image: string;
  recipe: string[]; // array of ingredient IDs
};

export const INGREDIENTS: Record<string, Ingredient> = {
  dough: { id: "dough", name: "Dough", image: "/assets/ingredient_dough.png" },
  tomato: { id: "tomato", name: "Tomato Sauce", image: "/assets/ingredient_tomato.png" },
  cheese: { id: "cheese", name: "Cheese", image: "/assets/ingredient_cheese.png" },
};

export const DISHES: Record<string, Dish> = {
  pizza: {
    id: "pizza",
    name: "Classic Pizza",
    image: "/assets/food_pizza.png",
    recipe: ["dough", "tomato", "cheese"],
  },
};

export const STEP_BY_STEP_LEVELS = [
  {
    level: 1,
    targetDish: "pizza",
    instructions: "Let's make a Classic Pizza! First, we need Dough. Then add Tomato Sauce. Finally, add Cheese!",
  },
];
