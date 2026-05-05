import type { Discipline, Goal, Level, Meal, MealSlot, Variant } from "@/lib/types";

/* ---------------------------------------------------------------------------
 * THEMED HALAL MEAL LIBRARY (no pork, no alcohol)
 *
 * Recipes are tagged by:
 *   - theme:   "lean" | "muscle" | "endurance"   (derived from discipline)
 *   - goal:    "lose" | "gain"
 *   - variant: 1 | 2 | 3                          (3 distinct meal tracks)
 *   - level:   "beginner" | "intermediate" | "advanced" (controls complexity)
 *
 * Theme map:
 *   yoga, pilates                    -> "lean"      (Lean & Flexible)
 *   beginnerStrength, bodyweight     -> "muscle"    (Muscle Growth & Recovery)
 *   fatLoss, homeNoEquip             -> "endurance" (Endurance & Energy)
 *
 * Per theme × goal × variant we author a 7-day cycle of breakfast/lunch/dinner
 * (distinct cores). Snacks are a shared theme-level pool (rotated).
 * Option B (the swap) is the same slot from the NEXT variant in the same
 * theme/goal — guaranteeing the alternative truly differs.
 * ------------------------------------------------------------------------- */

export type Theme = "lean" | "muscle" | "endurance";

export function themeFor(discipline: Discipline): Theme {
  switch (discipline) {
    case "yoga":
    case "pilates":
      return "lean";
    case "beginnerStrength":
    case "bodyweight":
      return "muscle";
    case "powerbuilding":
      // Power & Build — high-protein, high-calorie (beef, eggs, oats, potatoes).
      return "muscle";
    case "fatLoss":
    case "homeNoEquip":
      return "endurance";
    case "cardioHiit":
      // Burn & Energy — high-fiber, moderate-carb (chicken, quinoa, veg).
      return "endurance";
  }
}

type Slot = Meal["slot"];

interface MealTpl {
  slot: Slot;
  title: string;
  pct: number;            // share of daily kcal
  ingredients: string[];  // full (advanced) ingredient list
  steps: string[];        // full (advanced) step list
}

const m = (
  slot: Slot,
  title: string,
  pct: number,
  ingredients: string[],
  steps: string[],
): MealTpl => ({ slot, title, pct, ingredients, steps });

/* ============================================================================
 * LEAN & FLEXIBLE  (yoga / pilates)
 * Light, digestion-friendly, lean proteins (fish, turkey, eggs), healthy fats.
 * ========================================================================== */

// --- LEAN · LOSE ---
const leanLose: Record<Variant, MealTpl[][]> = {
  1: [
    [
      m("breakfast", "Spinach & Egg-White Scramble", 0.25,
        ["3 egg whites + 1 whole egg", "2 cups spinach", "1 slice sprouted-grain toast", "1 tsp olive oil"],
        ["Sauté spinach in oil 1 min.", "Pour eggs in and scramble gently.", "Toast bread; serve eggs on top."]),
      m("lunch", "Lemon Turkey & Quinoa Bowl", 0.35,
        ["150 g turkey breast", "3/4 cup cooked quinoa", "1 cup cucumber", "1 cup cherry tomatoes", "Lemon, oregano"],
        ["Season turkey with oregano, lemon; grill 4 min per side.", "Toss veg with quinoa and lemon.", "Slice turkey on top."]),
      m("dinner", "Baked Cod & Asparagus", 0.30,
        ["170 g cod", "2 cups asparagus", "1 lemon", "1 tsp olive oil"],
        ["Oven 200 °C.", "Bake cod + asparagus with lemon and oil 12 min."]),
    ],
    [
      m("breakfast", "Berry Yoghurt Bowl", 0.25,
        ["1 cup Greek yoghurt 2%", "1/2 cup blueberries", "1 tbsp chia"],
        ["Combine and serve."]),
      m("lunch", "Turkey & Avocado Lettuce Wraps", 0.35,
        ["150 g sliced turkey breast", "4 large lettuce leaves", "1/2 avocado", "1 tomato"],
        ["Layer turkey, avocado and tomato in lettuce.", "Roll and serve."]),
      m("dinner", "Lemon Sole & Zucchini", 0.30,
        ["170 g sole fillet", "2 cups zucchini ribbons", "Garlic, lemon"],
        ["Pan-sear sole 2 min per side.", "Sauté zucchini with garlic 3 min."]),
    ],
    [
      m("breakfast", "Cottage Cheese & Pear", 0.25,
        ["1 cup low-fat cottage cheese", "1 sliced pear", "Cinnamon"],
        ["Top cottage cheese with pear and cinnamon."]),
      m("lunch", "Tuna & White-Bean Salad", 0.35,
        ["1 can tuna in water", "3/4 cup white beans", "1 cup arugula", "Lemon, olive oil"],
        ["Drain tuna and beans; toss with arugula.", "Dress with lemon and oil."]),
      m("dinner", "Herb Salmon & Steamed Greens", 0.30,
        ["150 g salmon", "2 cups bok choy or spinach", "Dill, lemon"],
        ["Bake salmon with dill 200 °C, 10 min.", "Steam greens 3 min."]),
    ],
    [
      m("breakfast", "Herb Omelette & Tomato", 0.25,
        ["3 eggs (1 yolk)", "Parsley, chives", "1 sliced tomato"],
        ["Whisk eggs with herbs.", "Cook in nonstick pan, fold.", "Serve with tomato."]),
      m("lunch", "Mediterranean Chickpea Bowl", 0.35,
        ["1 cup chickpeas", "1 cup cucumber", "1/2 cup cherry tomatoes", "2 tbsp feta", "Lemon, mint"],
        ["Combine all with lemon and mint."]),
      m("dinner", "Lemon Cod Tacos (lettuce)", 0.30,
        ["150 g cod", "4 lettuce leaves", "1/2 cup shredded cabbage", "Lime"],
        ["Bake cod 200 °C, 10 min.", "Flake into lettuce with cabbage and lime."]),
    ],
    [
      m("breakfast", "Spinach & Egg-White Scramble", 0.25,
        ["3 egg whites + 1 whole egg", "2 cups spinach", "1 slice sprouted-grain toast"],
        ["Repeat Mon."]),
      m("lunch", "Lemon Turkey & Quinoa Bowl", 0.35,
        ["150 g turkey", "3/4 cup quinoa", "Cucumber, tomato"],
        ["Repeat Mon."]),
      m("dinner", "White Fish & Cabbage Slaw", 0.30,
        ["170 g tilapia", "2 cups cabbage", "Lemon, olive oil, dill"],
        ["Pan-sear fish 3 min per side.", "Toss cabbage with lemon and oil."]),
    ],
    [
      m("breakfast", "Berry Yoghurt Bowl", 0.25,
        ["1 cup Greek yoghurt", "1/2 cup berries", "1 tbsp chia"],
        ["Combine and serve."]),
      m("lunch", "Turkey & Avocado Lettuce Wraps", 0.35,
        ["150 g turkey", "Lettuce", "1/2 avocado"],
        ["Repeat Tue."]),
      m("dinner", "Shrimp & Spinach Sauté", 0.30,
        ["170 g shrimp", "2 cups spinach", "Garlic, lemon, 1 tsp olive oil"],
        ["Sauté garlic 30 s.", "Add shrimp 3 min.", "Wilt spinach 1 min."]),
    ],
    [
      m("breakfast", "Cottage Cheese & Pear", 0.25,
        ["Cottage cheese", "Pear", "Cinnamon"], ["Repeat Wed."]),
      m("lunch", "Tuna & White-Bean Salad", 0.35,
        ["Tuna", "White beans", "Arugula"], ["Repeat Wed."]),
      m("dinner", "Herb Salmon & Steamed Greens", 0.30,
        ["Salmon", "Greens", "Dill"], ["Repeat Wed."]),
    ],
  ],
  2: [
    [
      m("breakfast", "Overnight Oats & Raspberries", 0.25,
        ["1/2 cup rolled oats", "3/4 cup almond milk", "1 tbsp chia", "1/2 cup raspberries"],
        ["Soak oats + chia in milk overnight.", "Top with raspberries."]),
      m("lunch", "Lentil & Cucumber Salad", 0.35,
        ["3/4 cup cooked lentils", "1 cup cucumber", "1/2 red onion", "Lemon-parsley dressing"],
        ["Toss lentils with veg and dressing."]),
      m("dinner", "Steamed Sea Bass & Bok Choy", 0.30,
        ["170 g sea bass", "2 cups bok choy", "Ginger, lime"],
        ["Steam bass with ginger 8 min.", "Steam bok choy 3 min.", "Finish with lime."]),
    ],
    [
      m("breakfast", "Whipped Ricotta & Berries", 0.25,
        ["3/4 cup ricotta", "1/2 cup mixed berries", "1 tsp honey"],
        ["Whip ricotta with fork.", "Top with berries and honey."]),
      m("lunch", "Turkey, Beet & Spinach Salad", 0.35,
        ["150 g turkey", "2 cups baby spinach", "1/2 cup roasted beets", "Walnuts, balsamic"],
        ["Slice turkey.", "Toss spinach, beets, walnuts.", "Top with turkey, dress."]),
      m("dinner", "Baked Trout & Fennel", 0.30,
        ["150 g trout", "1 fennel bulb sliced", "Lemon, olive oil"],
        ["Bake trout + fennel 200 °C, 12 min."]),
    ],
    [
      m("breakfast", "Veggie Frittata Slice", 0.25,
        ["2 eggs + 1 white", "1/2 cup zucchini", "1/4 cup feta"],
        ["Whisk eggs, fold in zucchini and feta.", "Bake in muffin tin 180 °C, 15 min."]),
      m("lunch", "Mackerel & Tomato Toast", 0.35,
        ["1 small can mackerel", "1 slice rye", "1 sliced tomato", "Lemon"],
        ["Top toast with mackerel and tomato.", "Squeeze lemon."]),
      m("dinner", "Halibut & Green Beans", 0.30,
        ["150 g halibut", "2 cups green beans", "Garlic"],
        ["Pan-sear halibut 3 min per side.", "Steam beans 4 min, toss with garlic."]),
    ],
    [
      m("breakfast", "Chia Almond Pudding", 0.25,
        ["3 tbsp chia", "1 cup almond milk", "1/2 banana", "Cinnamon"],
        ["Soak chia in milk overnight.", "Top with banana and cinnamon."]),
      m("lunch", "Egg-White & Avocado Toast", 0.35,
        ["4 egg whites", "1 slice rye", "1/2 avocado", "Chili flakes"],
        ["Cook egg whites flat.", "Smash avocado on toast.", "Top with eggs and chili."]),
      m("dinner", "Lemon-Herb Sole & Spinach", 0.30,
        ["170 g sole", "2 cups spinach", "Lemon, parsley"],
        ["Bake sole with herbs 200 °C, 8 min.", "Wilt spinach 2 min."]),
    ],
    [
      m("breakfast", "Overnight Oats & Raspberries", 0.25,
        ["Oats", "Almond milk", "Chia", "Raspberries"], ["Repeat Mon."]),
      m("lunch", "Lentil & Cucumber Salad", 0.35,
        ["Lentils", "Cucumber", "Onion"], ["Repeat Mon."]),
      m("dinner", "Tuna Steak & Zucchini", 0.30,
        ["150 g tuna steak", "2 cups zucchini", "Sesame seeds"],
        ["Sear tuna 1 min per side.", "Sauté zucchini 3 min.", "Sprinkle sesame."]),
    ],
    [
      m("breakfast", "Whipped Ricotta & Berries", 0.25,
        ["Ricotta", "Berries"], ["Repeat Tue."]),
      m("lunch", "Turkey, Beet & Spinach Salad", 0.35,
        ["Turkey", "Spinach", "Beets"], ["Repeat Tue."]),
      m("dinner", "Salmon & Asparagus Foil Pack", 0.30,
        ["150 g salmon", "2 cups asparagus", "Lemon, dill"],
        ["Wrap in foil, bake 200 °C, 12 min."]),
    ],
    [
      m("breakfast", "Veggie Frittata Slice", 0.25,
        ["Eggs", "Zucchini", "Feta"], ["Repeat Wed."]),
      m("lunch", "Mackerel & Tomato Toast", 0.35,
        ["Mackerel", "Rye", "Tomato"], ["Repeat Wed."]),
      m("dinner", "Halibut & Green Beans", 0.30,
        ["Halibut", "Green beans"], ["Repeat Wed."]),
    ],
  ],
  3: [
    [
      m("breakfast", "Smoked Salmon & Cucumber Toast", 0.25,
        ["50 g smoked salmon", "1 slice rye", "1/4 cucumber", "1 tsp cream cheese"],
        ["Spread cream cheese on rye.", "Layer salmon and cucumber."]),
      m("lunch", "Quinoa Tabbouleh with Shrimp", 0.35,
        ["120 g shrimp", "1/2 cup cooked quinoa", "1 cup parsley", "1/2 cup tomato", "Lemon"],
        ["Sauté shrimp 3 min.", "Toss quinoa with parsley, tomato, lemon.", "Top with shrimp."]),
      m("dinner", "Baked Branzino & Greens", 0.30,
        ["170 g branzino", "2 cups mixed greens", "Lemon, olive oil"],
        ["Bake branzino 200 °C, 12 min.", "Dress greens with lemon."]),
    ],
    [
      m("breakfast", "Kefir Berry Smoothie", 0.25,
        ["1 cup plain kefir", "1/2 cup berries", "1 tbsp ground flax"],
        ["Blend until smooth."]),
      m("lunch", "Turkey & Pomegranate Salad", 0.35,
        ["150 g turkey breast", "2 cups arugula", "1/4 cup pomegranate", "Walnuts"],
        ["Slice turkey, toss salad, top."]),
      m("dinner", "Steamed Cod with Ginger", 0.30,
        ["170 g cod", "2 cups Chinese broccoli", "Ginger, scallions"],
        ["Steam cod with ginger 8 min.", "Blanch greens 2 min."]),
    ],
    [
      m("breakfast", "Avocado & Egg Toast", 0.25,
        ["2 eggs", "1/2 avocado", "1 slice rye"],
        ["Poach eggs 3 min.", "Smash avocado on toast.", "Top with eggs."]),
      m("lunch", "Sardine & Tomato Bowl", 0.35,
        ["1 can sardines", "1/2 cup couscous", "1 sliced tomato", "Lemon, parsley"],
        ["Cook couscous.", "Top with sardines, tomato, lemon."]),
      m("dinner", "Herb Sea Bass & Spinach", 0.30,
        ["150 g sea bass", "2 cups spinach", "Garlic, lemon"],
        ["Pan-sear bass 3 min per side.", "Wilt spinach with garlic."]),
    ],
    [
      m("breakfast", "Greek Yoghurt Parfait", 0.25,
        ["1 cup yoghurt", "2 tbsp granola", "1/2 cup peach"],
        ["Layer yoghurt, granola, peach."]),
      m("lunch", "Tuna Niçoise (light)", 0.35,
        ["1 can tuna", "1 boiled egg", "1/2 cup green beans", "1 small potato", "Olives"],
        ["Boil egg, beans, potato.", "Plate with tuna and olives."]),
      m("dinner", "Lemon Shrimp & Cauliflower Rice", 0.30,
        ["150 g shrimp", "2 cups cauliflower rice", "Garlic, lemon"],
        ["Sauté shrimp 3 min.", "Stir-fry cauliflower rice 4 min."]),
    ],
    [
      m("breakfast", "Smoked Salmon & Cucumber Toast", 0.25,
        ["Smoked salmon", "Rye", "Cucumber"], ["Repeat Mon."]),
      m("lunch", "Quinoa Tabbouleh with Shrimp", 0.35,
        ["Shrimp", "Quinoa", "Parsley"], ["Repeat Mon."]),
      m("dinner", "Sole en Papillote", 0.30,
        ["170 g sole", "1 cup zucchini", "Lemon, herbs"],
        ["Wrap in parchment with veg and lemon.", "Bake 200 °C, 10 min."]),
    ],
    [
      m("breakfast", "Kefir Berry Smoothie", 0.25,
        ["Kefir", "Berries", "Flax"], ["Repeat Tue."]),
      m("lunch", "Turkey & Pomegranate Salad", 0.35,
        ["Turkey", "Arugula", "Pomegranate"], ["Repeat Tue."]),
      m("dinner", "Trout & Roasted Tomato", 0.30,
        ["150 g trout", "1 cup cherry tomatoes", "Thyme"],
        ["Roast tomatoes with thyme 200 °C, 12 min.", "Bake trout alongside 10 min."]),
    ],
    [
      m("breakfast", "Avocado & Egg Toast", 0.25,
        ["Eggs", "Avocado", "Rye"], ["Repeat Wed."]),
      m("lunch", "Sardine & Tomato Bowl", 0.35,
        ["Sardines", "Couscous", "Tomato"], ["Repeat Wed."]),
      m("dinner", "Herb Sea Bass & Spinach", 0.30,
        ["Sea bass", "Spinach"], ["Repeat Wed."]),
    ],
  ],
};

