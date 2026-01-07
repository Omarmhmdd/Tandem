// Auth Types
// Auth Types

    export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    token?: string;
    }

    export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>;
  isLoading: boolean;
}

        export interface AuthResponse {
    message: string;
    data: {
        user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        };
        access_token: string;
        token_type: string;
    };
    }

    export interface AuthResult {
  success: boolean;
  error?: string;
}