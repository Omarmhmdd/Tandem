export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v0.1';

const getToken = (): string | null => {
    const user = localStorage.getItem('tandem_user');
    if (!user) return null;
    
    try {
    const userData = JSON.parse(user);
    return userData.token || null;
    } catch {
    return null;
    }
};


const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {'Content-Type': 'application/json', 'Accept': 'application/json',
    };

    const token = getToken();
    if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};


const handleResponse = async <T>(response: Response): Promise<T> => {
  // Handle empty responses (204 No Content, etc.)
    if (response.status === 204 || response.statusText === 'No Content') {
    return null as T;
    }

  // Read response body once
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let errorData: any = null;
    let responseData: any = null;

    try {
        const text = await response.text();
        if (text) {
        const parsed = isJson ? JSON.parse(text) : text;
        if (response.ok) {
            responseData = parsed;
        } else {
            errorData = parsed;
        }
        }
    } catch (parseError) {
        // If parsing fails, use status text as error
        if (!response.ok) {
        errorData = { message: response.statusText };
        }
    }

  // Handle error responses
    if (!response.ok) {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
        // Clear user data from localStorage
        localStorage.removeItem('tandem_user');
        // Redirect to login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
        }
        
        // Handle validation errors (422)
        if (response.status === 422 && errorData?.errors) {
        const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => {
            const messageList = Array.isArray(messages) ? messages.join(', ') : String(messages);
            return `${field}: ${messageList}`;
            })
            .join('; ');
        throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        throw new Error(
        errorData?.message || 
        errorData?.error || 
        `API Error: ${response.status} ${response.statusText}`
        );
    }

    return responseData as T;
    };


    export const apiClient = {

    get: async <T>(endpoint: string): Promise<T> => {
        try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse<T>(response);
        } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Network error: ${String(error)}`);
        }
    },

    post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
        try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
        } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Network error: ${String(error)}`);
        }
    },
    };