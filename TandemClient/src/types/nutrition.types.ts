    /**
     * Nutrition feature types
     */

    // Frontend types (camelCase)
    export interface NutritionTarget {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    }

    export interface NutritionTargetFormData {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    }

    export interface PartnerIntake {
    userId: string;
    name: string;
    today: NutritionTarget;
    weekly: NutritionTarget;
    }

    export interface NutritionTargets {
    user: NutritionTarget | null;
    partner: NutritionTarget | null;
    }

    export interface SuggestedMeal {
    id: number;
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    }

    export interface NutritionRecommendationResult {
    partnersIntake: PartnerIntake[];
    recommendations: string[];
    suggestedMeals: SuggestedMeal[];
    targets?: NutritionTargets;
    }

    // Backend types (snake_case from API) - for nutrition target from API
    export interface BackendNutritionTarget {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    }

    // API Response types
    export interface NutritionTargetResponse {
    data: {
        target: BackendNutritionTarget | null;
    };
    message?: string;
    }

    export interface NutritionRecommendationResponse {
    partnersIntake?: PartnerIntake[];
    recommendations?: string[];
    suggestedMeals?: SuggestedMeal[];
    targets?: NutritionTargets;
    }