// --- LEAN · GAIN ---
const leanGain: Record<Variant, MealTpl[][]> = {
  1: [
    [
      m("breakfast", "Salmon & Avocado Bagel", 0.25,
        ["1 whole-grain bagel", "60 g smoked salmon", "1/2 avocado", "1 tbsp cream cheese"],
        ["Spread cream cheese on bagel.", "Top with avocado and salmon."]),
      m("lunch", "Turkey, Quinoa & Tahini Bowl", 0.35,
        ["170 g turkey breast", "1 cup cooked quinoa", "1 cup roasted veg", "2 tbsp tahini"],
        ["Grill turkey 5 min per side.", "Layer quinoa, veg, turkey.", "Drizzle tahini."]),
      m("dinner", "Baked Salmon & Sweet Potato", 0.30,
        ["180 g salmon", "1 medium sweet potato", "2 cups asparagus"],
        ["Bake everything 200 °C, 18 min."]),
    ],
    [
      m("breakfast", "Nut Butter Oats", 0.25,
        ["3/4 cup oats", "1 cup whole milk", "1 tbsp almond butter", "1/2 banana"],
        ["Cook oats in milk 5 min.", "Stir in nut butter, top with banana."]),
      m("lunch", "Turkey & Avocado Wrap", 0.35,
        ["170 g turkey", "1 large whole-grain wrap", "1/2 avocado", "Greens"],
        ["Layer and roll tightly."]),
      m("dinner", "Cod & Coconut Rice", 0.30,
        ["170 g cod", "3/4 cup rice cooked in light coconut milk", "2 cups bok choy"],
        ["Bake cod 12 min.", "Cook rice in coconut milk.", "Steam bok choy."]),
    ],
    [
      m("breakfast", "Cottage Cheese & Granola", 0.25,
        ["1 cup cottage cheese", "1/3 cup granola", "1 sliced peach"],
        ["Layer in bowl."]),
      m("lunch", "Tuna & White-Bean Pasta", 0.35,
        ["1 cup whole-grain pasta", "1 can tuna", "1/2 cup white beans", "Olive oil"],
        ["Cook pasta.", "Toss with tuna, beans, oil."]),
      m("dinner", "Salmon, Quinoa & Spinach", 0.30,
        ["170 g salmon", "3/4 cup quinoa", "2 cups spinach"],
        ["Bake salmon.", "Cook quinoa.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Egg, Avocado & Toast", 0.25,
        ["3 eggs", "1/2 avocado", "2 slices rye"],
        ["Scramble eggs.", "Smash avocado on toast.", "Top with eggs."]),
      m("lunch", "Mediterranean Chickpea & Couscous", 0.35,
        ["1 cup chickpeas", "3/4 cup couscous", "Cucumber, tomato, feta"],
        ["Cook couscous.", "Toss with chickpeas, veg, feta."]),
      m("dinner", "Lemon Cod Tacos", 0.30,
        ["170 g cod", "2 corn tortillas", "Slaw", "Lime"],
        ["Bake cod 10 min.", "Fill tortillas with cod and slaw."]),
    ],
    [
      m("breakfast", "Salmon & Avocado Bagel", 0.25,
        ["Bagel", "Salmon", "Avocado"], ["Repeat Mon."]),
      m("lunch", "Turkey, Quinoa & Tahini Bowl", 0.35,
        ["Turkey", "Quinoa", "Tahini"], ["Repeat Mon."]),
      m("dinner", "Halibut & Roasted Potato", 0.30,
        ["170 g halibut", "1 cup roasted baby potatoes", "2 cups green beans"],
        ["Roast potatoes 200 °C, 25 min.", "Bake halibut last 10 min.", "Steam beans."]),
    ],
    [
      m("breakfast", "Nut Butter Oats", 0.25,
        ["Oats", "Milk", "Nut butter"], ["Repeat Tue."]),
      m("lunch", "Turkey & Avocado Wrap", 0.35,
        ["Turkey", "Wrap", "Avocado"], ["Repeat Tue."]),
      m("dinner", "Shrimp Stir-fry & Rice", 0.30,
        ["180 g shrimp", "3/4 cup brown rice", "2 cups broccoli", "Tamari, garlic"],
        ["Stir-fry shrimp 3 min.", "Add broccoli 3 min.", "Serve over rice."]),
    ],
    [
      m("breakfast", "Cottage Cheese & Granola", 0.25,
        ["Cottage cheese", "Granola", "Peach"], ["Repeat Wed."]),
      m("lunch", "Tuna & White-Bean Pasta", 0.35,
        ["Pasta", "Tuna", "Beans"], ["Repeat Wed."]),
      m("dinner", "Salmon, Quinoa & Spinach", 0.30,
        ["Salmon", "Quinoa", "Spinach"], ["Repeat Wed."]),
    ],
  ],
  2: [
    [
      m("breakfast", "Overnight Oats with PB & Banana", 0.25,
        ["3/4 cup oats", "1 cup whole milk", "1 tbsp peanut butter", "1 banana"],
        ["Soak oats in milk overnight.", "Top with PB and banana."]),
      m("lunch", "Turkey, Sweet Potato & Quinoa", 0.35,
        ["170 g turkey", "1 small sweet potato", "1/2 cup quinoa"],
        ["Bake sweet potato 25 min.", "Cook quinoa.", "Sear turkey 5 min/side."]),
      m("dinner", "Baked Cod & Mashed Potato", 0.30,
        ["170 g cod", "1 cup mashed potato", "2 cups peas"],
        ["Bake cod 12 min.", "Mash boiled potato with milk.", "Steam peas."]),
    ],
    [
      m("breakfast", "Three-Egg Veggie Omelette + Toast", 0.25,
        ["3 eggs", "1/2 cup peppers", "1/4 cup feta", "1 slice rye"],
        ["Sauté peppers.", "Add eggs and feta, fold.", "Serve with toast."]),
      m("lunch", "Turkey Meatball Pasta", 0.35,
        ["1 cup whole-grain pasta", "150 g turkey meatballs", "1/2 cup tomato sauce"],
        ["Cook pasta.", "Brown meatballs, simmer in sauce 8 min.", "Combine."]),
      m("dinner", "Salmon Poke Bowl", 0.30,
        ["150 g salmon cubed", "3/4 cup rice", "1/2 avocado", "Cucumber, sesame"],
        ["Cook rice.", "Marinate salmon in tamari.", "Assemble bowl."]),
    ],
    [
      m("breakfast", "Greek Yoghurt + Honey Granola", 0.25,
        ["1 cup Greek yoghurt", "1/3 cup granola", "1 tbsp honey", "1/2 cup berries"],
        ["Layer in a bowl."]),
      m("lunch", "Turkey & Avocado Quesadilla", 0.35,
        ["1 large tortilla", "150 g turkey", "1/2 avocado", "1/4 cup cheese"],
        ["Layer fillings on tortilla.", "Fold and toast 3 min per side."]),
      m("dinner", "Halibut, Rice & Asparagus", 0.30,
        ["170 g halibut", "3/4 cup rice", "2 cups asparagus"],
        ["Bake halibut + asparagus 200 °C, 12 min.", "Serve with rice."]),
    ],
    [
      m("breakfast", "Banana Almond Smoothie Bowl", 0.25,
        ["1 banana", "1 cup milk", "2 tbsp almond butter", "1 scoop oats"],
        ["Blend with ice.", "Top with extra oats."]),
      m("lunch", "Mackerel & Couscous Bowl", 0.35,
        ["1 can mackerel", "3/4 cup couscous", "1 cup roasted veg"],
        ["Cook couscous.", "Top with mackerel and veg."]),
      m("dinner", "Salmon Burger + Sweet Potato Fries", 0.30,
        ["150 g salmon patty", "1 whole-grain bun", "1 small sweet potato in fries"],
        ["Bake fries 200 °C, 25 min.", "Pan-cook patty 4 min/side.", "Assemble burger."]),
    ],
    [
      m("breakfast", "Overnight Oats with PB & Banana", 0.25,
        ["Oats", "Milk", "PB", "Banana"], ["Repeat Mon."]),
      m("lunch", "Turkey, Sweet Potato & Quinoa", 0.35,
        ["Turkey", "Sweet potato", "Quinoa"], ["Repeat Mon."]),
      m("dinner", "Tuna Steak & Rice", 0.30,
        ["150 g tuna steak", "3/4 cup rice", "2 cups bok choy"],
        ["Sear tuna 1 min/side.", "Cook rice.", "Steam bok choy."]),
    ],
    [
      m("breakfast", "Three-Egg Veggie Omelette + Toast", 0.25,
        ["Eggs", "Peppers", "Feta"], ["Repeat Tue."]),
      m("lunch", "Turkey Meatball Pasta", 0.35,
        ["Pasta", "Meatballs", "Sauce"], ["Repeat Tue."]),
      m("dinner", "Trout & Quinoa Pilaf", 0.30,
        ["150 g trout", "3/4 cup quinoa", "1 cup mushrooms"],
        ["Sauté mushrooms, fold into cooked quinoa.", "Bake trout 10 min."]),
    ],
    [
      m("breakfast", "Greek Yoghurt + Honey Granola", 0.25,
        ["Yoghurt", "Granola", "Honey"], ["Repeat Wed."]),
      m("lunch", "Turkey & Avocado Quesadilla", 0.35,
        ["Tortilla", "Turkey", "Cheese"], ["Repeat Wed."]),
      m("dinner", "Halibut, Rice & Asparagus", 0.30,
        ["Halibut", "Rice", "Asparagus"], ["Repeat Wed."]),
    ],
  ],
  3: [
    [
      m("breakfast", "Ricotta Pancakes & Berries", 0.25,
        ["1/2 cup ricotta", "2 eggs", "1/3 cup oat flour", "1/2 cup berries"],
        ["Whisk batter.", "Cook small pancakes 2 min/side.", "Top with berries."]),
      m("lunch", "Turkey, Lentil & Rice Bowl", 0.35,
        ["150 g turkey", "1/2 cup lentils", "1/2 cup rice", "Spinach"],
        ["Cook rice + lentils together.", "Sear turkey.", "Wilt spinach in pan."]),
      m("dinner", "Salmon Teriyaki & Broccoli", 0.30,
        ["180 g salmon", "1 cup brown rice", "2 cups broccoli", "Tamari, ginger, honey"],
        ["Glaze and bake salmon 12 min.", "Steam broccoli.", "Serve over rice."]),
    ],
    [
      m("breakfast", "Avocado, Egg & Smoked Salmon Toast", 0.25,
        ["2 slices rye", "2 eggs", "1/2 avocado", "40 g smoked salmon"],
        ["Toast bread.", "Top with avocado, salmon, fried egg."]),
      m("lunch", "Turkey & Halloumi Salad Bowl", 0.35,
        ["150 g turkey", "60 g halloumi", "Mixed greens", "1 cup couscous"],
        ["Grill halloumi and turkey.", "Serve over couscous and greens."]),
      m("dinner", "Cod, Lentils & Greens", 0.30,
        ["170 g cod", "1/2 cup lentils", "2 cups Swiss chard"],
        ["Cook lentils 25 min.", "Bake cod 12 min.", "Sauté chard 3 min."]),
    ],
    [
      m("breakfast", "Banana French Toast", 0.25,
        ["2 slices rye", "2 eggs", "1 banana", "Cinnamon"],
        ["Dip bread in egg and cinnamon.", "Cook 2 min/side.", "Top with banana."]),
      m("lunch", "Tuna Pasta Salad", 0.35,
        ["1 cup pasta", "1 can tuna", "1/2 cup white beans", "Olives, tomato"],
        ["Cook pasta.", "Toss with everything cold."]),
      m("dinner", "Salmon, Sweet Potato & Spinach", 0.30,
        ["170 g salmon", "1 sweet potato", "2 cups spinach"],
        ["Bake salmon + sweet potato 200 °C, 22 min.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Protein Smoothie Bowl", 0.25,
        ["1 scoop protein", "1 cup milk", "1 banana", "1/3 cup oats"],
        ["Blend until thick.", "Top with extra oats and seeds."]),
      m("lunch", "Mediterranean Salmon Bowl", 0.35,
        ["150 g salmon", "1/2 cup quinoa", "Cucumber, olives, feta"],
        ["Bake salmon.", "Combine with grains and salad."]),
      m("dinner", "Halibut & Couscous Pilaf", 0.30,
        ["170 g halibut", "3/4 cup couscous", "1 cup roasted peppers"],
        ["Bake halibut 12 min.", "Cook couscous.", "Fold in peppers."]),
    ],
    [
      m("breakfast", "Ricotta Pancakes & Berries", 0.25,
        ["Ricotta", "Eggs", "Oat flour"], ["Repeat Mon."]),
      m("lunch", "Turkey, Lentil & Rice Bowl", 0.35,
        ["Turkey", "Lentils", "Rice"], ["Repeat Mon."]),
      m("dinner", "Sea Bass & Roasted Squash", 0.30,
        ["170 g sea bass", "1 cup butternut squash", "Sage"],
        ["Roast squash with sage 200 °C, 25 min.", "Bake bass last 10 min."]),
    ],
    [
      m("breakfast", "Avocado, Egg & Smoked Salmon Toast", 0.25,
        ["Rye", "Eggs", "Avocado", "Salmon"], ["Repeat Tue."]),
      m("lunch", "Turkey & Halloumi Salad Bowl", 0.35,
        ["Turkey", "Halloumi", "Greens"], ["Repeat Tue."]),
      m("dinner", "Shrimp Risotto", 0.30,
        ["150 g shrimp", "3/4 cup arborio rice", "Onion, broth, parmesan"],
        ["Sauté onion.", "Toast rice 1 min, add broth slowly 18 min.", "Stir in shrimp last 4 min."]),
    ],
    [
      m("breakfast", "Banana French Toast", 0.25,
        ["Rye", "Eggs", "Banana"], ["Repeat Wed."]),
      m("lunch", "Tuna Pasta Salad", 0.35,
        ["Pasta", "Tuna", "Beans"], ["Repeat Wed."]),
      m("dinner", "Salmon, Sweet Potato & Spinach", 0.30,
        ["Salmon", "Sweet potato", "Spinach"], ["Repeat Wed."]),
    ],
  ],
};

/* ============================================================================
 * MUSCLE GROWTH & RECOVERY  (beginnerStrength / bodyweight)
 * High-protein, complex carbs (rice, potato), red meat + chicken focus.
 * ========================================================================== */

const muscleLose: Record<Variant, MealTpl[][]> = {
  1: [
    [
      m("breakfast", "High-Protein Scramble", 0.25,
        ["4 egg whites + 2 whole eggs", "1/2 cup oats", "1 cup berries"],
        ["Scramble eggs.", "Cook oats with water.", "Top oats with berries; serve eggs."]),
      m("lunch", "Chicken & Brown Rice Bowl", 0.35,
        ["180 g chicken breast", "3/4 cup brown rice", "2 cups broccoli", "Garlic, lemon"],
        ["Grill chicken 5 min/side.", "Cook rice and broccoli.", "Plate with lemon."]),
      m("dinner", "Lean Beef & Roasted Veg", 0.30,
        ["150 g lean beef sirloin", "1 cup roasted bell peppers + onion", "1 small potato"],
        ["Roast veg + potato 200 °C, 25 min.", "Sear beef 3 min/side."]),
    ],
    [
      m("breakfast", "Cottage Cheese & Almonds", 0.25,
        ["1 cup cottage cheese", "10 almonds", "1 sliced apple"],
        ["Combine in bowl."]),
      m("lunch", "Tuna & Quinoa Power Bowl", 0.35,
        ["1 can tuna", "3/4 cup quinoa", "1 cup chickpeas", "Lemon"],
        ["Cook quinoa.", "Toss with tuna, chickpeas, lemon."]),
      m("dinner", "Chicken & Sweet Potato", 0.30,
        ["180 g chicken", "1 small sweet potato", "2 cups green beans"],
        ["Bake chicken + sweet potato 200 °C, 22 min.", "Steam beans."]),
    ],
    [
      m("breakfast", "Steak & Eggs", 0.25,
        ["80 g lean steak", "2 eggs", "1 cup spinach"],
        ["Sear steak 2 min/side.", "Fry eggs.", "Wilt spinach."]),
      m("lunch", "Turkey Chili", 0.35,
        ["150 g ground turkey", "1/2 cup kidney beans", "1/2 cup tomato", "Spices"],
        ["Brown turkey.", "Add beans, tomato, spices; simmer 15 min."]),
      m("dinner", "Salmon & Lentils", 0.30,
        ["150 g salmon", "1/2 cup lentils", "2 cups spinach"],
        ["Cook lentils 25 min.", "Bake salmon 10 min.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Protein Oats", 0.25,
        ["3/4 cup oats", "1 scoop protein", "1 cup milk", "1/2 banana"],
        ["Cook oats in milk.", "Stir in protein, top with banana."]),
      m("lunch", "Chicken & Black-Bean Bowl", 0.35,
        ["180 g chicken", "1/2 cup black beans", "1/2 cup rice", "Salsa"],
        ["Grill chicken.", "Cook rice and beans.", "Top with salsa."]),
      m("dinner", "Beef & Broccoli Stir-fry", 0.30,
        ["150 g beef strips", "2 cups broccoli", "Ginger, garlic, tamari"],
        ["Sear beef 2 min.", "Add broccoli + aromatics 3 min.", "Finish with tamari."]),
    ],
    [
      m("breakfast", "High-Protein Scramble", 0.25,
        ["Eggs", "Oats", "Berries"], ["Repeat Mon."]),
      m("lunch", "Chicken & Brown Rice Bowl", 0.35,
        ["Chicken", "Rice", "Broccoli"], ["Repeat Mon."]),
      m("dinner", "Lean Beef Burger Bowl", 0.30,
        ["150 g lean beef patty", "1 cup mixed greens", "1/2 cup roasted potato"],
        ["Pan-cook patty 4 min/side.", "Plate over greens with potato."]),
    ],
    [
      m("breakfast", "Cottage Cheese & Almonds", 0.25,
        ["Cottage cheese", "Almonds", "Apple"], ["Repeat Tue."]),
      m("lunch", "Tuna & Quinoa Power Bowl", 0.35,
        ["Tuna", "Quinoa", "Chickpeas"], ["Repeat Tue."]),
      m("dinner", "Grilled Chicken & Asparagus", 0.30,
        ["180 g chicken", "2 cups asparagus", "1/2 cup quinoa"],
        ["Grill chicken and asparagus 8 min.", "Serve with quinoa."]),
    ],
    [
      m("breakfast", "Steak & Eggs", 0.25,
        ["Steak", "Eggs", "Spinach"], ["Repeat Wed."]),
      m("lunch", "Turkey Chili", 0.35,
        ["Turkey", "Beans", "Tomato"], ["Repeat Wed."]),
      m("dinner", "Salmon & Lentils", 0.30,
        ["Salmon", "Lentils", "Spinach"], ["Repeat Wed."]),
    ],
  ],
  2: [
    [
      m("breakfast", "Egg-White Omelette + Turkey Bacon", 0.25,
        ["5 egg whites + 1 yolk", "2 slices turkey bacon", "1 slice rye"],
        ["Cook bacon 4 min.", "Pour whisked whites in pan, fold.", "Serve with toast."]),
      m("lunch", "Beef & Quinoa Stuffed Pepper", 0.35,
        ["120 g lean beef", "1/2 cup quinoa", "1 large bell pepper", "Tomato sauce"],
        ["Halve pepper.", "Brown beef, mix with quinoa.", "Stuff and bake 200 °C, 18 min."]),
      m("dinner", "Chicken Souvlaki & Tzatziki", 0.30,
        ["180 g chicken", "2 tbsp Greek yoghurt", "Cucumber, garlic, lemon", "1/2 pita"],
        ["Skewer and grill chicken 8 min.", "Mix yoghurt, cucumber, garlic.", "Serve with pita."]),
    ],
    [
      m("breakfast", "Greek Yoghurt + Whey", 0.25,
        ["1 cup yoghurt", "1 scoop whey", "1/2 cup berries"],
        ["Stir whey into yoghurt; top with berries."]),
      m("lunch", "Turkey & Lentil Soup", 0.35,
        ["150 g ground turkey", "1/2 cup lentils", "1 cup veg broth", "Carrot, celery"],
        ["Brown turkey.", "Add veg, lentils, broth; simmer 25 min."]),
      m("dinner", "Sirloin & Cauli Mash", 0.30,
        ["150 g sirloin", "1.5 cups cauliflower mash", "2 cups spinach"],
        ["Steam and mash cauliflower with garlic.", "Sear sirloin 3 min/side.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Protein Pancakes", 0.25,
        ["1 scoop whey", "1/2 cup oats", "2 eggs", "1/2 banana"],
        ["Blend batter.", "Cook small pancakes 2 min/side."]),
      m("lunch", "Chicken Caesar (light)", 0.35,
        ["180 g chicken", "3 cups romaine", "2 tbsp light Caesar", "1 tbsp parmesan"],
        ["Grill chicken.", "Toss romaine with dressing and parmesan."]),
      m("dinner", "Lamb Kofta & Salad", 0.30,
        ["150 g lean lamb mince", "Cumin, parsley, onion", "Tomato-cucumber salad"],
        ["Mix and shape kofta.", "Pan-cook 8 min.", "Serve with salad."]),
    ],
    [
      m("breakfast", "Egg & Turkey Burrito Bowl", 0.25,
        ["3 eggs", "60 g ground turkey", "1/4 cup salsa", "1/4 avocado"],
        ["Brown turkey.", "Scramble eggs in.", "Top with salsa and avocado."]),
      m("lunch", "Beef & Brown Rice Bowl", 0.35,
        ["150 g lean beef", "3/4 cup brown rice", "2 cups bok choy", "Tamari"],
        ["Sear beef 3 min.", "Cook rice.", "Steam bok choy."]),
      m("dinner", "Baked Chicken & Cauliflower", 0.30,
        ["180 g chicken thigh (skinless)", "2 cups cauliflower", "Paprika, garlic"],
        ["Roast chicken + cauliflower with spices 200 °C, 25 min."]),
    ],
    [
      m("breakfast", "Egg-White Omelette + Turkey Bacon", 0.25,
        ["Egg whites", "Turkey bacon", "Rye"], ["Repeat Mon."]),
      m("lunch", "Beef & Quinoa Stuffed Pepper", 0.35,
        ["Beef", "Quinoa", "Pepper"], ["Repeat Mon."]),
      m("dinner", "Tuna Steak & Spinach", 0.30,
        ["150 g tuna steak", "2 cups spinach", "Sesame, lemon"],
        ["Sear tuna 1 min/side.", "Wilt spinach with garlic."]),
    ],
    [
      m("breakfast", "Greek Yoghurt + Whey", 0.25,
        ["Yoghurt", "Whey", "Berries"], ["Repeat Tue."]),
      m("lunch", "Turkey & Lentil Soup", 0.35,
        ["Turkey", "Lentils", "Broth"], ["Repeat Tue."]),
      m("dinner", "Chicken & Roasted Veg", 0.30,
        ["180 g chicken", "1 cup roasted carrots and parsnip"],
        ["Roast veg 25 min.", "Pan-sear chicken 5 min/side."]),
    ],
    [
      m("breakfast", "Protein Pancakes", 0.25,
        ["Whey", "Oats", "Eggs"], ["Repeat Wed."]),
      m("lunch", "Chicken Caesar (light)", 0.35,
        ["Chicken", "Romaine", "Caesar"], ["Repeat Wed."]),
      m("dinner", "Lamb Kofta & Salad", 0.30,
        ["Lamb", "Spices", "Salad"], ["Repeat Wed."]),
    ],
  ],
  3: [
    [
      m("breakfast", "Steak Skillet", 0.25,
        ["100 g lean steak", "2 eggs", "1/2 cup mushrooms", "1/2 cup spinach"],
        ["Sear steak 2 min/side.", "Sauté mushrooms and spinach.", "Fry eggs."]),
      m("lunch", "Chicken Shawarma Bowl", 0.35,
        ["180 g chicken thigh", "1/2 cup rice", "Cabbage slaw", "Tahini"],
        ["Marinate chicken in shawarma spice.", "Grill 5 min/side.", "Plate with rice and slaw."]),
      m("dinner", "Beef Stew (lean)", 0.30,
        ["150 g lean beef stew meat", "1 cup carrot + celery", "1/2 cup broth", "Thyme"],
        ["Brown beef.", "Add veg, broth, thyme; simmer 45 min."]),
    ],
    [
      m("breakfast", "Smoked Turkey & Egg Wrap", 0.25,
        ["1 small whole-grain wrap", "60 g smoked turkey", "2 eggs", "Greens"],
        ["Scramble eggs.", "Layer in wrap with turkey and greens.", "Roll."]),
      m("lunch", "Lentil & Beef Bowl", 0.35,
        ["120 g beef strips", "1/2 cup lentils", "1 cup roasted veg"],
        ["Sear beef 3 min.", "Cook lentils 25 min.", "Combine with veg."]),
      m("dinner", "Chicken Tikka & Cauliflower Rice", 0.30,
        ["180 g chicken", "Yoghurt + tikka spice", "2 cups cauliflower rice"],
        ["Marinate chicken 10 min.", "Bake 200 °C, 18 min.", "Stir-fry cauli rice 4 min."]),
    ],
    [
      m("breakfast", "Beef & Egg Hash", 0.25,
        ["80 g lean ground beef", "1 small potato diced", "2 eggs"],
        ["Brown beef and potato 10 min.", "Crack eggs on top, cover 3 min."]),
      m("lunch", "Salmon, Quinoa & Greens", 0.35,
        ["150 g salmon", "3/4 cup quinoa", "Mixed greens"],
        ["Bake salmon 10 min.", "Cook quinoa.", "Toss with greens."]),
      m("dinner", "Lamb Chops & Roasted Veg", 0.30,
        ["150 g lean lamb chop", "1 cup roasted zucchini and pepper"],
        ["Roast veg 25 min.", "Pan-sear chops 3 min/side."]),
    ],
    [
      m("breakfast", "Whey Smoothie + PB Toast", 0.25,
        ["1 scoop whey", "1 cup milk", "1 slice rye + 1 tbsp PB"],
        ["Blend whey with milk.", "Toast bread, spread PB."]),
      m("lunch", "Chicken Burrito Bowl", 0.35,
        ["180 g chicken", "1/2 cup rice", "1/2 cup black beans", "Salsa"],
        ["Grill chicken.", "Layer rice, beans, chicken, salsa."]),
      m("dinner", "Cod, Lentil & Greens", 0.30,
        ["170 g cod", "1/2 cup lentils", "2 cups spinach"],
        ["Cook lentils.", "Bake cod 12 min.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Steak Skillet", 0.25,
        ["Steak", "Eggs", "Mushrooms"], ["Repeat Mon."]),
      m("lunch", "Chicken Shawarma Bowl", 0.35,
        ["Chicken", "Rice", "Slaw"], ["Repeat Mon."]),
      m("dinner", "Turkey Meatloaf Slice & Greens", 0.30,
        ["150 g turkey meatloaf", "2 cups green beans"],
        ["Bake meatloaf in advance.", "Slice and reheat.", "Steam beans."]),
    ],
    [
      m("breakfast", "Smoked Turkey & Egg Wrap", 0.25,
        ["Wrap", "Turkey", "Eggs"], ["Repeat Tue."]),
      m("lunch", "Lentil & Beef Bowl", 0.35,
        ["Beef", "Lentils", "Veg"], ["Repeat Tue."]),
      m("dinner", "Chicken Stir-fry", 0.30,
        ["180 g chicken", "2 cups mixed veg", "Tamari, ginger"],
        ["Stir-fry chicken 4 min.", "Add veg + sauce 4 min."]),
    ],
    [
      m("breakfast", "Beef & Egg Hash", 0.25,
        ["Beef", "Potato", "Eggs"], ["Repeat Wed."]),
      m("lunch", "Salmon, Quinoa & Greens", 0.35,
        ["Salmon", "Quinoa", "Greens"], ["Repeat Wed."]),
      m("dinner", "Lamb Chops & Roasted Veg", 0.30,
        ["Lamb", "Zucchini", "Pepper"], ["Repeat Wed."]),
    ],
  ],
};

const muscleGain: Record<Variant, MealTpl[][]> = {
  1: [
    [
      m("breakfast", "Mass Oats Bowl", 0.25,
        ["1 cup oats", "1.5 cups whole milk", "1 banana", "2 tbsp peanut butter"],
        ["Cook oats in milk 6 min.", "Top with banana and PB."]),
      m("lunch", "Chicken, Rice & Avocado", 0.35,
        ["200 g chicken breast", "1 cup white rice", "1/2 avocado", "1 cup broccoli"],
        ["Grill chicken.", "Cook rice.", "Plate with avocado and broccoli."]),
      m("dinner", "Beef & Sweet Potato", 0.30,
        ["180 g lean beef", "1 large sweet potato", "2 cups asparagus"],
        ["Roast sweet potato 30 min.", "Sear beef 3 min/side.", "Steam asparagus."]),
    ],
    [
      m("breakfast", "Eggs, Toast & Halloumi", 0.25,
        ["3 eggs", "2 slices rye", "60 g halloumi"],
        ["Pan-cook halloumi 2 min/side.", "Fry eggs.", "Plate with toast."]),
      m("lunch", "Turkey Pasta Bake", 0.35,
        ["1 cup pasta", "150 g turkey mince", "1/2 cup tomato sauce", "Cheese"],
        ["Cook pasta.", "Brown turkey, mix with sauce, top cheese.", "Bake 12 min."]),
      m("dinner", "Salmon, Rice & Greens", 0.30,
        ["180 g salmon", "1 cup rice", "2 cups bok choy"],
        ["Bake salmon 12 min.", "Cook rice.", "Steam bok choy."]),
    ],
    [
      m("breakfast", "Mass Smoothie", 0.25,
        ["2 scoops whey", "1.5 cups milk", "1 banana", "2 tbsp oats", "1 tbsp PB"],
        ["Blend until thick."]),
      m("lunch", "Beef, Rice & Beans", 0.35,
        ["170 g beef", "1 cup rice", "1/2 cup black beans"],
        ["Sear beef.", "Cook rice and beans.", "Combine bowl-style."]),
      m("dinner", "Chicken Parm Bowl", 0.30,
        ["180 g chicken", "1/2 cup tomato sauce", "30 g mozzarella", "1/2 cup pasta"],
        ["Bake chicken with sauce and cheese 18 min.", "Serve with pasta."]),
    ],
    [
      m("breakfast", "Steak & Egg Burrito", 0.25,
        ["80 g steak", "2 eggs", "1 large tortilla", "Cheese"],
        ["Sear steak.", "Scramble eggs.", "Wrap with cheese."]),
      m("lunch", "Chicken & Quinoa Power Plate", 0.35,
        ["180 g chicken", "1 cup quinoa", "1 cup roasted squash"],
        ["Roast squash 25 min.", "Grill chicken.", "Cook quinoa.", "Combine."]),
      m("dinner", "Lamb & Couscous", 0.30,
        ["150 g lean lamb", "1 cup couscous", "Roasted veg"],
        ["Sear lamb 3 min/side.", "Cook couscous.", "Plate together."]),
    ],
    [
      m("breakfast", "Mass Oats Bowl", 0.25,
        ["Oats", "Milk", "Banana", "PB"], ["Repeat Mon."]),
      m("lunch", "Chicken, Rice & Avocado", 0.35,
        ["Chicken", "Rice", "Avocado"], ["Repeat Mon."]),
      m("dinner", "Tuna Steak & Sweet Potato", 0.30,
        ["170 g tuna", "1 sweet potato", "2 cups greens"],
        ["Sear tuna 1 min/side.", "Bake potato.", "Wilt greens."]),
    ],
    [
      m("breakfast", "Eggs, Toast & Halloumi", 0.25,
        ["Eggs", "Rye", "Halloumi"], ["Repeat Tue."]),
      m("lunch", "Turkey Pasta Bake", 0.35,
        ["Pasta", "Turkey", "Sauce"], ["Repeat Tue."]),
      m("dinner", "Chicken Stir-fry & Rice", 0.30,
        ["180 g chicken", "1 cup rice", "2 cups veg", "Tamari"],
        ["Stir-fry chicken 4 min.", "Add veg + tamari 4 min.", "Serve over rice."]),
    ],
    [
      m("breakfast", "Mass Smoothie", 0.25,
        ["Whey", "Milk", "Banana", "Oats"], ["Repeat Wed."]),
      m("lunch", "Beef, Rice & Beans", 0.35,
        ["Beef", "Rice", "Beans"], ["Repeat Wed."]),
      m("dinner", "Chicken Parm Bowl", 0.30,
        ["Chicken", "Sauce", "Mozz"], ["Repeat Wed."]),
    ],
  ],
  2: [
    [
      m("breakfast", "Three-Egg Cheese Omelette + Bagel", 0.25,
        ["3 eggs", "30 g cheddar", "1 whole-grain bagel"],
        ["Make cheese omelette.", "Toast bagel."]),
      m("lunch", "Beef & Rice Stuffed Burrito", 0.35,
        ["170 g beef", "1 cup rice", "1 large tortilla", "1/4 cup beans", "Salsa"],
        ["Brown beef.", "Layer rice, beef, beans in tortilla.", "Roll tightly."]),
      m("dinner", "Chicken Alfredo (light)", 0.30,
        ["180 g chicken", "1 cup pasta", "1/3 cup light cream sauce", "Spinach"],
        ["Cook pasta.", "Sear chicken, slice.", "Toss with sauce and spinach."]),
    ],
    [
      m("breakfast", "PB & Banana Toast Stack", 0.25,
        ["3 slices rye", "2 tbsp PB", "1 banana", "Honey"],
        ["Toast bread.", "Spread PB and top with banana and honey."]),
      m("lunch", "Turkey Meatball Sub", 0.35,
        ["150 g turkey meatballs", "1 sub roll", "1/2 cup tomato sauce", "Cheese"],
        ["Brown meatballs in sauce 10 min.", "Fill sub with cheese."]),
      m("dinner", "Beef & Sweet Potato Bowl", 0.30,
        ["180 g beef", "1 sweet potato", "2 cups kale"],
        ["Roast potato 30 min.", "Sear beef.", "Massage kale with oil."]),
    ],
    [
      m("breakfast", "Steak & Egg Skillet", 0.25,
        ["100 g steak", "3 eggs", "1/2 cup potato"],
        ["Brown potato 8 min.", "Sear steak 2 min/side.", "Fry eggs."]),
      m("lunch", "Chicken & Rice Bowl + Hummus", 0.35,
        ["200 g chicken", "1 cup rice", "3 tbsp hummus", "Cucumber"],
        ["Grill chicken.", "Serve with rice, hummus, cucumber."]),
      m("dinner", "Salmon Pasta", 0.30,
        ["150 g salmon", "1 cup pasta", "2 tbsp olive oil", "Lemon, parsley"],
        ["Cook pasta.", "Flake baked salmon over.", "Toss with oil and herbs."]),
    ],
    [
      m("breakfast", "Cottage Cheese, Granola & Berries", 0.25,
        ["1 cup cottage cheese", "1/2 cup granola", "1/2 cup berries"],
        ["Layer in bowl."]),
      m("lunch", "Turkey, Avocado & Rice Bowl", 0.35,
        ["180 g turkey", "1 cup rice", "1/2 avocado", "Black beans"],
        ["Cook rice and beans.", "Sear turkey.", "Top with avocado."]),
      m("dinner", "Chicken Tagine & Couscous", 0.30,
        ["180 g chicken", "1/2 cup couscous", "Apricots, cinnamon, broth"],
        ["Brown chicken.", "Add apricots, cinnamon, broth; simmer 25 min.", "Serve with couscous."]),
    ],
    [
      m("breakfast", "Three-Egg Cheese Omelette + Bagel", 0.25,
        ["Eggs", "Cheese", "Bagel"], ["Repeat Mon."]),
      m("lunch", "Beef & Rice Stuffed Burrito", 0.35,
        ["Beef", "Rice", "Tortilla"], ["Repeat Mon."]),
      m("dinner", "Halibut, Rice & Greens", 0.30,
        ["170 g halibut", "1 cup rice", "2 cups spinach"],
        ["Bake halibut 12 min.", "Cook rice.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "PB & Banana Toast Stack", 0.25,
        ["Rye", "PB", "Banana"], ["Repeat Tue."]),
      m("lunch", "Turkey Meatball Sub", 0.35,
        ["Meatballs", "Sub", "Sauce"], ["Repeat Tue."]),
      m("dinner", "Lamb & Lentil Stew", 0.30,
        ["150 g lamb", "1/2 cup lentils", "Carrot, broth"],
        ["Brown lamb.", "Add veg, lentils, broth; simmer 35 min."]),
    ],
    [
      m("breakfast", "Steak & Egg Skillet", 0.25,
        ["Steak", "Eggs", "Potato"], ["Repeat Wed."]),
      m("lunch", "Chicken & Rice Bowl + Hummus", 0.35,
        ["Chicken", "Rice", "Hummus"], ["Repeat Wed."]),
      m("dinner", "Salmon Pasta", 0.30,
        ["Salmon", "Pasta", "Lemon"], ["Repeat Wed."]),
    ],
  ],
  3: [
    [
      m("breakfast", "Loaded Burrito Bowl Breakfast", 0.25,
        ["3 eggs", "60 g chorizo-style turkey", "1/2 cup rice", "1/4 avocado"],
        ["Brown turkey.", "Scramble in eggs.", "Serve over rice with avocado."]),
      m("lunch", "Steak & Sweet Potato", 0.35,
        ["180 g steak", "1 sweet potato", "2 cups broccoli"],
        ["Roast potato 30 min.", "Sear steak 3 min/side.", "Steam broccoli."]),
      m("dinner", "Chicken Biryani (light)", 0.30,
        ["180 g chicken", "3/4 cup basmati", "Yoghurt + spices"],
        ["Marinate chicken in spiced yoghurt.", "Layer with rice; bake 25 min."]),
    ],
    [
      m("breakfast", "Protein French Toast", 0.25,
        ["3 slices rye", "3 eggs", "1 scoop whey", "Cinnamon"],
        ["Whisk eggs + whey.", "Dip bread; cook 2 min/side."]),
      m("lunch", "Beef & Rice Stuffed Pepper", 0.35,
        ["150 g beef", "3/4 cup rice", "2 large peppers", "Tomato sauce"],
        ["Brown beef + rice.", "Stuff peppers, top with sauce.", "Bake 200 °C, 25 min."]),
      m("dinner", "Salmon Teriyaki & Rice", 0.30,
        ["180 g salmon", "1 cup rice", "Tamari, honey, ginger", "Bok choy"],
        ["Glaze and bake salmon 12 min.", "Cook rice.", "Steam bok choy."]),
    ],
    [
      m("breakfast", "Steak & Cheese Toast", 0.25,
        ["80 g steak", "2 slices rye", "30 g cheese", "Spinach"],
        ["Sear steak.", "Top toast with steak, cheese, spinach.", "Broil 2 min."]),
      m("lunch", "Chicken Shawarma Wrap", 0.35,
        ["180 g chicken", "1 large wrap", "Tahini, salad"],
        ["Marinate and grill chicken.", "Wrap with tahini and salad."]),
      m("dinner", "Lamb Curry & Rice", 0.30,
        ["150 g lamb", "1/2 cup rice", "Onion, tomato, curry spice"],
        ["Brown lamb.", "Simmer with onion, tomato, spice 35 min.", "Serve over rice."]),
    ],
    [
      m("breakfast", "Mass Smoothie + Bagel", 0.25,
        ["2 scoops whey", "1.5 cups milk", "1 banana", "1 bagel"],
        ["Blend smoothie; toast bagel."]),
      m("lunch", "Chicken, Couscous & Halloumi", 0.35,
        ["180 g chicken", "1 cup couscous", "60 g halloumi"],
        ["Cook couscous.", "Grill halloumi and chicken.", "Plate together."]),
      m("dinner", "Beef Stew with Potato", 0.30,
        ["170 g beef stew meat", "1 cup potato + carrot", "1/2 cup broth"],
        ["Brown beef.", "Add veg, broth; simmer 50 min."]),
    ],
    [
      m("breakfast", "Loaded Burrito Bowl Breakfast", 0.25,
        ["Eggs", "Turkey", "Rice"], ["Repeat Mon."]),
      m("lunch", "Steak & Sweet Potato", 0.35,
        ["Steak", "Sweet potato", "Broccoli"], ["Repeat Mon."]),
      m("dinner", "Cod & Mash", 0.30,
        ["170 g cod", "1 cup mashed potato", "Peas"],
        ["Bake cod 12 min.", "Mash potato.", "Steam peas."]),
    ],
    [
      m("breakfast", "Protein French Toast", 0.25,
        ["Rye", "Eggs", "Whey"], ["Repeat Tue."]),
      m("lunch", "Beef & Rice Stuffed Pepper", 0.35,
        ["Beef", "Rice", "Pepper"], ["Repeat Tue."]),
      m("dinner", "Chicken & Lentil Stew", 0.30,
        ["180 g chicken", "1/2 cup lentils", "Carrot, broth"],
        ["Brown chicken.", "Add lentils, veg, broth; simmer 30 min."]),
    ],
    [
      m("breakfast", "Steak & Cheese Toast", 0.25,
        ["Steak", "Rye", "Cheese"], ["Repeat Wed."]),
      m("lunch", "Chicken Shawarma Wrap", 0.35,
        ["Chicken", "Wrap", "Tahini"], ["Repeat Wed."]),
      m("dinner", "Lamb Curry & Rice", 0.30,
        ["Lamb", "Rice", "Spices"], ["Repeat Wed."]),
    ],
  ],
};

/* ============================================================================
 * ENDURANCE & ENERGY  (fatLoss / homeNoEquip)
 * High complex carbs, electrolytes, balanced protein, fueling-focused.
 * ========================================================================== */

const enduranceLose: Record<Variant, MealTpl[][]> = {
  1: [
    [
      m("breakfast", "Banana Oatmeal", 0.25,
        ["3/4 cup oats", "1 cup almond milk", "1 banana", "Cinnamon"],
        ["Cook oats in milk 5 min.", "Top with banana and cinnamon."]),
      m("lunch", "Chicken & Sweet-Potato Bowl", 0.35,
        ["150 g chicken", "1 small sweet potato", "1 cup spinach", "Lemon"],
        ["Bake potato 25 min.", "Grill chicken.", "Wilt spinach with lemon."]),
      m("dinner", "Whole-Grain Pasta Primavera", 0.30,
        ["3/4 cup whole-grain pasta", "1.5 cups mixed veg", "Tomato sauce"],
        ["Cook pasta.", "Sauté veg.", "Toss with sauce."]),
    ],
    [
      m("breakfast", "Berry Smoothie", 0.25,
        ["1 cup almond milk", "1 banana", "1/2 cup berries", "1 tbsp chia"],
        ["Blend smooth."]),
      m("lunch", "Quinoa Buddha Bowl", 0.35,
        ["3/4 cup quinoa", "1 cup roasted veg", "1/2 cup chickpeas", "Tahini"],
        ["Cook quinoa.", "Roast veg 25 min.", "Top with chickpeas and tahini."]),
      m("dinner", "Turkey & Brown Rice", 0.30,
        ["150 g turkey", "3/4 cup brown rice", "2 cups green beans"],
        ["Sear turkey 4 min/side.", "Cook rice.", "Steam beans."]),
    ],
    [
      m("breakfast", "Whole-Grain Toast & Banana", 0.25,
        ["2 slices whole-grain", "1 banana", "1 tbsp PB"],
        ["Toast bread, spread PB, top with banana."]),
      m("lunch", "Chicken Wrap", 0.35,
        ["150 g chicken", "1 whole-grain wrap", "Lettuce, tomato", "Mustard"],
        ["Grill chicken; assemble wrap."]),
      m("dinner", "Salmon & Couscous", 0.30,
        ["150 g salmon", "3/4 cup couscous", "2 cups asparagus"],
        ["Bake salmon 10 min.", "Cook couscous.", "Steam asparagus."]),
    ],
    [
      m("breakfast", "Yoghurt Granola Bowl", 0.25,
        ["1 cup Greek yoghurt", "1/4 cup granola", "1/2 cup berries"],
        ["Layer."]),
      m("lunch", "Lentil Soup & Bread", 0.35,
        ["1.5 cups lentil soup", "1 slice rye"],
        ["Heat soup, serve with bread."]),
      m("dinner", "Chicken Stir-fry & Rice Noodles", 0.30,
        ["150 g chicken", "1 cup rice noodles", "2 cups veg", "Tamari"],
        ["Stir-fry chicken 4 min.", "Add veg + sauce 4 min.", "Toss with noodles."]),
    ],
    [
      m("breakfast", "Banana Oatmeal", 0.25,
        ["Oats", "Milk", "Banana"], ["Repeat Mon."]),
      m("lunch", "Chicken & Sweet-Potato Bowl", 0.35,
        ["Chicken", "Sweet potato", "Spinach"], ["Repeat Mon."]),
      m("dinner", "Tuna Pasta Salad", 0.30,
        ["3/4 cup pasta", "1 can tuna", "1 cup veg"],
        ["Cook pasta cold.", "Toss with tuna and veg."]),
    ],
    [
      m("breakfast", "Berry Smoothie", 0.25,
        ["Milk", "Banana", "Berries"], ["Repeat Tue."]),
      m("lunch", "Quinoa Buddha Bowl", 0.35,
        ["Quinoa", "Veg", "Chickpeas"], ["Repeat Tue."]),
      m("dinner", "Shrimp & Rice", 0.30,
        ["150 g shrimp", "3/4 cup rice", "2 cups bok choy"],
        ["Sauté shrimp 3 min.", "Cook rice.", "Steam bok choy."]),
    ],
    [
      m("breakfast", "Whole-Grain Toast & Banana", 0.25,
        ["Toast", "Banana", "PB"], ["Repeat Wed."]),
      m("lunch", "Chicken Wrap", 0.35,
        ["Chicken", "Wrap", "Veg"], ["Repeat Wed."]),
      m("dinner", "Salmon & Couscous", 0.30,
        ["Salmon", "Couscous", "Asparagus"], ["Repeat Wed."]),
    ],
  ],
  2: [
    [
      m("breakfast", "Overnight Oats + Berries", 0.25,
        ["1/2 cup oats", "1 cup milk", "1 tbsp chia", "1/2 cup berries"],
        ["Soak overnight.", "Top with berries."]),
      m("lunch", "Chicken Pita & Hummus", 0.35,
        ["150 g chicken", "1 small pita", "3 tbsp hummus", "Cucumber"],
        ["Grill chicken.", "Fill pita with hummus and cucumber."]),
      m("dinner", "Veggie Chili & Rice", 0.30,
        ["1 cup veggie chili (beans, tomato, peppers)", "1/2 cup rice"],
        ["Simmer chili 15 min.", "Cook rice.", "Plate together."]),
    ],
    [
      m("breakfast", "Egg-White Wrap", 0.25,
        ["4 egg whites", "1 small wrap", "Salsa"],
        ["Cook egg whites flat.", "Roll in wrap with salsa."]),
      m("lunch", "Tuna & Rice Bowl", 0.35,
        ["1 can tuna", "3/4 cup rice", "1 cup edamame", "Tamari"],
        ["Cook rice.", "Top with tuna and edamame; drizzle tamari."]),
      m("dinner", "Chicken & Couscous Salad", 0.30,
        ["150 g chicken", "3/4 cup couscous", "Cucumber, tomato, lemon"],
        ["Grill chicken.", "Toss couscous with veg and lemon."]),
    ],
    [
      m("breakfast", "Banana Pancakes", 0.25,
        ["1 banana", "2 eggs", "1/3 cup oats"],
        ["Blend; cook 4 small pancakes."]),
      m("lunch", "Turkey Sandwich & Apple", 0.35,
        ["150 g turkey", "2 slices rye", "Mustard, lettuce", "1 apple"],
        ["Build sandwich.", "Serve with apple."]),
      m("dinner", "Salmon, Rice & Greens", 0.30,
        ["150 g salmon", "3/4 cup rice", "2 cups spinach"],
        ["Bake salmon 10 min.", "Cook rice.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Smoothie Bowl", 0.25,
        ["1 banana", "1 cup milk", "1/2 cup berries", "1 tbsp granola"],
        ["Blend, top with granola."]),
      m("lunch", "Chickpea Stew", 0.35,
        ["1 cup chickpeas", "1/2 cup tomato", "Cumin, paprika"],
        ["Simmer chickpeas with tomato and spices 15 min."]),
      m("dinner", "Chicken & Quinoa Stuffed Pepper", 0.30,
        ["150 g chicken", "1/2 cup quinoa", "1 large pepper"],
        ["Mix chicken and quinoa.", "Stuff pepper, bake 200 °C, 20 min."]),
    ],
    [
      m("breakfast", "Overnight Oats + Berries", 0.25,
        ["Oats", "Milk", "Berries"], ["Repeat Mon."]),
      m("lunch", "Chicken Pita & Hummus", 0.35,
        ["Chicken", "Pita", "Hummus"], ["Repeat Mon."]),
      m("dinner", "Tuna Steak & Rice", 0.30,
        ["150 g tuna steak", "3/4 cup rice", "2 cups bok choy"],
        ["Sear tuna.", "Cook rice.", "Steam bok choy."]),
    ],
    [
      m("breakfast", "Egg-White Wrap", 0.25,
        ["Egg whites", "Wrap", "Salsa"], ["Repeat Tue."]),
      m("lunch", "Tuna & Rice Bowl", 0.35,
        ["Tuna", "Rice", "Edamame"], ["Repeat Tue."]),
      m("dinner", "Turkey Burger Bowl", 0.30,
        ["150 g turkey patty", "1 cup roasted potato", "Greens"],
        ["Pan-cook patty 4 min/side.", "Roast potato 25 min.", "Plate over greens."]),
    ],
    [
      m("breakfast", "Banana Pancakes", 0.25,
        ["Banana", "Eggs", "Oats"], ["Repeat Wed."]),
      m("lunch", "Turkey Sandwich & Apple", 0.35,
        ["Turkey", "Rye", "Apple"], ["Repeat Wed."]),
      m("dinner", "Salmon, Rice & Greens", 0.30,
        ["Salmon", "Rice", "Spinach"], ["Repeat Wed."]),
    ],
  ],
  3: [
    [
      m("breakfast", "Energy Oats", 0.25,
        ["3/4 cup oats", "1 cup milk", "1 tbsp honey", "Berries"],
        ["Cook oats in milk.", "Stir in honey, top with berries."]),
      m("lunch", "Chicken, Lentil & Rice", 0.35,
        ["150 g chicken", "1/2 cup lentils", "1/2 cup rice"],
        ["Cook lentils + rice together.", "Sear chicken."]),
      m("dinner", "Whole-Grain Pasta & Turkey Bolognese", 0.30,
        ["3/4 cup pasta", "120 g turkey mince", "1/2 cup tomato sauce"],
        ["Cook pasta.", "Brown turkey, simmer in sauce 12 min."]),
    ],
    [
      m("breakfast", "Yoghurt + Granola + Honey", 0.25,
        ["1 cup yoghurt", "1/3 cup granola", "1 tsp honey"],
        ["Layer."]),
      m("lunch", "Salmon & Sweet Potato", 0.35,
        ["150 g salmon", "1 sweet potato", "Spinach"],
        ["Bake salmon + potato 200 °C, 22 min.", "Wilt spinach."]),
      m("dinner", "Chicken Fried Rice (light)", 0.30,
        ["150 g chicken", "3/4 cup rice", "Egg, peas, carrot, tamari"],
        ["Stir-fry chicken.", "Add rice + veg + egg 5 min."]),
    ],
    [
      m("breakfast", "Banana & PB Toast", 0.25,
        ["2 slices rye", "1 tbsp PB", "1 banana"],
        ["Toast, spread PB, top with banana."]),
      m("lunch", "Mediterranean Couscous Salad", 0.35,
        ["3/4 cup couscous", "1/2 cup chickpeas", "Cucumber, tomato, feta"],
        ["Cook couscous; toss cold with veg and feta."]),
      m("dinner", "Cod, Potato & Greens", 0.30,
        ["150 g cod", "1 small potato", "2 cups greens"],
        ["Bake cod and potato.", "Steam greens."]),
    ],
    [
      m("breakfast", "Smoothie + Toast", 0.25,
        ["1 banana", "1 cup milk", "1 slice rye"],
        ["Blend smoothie; serve with toast."]),
      m("lunch", "Turkey Quinoa Bowl", 0.35,
        ["150 g turkey", "3/4 cup quinoa", "Roasted veg"],
        ["Cook quinoa.", "Sear turkey.", "Add veg."]),
      m("dinner", "Shrimp & Pasta", 0.30,
        ["150 g shrimp", "3/4 cup pasta", "Garlic, lemon"],
        ["Cook pasta.", "Sauté shrimp + garlic 3 min.", "Toss with lemon."]),
    ],
    [
      m("breakfast", "Energy Oats", 0.25,
        ["Oats", "Milk", "Honey"], ["Repeat Mon."]),
      m("lunch", "Chicken, Lentil & Rice", 0.35,
        ["Chicken", "Lentils", "Rice"], ["Repeat Mon."]),
      m("dinner", "Tuna Wrap", 0.30,
        ["1 can tuna", "1 wrap", "Greens, mustard"],
        ["Mix tuna with mustard.", "Roll in wrap with greens."]),
    ],
    [
      m("breakfast", "Yoghurt + Granola + Honey", 0.25,
        ["Yoghurt", "Granola", "Honey"], ["Repeat Tue."]),
      m("lunch", "Salmon & Sweet Potato", 0.35,
        ["Salmon", "Sweet potato", "Spinach"], ["Repeat Tue."]),
      m("dinner", "Veggie Quesadilla", 0.30,
        ["1 wrap", "1/2 cup beans", "1/4 cup cheese", "Salsa"],
        ["Fill, fold, and toast 3 min/side."]),
    ],
    [
      m("breakfast", "Banana & PB Toast", 0.25,
        ["Rye", "PB", "Banana"], ["Repeat Wed."]),
      m("lunch", "Mediterranean Couscous Salad", 0.35,
        ["Couscous", "Chickpeas", "Veg"], ["Repeat Wed."]),
      m("dinner", "Cod, Potato & Greens", 0.30,
        ["Cod", "Potato", "Greens"], ["Repeat Wed."]),
    ],
  ],
};

const enduranceGain: Record<Variant, MealTpl[][]> = {
  1: [
    [
      m("breakfast", "Mass Oat Bowl", 0.25,
        ["1 cup oats", "1.5 cups milk", "1 banana", "2 tbsp PB", "1 tbsp honey"],
        ["Cook oats in milk.", "Stir in PB, honey; top with banana."]),
      m("lunch", "Chicken Burrito", 0.35,
        ["180 g chicken", "1 large tortilla", "3/4 cup rice", "1/2 cup beans", "Salsa"],
        ["Grill chicken.", "Layer everything in tortilla; roll."]),
      m("dinner", "Salmon Pasta", 0.30,
        ["170 g salmon", "1 cup pasta", "Lemon, olive oil"],
        ["Cook pasta.", "Bake salmon, flake into pasta with oil and lemon."]),
    ],
    [
      m("breakfast", "Bagel + Eggs + Avocado", 0.25,
        ["1 bagel", "3 eggs", "1/2 avocado"],
        ["Toast bagel.", "Scramble eggs.", "Top with avocado."]),
      m("lunch", "Turkey & Sweet Potato Bowl", 0.35,
        ["180 g turkey", "1 large sweet potato", "1 cup roasted veg"],
        ["Roast potato 30 min.", "Sear turkey.", "Plate with veg."]),
      m("dinner", "Beef Stir-fry & Rice", 0.30,
        ["170 g beef", "1 cup rice", "2 cups veg", "Tamari"],
        ["Stir-fry beef 3 min.", "Add veg + sauce 4 min.", "Serve over rice."]),
    ],
    [
      m("breakfast", "Smoothie + Bagel", 0.25,
        ["2 scoops whey", "1.5 cups milk", "1 banana", "1 bagel"],
        ["Blend smoothie; toast bagel."]),
      m("lunch", "Chicken Pasta", 0.35,
        ["180 g chicken", "1 cup pasta", "1/2 cup pesto", "Cherry tomatoes"],
        ["Cook pasta.", "Sear chicken, slice.", "Toss with pesto and tomatoes."]),
      m("dinner", "Salmon, Rice & Avocado", 0.30,
        ["170 g salmon", "1 cup rice", "1/2 avocado", "Bok choy"],
        ["Bake salmon.", "Cook rice.", "Plate with avocado and bok choy."]),
    ],
    [
      m("breakfast", "French Toast + Banana", 0.25,
        ["2 slices rye", "2 eggs", "1 banana", "Cinnamon"],
        ["Dip bread in egg + cinnamon.", "Cook 2 min/side; top with banana."]),
      m("lunch", "Beef Quinoa Bowl", 0.35,
        ["170 g beef", "1 cup quinoa", "1 cup roasted squash"],
        ["Roast squash.", "Cook quinoa.", "Sear beef; combine."]),
      m("dinner", "Chicken Pita Stack", 0.30,
        ["180 g chicken", "1 large pita", "Hummus, salad"],
        ["Grill chicken.", "Fill pita with hummus, chicken, salad."]),
    ],
    [
      m("breakfast", "Mass Oat Bowl", 0.25,
        ["Oats", "Milk", "PB", "Banana"], ["Repeat Mon."]),
      m("lunch", "Chicken Burrito", 0.35,
        ["Chicken", "Tortilla", "Rice", "Beans"], ["Repeat Mon."]),
      m("dinner", "Tuna Steak & Sweet Potato", 0.30,
        ["170 g tuna", "1 sweet potato", "Greens"],
        ["Sear tuna.", "Bake potato.", "Wilt greens."]),
    ],
    [
      m("breakfast", "Bagel + Eggs + Avocado", 0.25,
        ["Bagel", "Eggs", "Avocado"], ["Repeat Tue."]),
      m("lunch", "Turkey & Sweet Potato Bowl", 0.35,
        ["Turkey", "Sweet potato", "Veg"], ["Repeat Tue."]),
      m("dinner", "Halibut, Rice & Greens", 0.30,
        ["170 g halibut", "1 cup rice", "Spinach"],
        ["Bake halibut 12 min.", "Cook rice.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Smoothie + Bagel", 0.25,
        ["Whey", "Milk", "Banana", "Bagel"], ["Repeat Wed."]),
      m("lunch", "Chicken Pasta", 0.35,
        ["Chicken", "Pasta", "Pesto"], ["Repeat Wed."]),
      m("dinner", "Salmon, Rice & Avocado", 0.30,
        ["Salmon", "Rice", "Avocado"], ["Repeat Wed."]),
    ],
  ],
  2: [
    [
      m("breakfast", "PB Banana Toast Stack", 0.25,
        ["3 slices rye", "2 tbsp PB", "1 banana", "Honey"],
        ["Toast bread; spread PB, top with banana and honey."]),
      m("lunch", "Turkey Pasta Bowl", 0.35,
        ["170 g turkey", "1 cup pasta", "1/2 cup tomato sauce"],
        ["Cook pasta.", "Brown turkey, simmer in sauce.", "Combine."]),
      m("dinner", "Chicken & Rice Foil Pack", 0.30,
        ["180 g chicken", "1 cup rice", "2 cups peppers + onion"],
        ["Wrap chicken, rice, veg in foil with broth.", "Bake 200 °C, 25 min."]),
    ],
    [
      m("breakfast", "Granola + Yoghurt + Honey + Nuts", 0.25,
        ["1 cup yoghurt", "1/2 cup granola", "1 tbsp honey", "Walnuts"],
        ["Layer."]),
      m("lunch", "Salmon Quinoa Bowl", 0.35,
        ["150 g salmon", "1 cup quinoa", "Avocado, cucumber"],
        ["Bake salmon.", "Cook quinoa.", "Top with avocado and cucumber."]),
      m("dinner", "Beef & Sweet Potato Mash", 0.30,
        ["170 g beef", "1 sweet potato mashed", "Spinach"],
        ["Sear beef.", "Mash boiled sweet potato.", "Wilt spinach."]),
    ],
    [
      m("breakfast", "Egg & Cheese Bagel", 0.25,
        ["1 bagel", "3 eggs", "30 g cheese"],
        ["Scramble eggs with cheese; sandwich in bagel."]),
      m("lunch", "Chicken Couscous & Hummus", 0.35,
        ["180 g chicken", "1 cup couscous", "3 tbsp hummus"],
        ["Grill chicken.", "Cook couscous.", "Plate with hummus."]),
      m("dinner", "Halibut & Mashed Potato", 0.30,
        ["170 g halibut", "1 cup mash", "Peas"],
        ["Bake halibut.", "Mash potato.", "Steam peas."]),
    ],
    [
      m("breakfast", "Loaded Smoothie", 0.25,
        ["2 scoops whey", "1.5 cups milk", "1 banana", "1 tbsp PB", "1/3 cup oats"],
        ["Blend until thick."]),
      m("lunch", "Turkey & Avocado Wrap", 0.35,
        ["180 g turkey", "1 large wrap", "1/2 avocado", "Greens"],
        ["Layer and roll."]),
      m("dinner", "Salmon Teriyaki & Rice", 0.30,
        ["170 g salmon", "1 cup rice", "Tamari, honey, ginger", "Bok choy"],
        ["Glaze and bake salmon 12 min.", "Cook rice; steam bok choy."]),
    ],
    [
      m("breakfast", "PB Banana Toast Stack", 0.25,
        ["Rye", "PB", "Banana"], ["Repeat Mon."]),
      m("lunch", "Turkey Pasta Bowl", 0.35,
        ["Turkey", "Pasta", "Sauce"], ["Repeat Mon."]),
      m("dinner", "Cod & Couscous", 0.30,
        ["170 g cod", "1 cup couscous", "Roasted veg"],
        ["Bake cod 12 min.", "Cook couscous.", "Add veg."]),
    ],
    [
      m("breakfast", "Granola + Yoghurt + Honey + Nuts", 0.25,
        ["Yoghurt", "Granola", "Nuts"], ["Repeat Tue."]),
      m("lunch", "Salmon Quinoa Bowl", 0.35,
        ["Salmon", "Quinoa", "Avocado"], ["Repeat Tue."]),
      m("dinner", "Chicken Tikka & Rice", 0.30,
        ["180 g chicken", "1 cup rice", "Yoghurt + tikka spice"],
        ["Marinate chicken.", "Bake 18 min.", "Serve over rice."]),
    ],
    [
      m("breakfast", "Egg & Cheese Bagel", 0.25,
        ["Bagel", "Eggs", "Cheese"], ["Repeat Wed."]),
      m("lunch", "Chicken Couscous & Hummus", 0.35,
        ["Chicken", "Couscous", "Hummus"], ["Repeat Wed."]),
      m("dinner", "Halibut & Mashed Potato", 0.30,
        ["Halibut", "Mash", "Peas"], ["Repeat Wed."]),
    ],
  ],
  3: [
    [
      m("breakfast", "Steak & Egg Burrito", 0.25,
        ["80 g steak", "3 eggs", "1 large tortilla", "Salsa"],
        ["Sear steak.", "Scramble eggs.", "Wrap with salsa."]),
      m("lunch", "Chicken Pasta Primavera", 0.35,
        ["180 g chicken", "1 cup pasta", "1.5 cups veg", "Olive oil"],
        ["Cook pasta.", "Sauté veg + chicken.", "Combine."]),
      m("dinner", "Salmon Sweet-Potato Foil Pack", 0.30,
        ["170 g salmon", "1 sweet potato", "Asparagus"],
        ["Wrap in foil; bake 200 °C, 22 min."]),
    ],
    [
      m("breakfast", "Banana French Toast", 0.25,
        ["3 slices rye", "3 eggs", "1 banana", "Cinnamon"],
        ["Dip bread; cook 2 min/side; top with banana."]),
      m("lunch", "Beef Burrito Bowl", 0.35,
        ["170 g beef", "1 cup rice", "Beans, salsa, avocado"],
        ["Sear beef; assemble bowl."]),
      m("dinner", "Chicken Biryani (light)", 0.30,
        ["180 g chicken", "1 cup rice", "Yoghurt + spices"],
        ["Marinate, layer with rice; bake 25 min."]),
    ],
    [
      m("breakfast", "Mass Smoothie + Toast", 0.25,
        ["2 scoops whey", "1.5 cups milk", "1 banana", "2 slices rye + jam"],
        ["Blend smoothie; serve with toast."]),
      m("lunch", "Salmon Poke Bowl", 0.35,
        ["150 g salmon", "1 cup rice", "Avocado, edamame, sesame"],
        ["Cube salmon, marinate.", "Build over rice with toppings."]),
      m("dinner", "Lamb & Couscous", 0.30,
        ["150 g lamb", "1 cup couscous", "Roasted veg"],
        ["Sear lamb.", "Cook couscous.", "Plate with veg."]),
    ],
    [
      m("breakfast", "Loaded Bagel", 0.25,
        ["1 bagel", "60 g smoked salmon", "1 tbsp cream cheese", "Capers"],
        ["Spread cream cheese; layer salmon and capers."]),
      m("lunch", "Chicken & Rice Curry", 0.35,
        ["180 g chicken", "1 cup rice", "Coconut curry sauce"],
        ["Simmer chicken in curry 18 min.", "Serve over rice."]),
      m("dinner", "Beef Stew & Mash", 0.30,
        ["150 g beef stew meat", "1 cup mash", "Carrot"],
        ["Brown beef, simmer with carrot 50 min.", "Serve over mash."]),
    ],
    [
      m("breakfast", "Steak & Egg Burrito", 0.25,
        ["Steak", "Eggs", "Tortilla"], ["Repeat Mon."]),
      m("lunch", "Chicken Pasta Primavera", 0.35,
        ["Chicken", "Pasta", "Veg"], ["Repeat Mon."]),
      m("dinner", "Halibut & Rice Pilaf", 0.30,
        ["170 g halibut", "1 cup rice", "Mushroom, onion"],
        ["Sauté mushroom + onion into rice.", "Bake halibut 12 min."]),
    ],
    [
      m("breakfast", "Banana French Toast", 0.25,
        ["Rye", "Eggs", "Banana"], ["Repeat Tue."]),
      m("lunch", "Beef Burrito Bowl", 0.35,
        ["Beef", "Rice", "Beans"], ["Repeat Tue."]),
      m("dinner", "Chicken Tagine & Couscous", 0.30,
        ["180 g chicken", "1 cup couscous", "Apricots, broth"],
        ["Brown chicken; simmer with apricots 25 min."]),
    ],
    [
      m("breakfast", "Mass Smoothie + Toast", 0.25,
        ["Whey", "Milk", "Banana"], ["Repeat Wed."]),
      m("lunch", "Salmon Poke Bowl", 0.35,
        ["Salmon", "Rice", "Avocado"], ["Repeat Wed."]),
      m("dinner", "Lamb & Couscous", 0.30,
        ["Lamb", "Couscous", "Veg"], ["Repeat Wed."]),
    ],
  ],
};

/* ============================================================================
 * SNACKS — shared per theme (small pool, rotated by day index).
 * ========================================================================== */

const snacksByTheme: Record<Theme, MealTpl[]> = {
  lean: [
    m("snack", "Pear & Almonds", 0.10, ["1 pear", "10 almonds"], ["Slice pear; serve with almonds."]),
    m("snack", "Cucumber & Hummus", 0.10, ["1 cup cucumber", "2 tbsp hummus"], ["Dip and enjoy."]),
    m("snack", "Greek Yoghurt", 0.10, ["3/4 cup yoghurt", "Cinnamon"], ["Sprinkle and serve."]),
    m("snack", "Apple & Walnuts", 0.10, ["1 apple", "8 walnut halves"], ["Slice and serve."]),
    m("snack", "Hard-Boiled Egg", 0.10, ["1 egg", "Sea salt"], ["Boil 8 min; cool and peel."]),
    m("snack", "Berries & Chia", 0.10, ["1 cup berries", "1 tsp chia"], ["Combine."]),
    m("snack", "Cottage Cheese & Tomato", 0.10, ["1/2 cup cottage cheese", "1 tomato"], ["Top cheese with sliced tomato."]),
  ],
  muscle: [
    m("snack", "Whey Shake", 0.10, ["1 scoop whey", "1 cup milk"], ["Shake and drink."]),
    m("snack", "Tuna on Crackers", 0.10, ["1/2 can tuna", "4 whole-grain crackers"], ["Spoon tuna onto crackers."]),
    m("snack", "Cottage Cheese & Pineapple", 0.10, ["3/4 cup cottage cheese", "1/4 cup pineapple"], ["Combine."]),
    m("snack", "Boiled Eggs", 0.10, ["2 eggs", "Salt and pepper"], ["Boil 8 min; peel."]),
    m("snack", "Greek Yoghurt + Honey", 0.10, ["3/4 cup yoghurt", "1 tsp honey"], ["Stir and serve."]),
    m("snack", "Beef Jerky & Apple", 0.10, ["30 g beef jerky", "1 apple"], ["Eat together."]),
    m("snack", "Almonds & Cheese Stick", 0.10, ["10 almonds", "1 mozzarella stick"], ["Eat as-is."]),
  ],
  endurance: [
    m("snack", "Banana & PB", 0.10, ["1 banana", "1 tbsp PB"], ["Spread PB on banana."]),
    m("snack", "Trail Mix", 0.10, ["1/4 cup trail mix"], ["Eat as-is."]),
    m("snack", "Rice Cakes & Honey", 0.10, ["2 rice cakes", "1 tsp honey"], ["Drizzle honey."]),
    m("snack", "Energy Date Bites", 0.10, ["2 medjool dates", "1 tbsp tahini"], ["Stuff dates with tahini."]),
    m("snack", "Apple & Cheese", 0.10, ["1 apple", "1 cheese stick"], ["Slice apple."]),
    m("snack", "Yoghurt & Granola", 0.10, ["1/2 cup yoghurt", "2 tbsp granola"], ["Layer."]),
    m("snack", "Toast & Jam", 0.10, ["1 slice rye", "1 tsp jam"], ["Toast and spread."]),
  ],
};

/* ============================================================================
 * REGISTRY: theme + goal -> Variant -> 7-day breakfast/lunch/dinner cycles.
 * ========================================================================== */

const REGISTRY: Record<Theme, Record<Goal, Record<Variant, MealTpl[][]>>> = {
  lean:      { lose: leanLose,      gain: leanGain      },
  muscle:    { lose: muscleLose,    gain: muscleGain    },
  endurance: { lose: enduranceLose, gain: enduranceGain },
};

/* ============================================================================
 * GAIN-WEIGHT addons + level scaling
 * ========================================================================== */

const GAIN_BOOSTERS: Record<Slot, { ingredient: string; step: string }> = {
  breakfast: { ingredient: "1 tbsp peanut butter on the side", step: "Add the PB for ~95 kcal of healthy fat." },
  lunch:     { ingredient: "1/2 avocado", step: "Add sliced avocado for ~120 kcal of healthy fat." },
  dinner:    { ingredient: "Extra 1/2 cup cooked rice or quinoa", step: "Add the extra carb to support recovery and gain." },
  snack:     { ingredient: "1 medjool date + 1 tbsp tahini", step: "Add this energy boost between the main snack."  },
};

/** Strip implicit "halal" prefixes — the whole app is halal. */
function cleanIngredient(line: string): string {
  return line
    .replace(/\bhalal[- ]certified\s+/gi, "")
    .replace(/\bhalal\s+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Beginner = 5–7 ingredients, ≤4 quick steps. Intermediate/Advanced unchanged. */
function applyLevel(
  ingredients: string[],
  steps: string[],
  level: Level,
): { ingredients: string[]; steps: string[] } {
  if (level !== "beginner") return { ingredients, steps };
  return {
    ingredients: ingredients.slice(0, 7),
    steps: steps.slice(0, 4),
  };
}

function toMeal(t: MealTpl, targetKcal: number, goal: Goal, level: Level): Meal {
  const baseIng = goal === "gain" ? [...t.ingredients, GAIN_BOOSTERS[t.slot].ingredient] : t.ingredients;
  const baseSteps = goal === "gain" ? [...t.steps, GAIN_BOOSTERS[t.slot].step] : t.steps;
  const scaled = applyLevel(baseIng.map(cleanIngredient), baseSteps, level);
  const extra = goal === "gain" ? 100 : 0;
  const calories = Math.round(targetKcal * t.pct) + extra;
  // Macro split heuristic per slot — protein-forward at lunch/dinner, carb-forward at breakfast/snack.
  // Returns calories that approximately reconcile (4 kcal/g protein & carb, 9 kcal/g fat).
  const split: Record<Slot, { p: number; c: number; f: number }> = {
    breakfast: { p: 0.20, c: 0.50, f: 0.30 },
    lunch:     { p: 0.35, c: 0.40, f: 0.25 },
    dinner:    { p: 0.40, c: 0.35, f: 0.25 },
    snack:     { p: 0.20, c: 0.55, f: 0.25 },
  };
  const s = split[t.slot];
  const protein = Math.round((calories * s.p) / 4);
  const carbs = Math.round((calories * s.c) / 4);
  const fat = Math.round((calories * s.f) / 9);
  return {
    slot: t.slot,
    title: t.title,
    kcal: calories,
    ingredients: scaled.ingredients,
    steps: scaled.steps,
    macros: { protein, carbs, fat, calories },
  };
}

/** Pick the next variant within the same theme/goal for Option B. */
function nextVariant(v: Variant): Variant {
  return ((v % 3) + 1) as Variant;
}

function slotsForDay(
  theme: Theme,
  goal: Goal,
  variant: Variant,
  level: Level,
  dayOfWeek: number,
  targetKcal: number,
): MealSlot[] {
  const cycleA = REGISTRY[theme][goal][variant];
  const cycleB = REGISTRY[theme][goal][nextVariant(variant)];
  const dayA = cycleA[dayOfWeek];
  const dayB = cycleB[dayOfWeek] ?? dayA;
  const snackPool = snacksByTheme[theme];
  // Snack rotates day-by-day; Option B snack is the next snack in the pool.
  const snackA = snackPool[dayOfWeek % snackPool.length];
  const snackB = snackPool[(dayOfWeek + 1) % snackPool.length];

  const slots: MealSlot[] = dayA.map((tplA, i) => {
    const tplB = dayB[i] ?? tplA;
    return {
      slot: tplA.slot,
      options: [toMeal(tplA, targetKcal, goal, level), toMeal(tplB, targetKcal, goal, level)],
    };
  });
  slots.push({
    slot: "snack",
    options: [toMeal(snackA, targetKcal, goal, level), toMeal(snackB, targetKcal, goal, level)],
  });
  return slots;
}

/** Build 30 days of meal slots tailored to discipline + level + goal + variant. */
export function build30DayMeals(
  discipline: Discipline,
  level: Level,
  goal: Goal,
  variant: Variant,
  targetKcal: number,
): MealSlot[][] {
  const theme = themeFor(discipline);
  const out: MealSlot[][] = [];
  for (let i = 0; i < 30; i++) {
    const weekIdx = Math.floor(i / 7);
    const dayOfWeek = (i % 7 + weekIdx) % 7;
    out.push(slotsForDay(theme, goal, variant, level, dayOfWeek, targetKcal));
  }
  return out;
}
