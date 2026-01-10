    // Frontend types (camelCase)
    export interface PantryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiry: string;
    location: string;
    category: string;
    }

    export interface PantryFormData {
    name: string;
    quantity: number;
    unit: string;
    expiry: string;
    location: string;
    category: string;
    }

    // Backend types (snake_case from API)
    export interface BackendPantryItem {
    id: number | string;
    name: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    expiry?: string; // Support both for compatibility
    location: string;
    category: string;
    }

    // API Response types
    export interface PantryResponse {
    data: {
        items: BackendPantryItem[];
    };
    message?: string;
    }

    export interface SinglePantryResponse {
    data: {
        item: BackendPantryItem;
    };
    message?: string;
    }