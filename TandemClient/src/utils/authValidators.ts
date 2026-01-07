    export interface PasswordValidationResult {
    isValid: boolean;
    error?: string;
    }

    export const validatePassword = (password: string): PasswordValidationResult => {
    if (password.length < 8) {
        return {
        isValid: false,
        error: 'Password must be at least 8 characters',
        };
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        return {
        isValid: false,
        error: 'Password must contain both uppercase and lowercase letters',
        };
    }

    if (!/\d/.test(password)) {
        return {
        isValid: false,
        error: 'Password must contain at least one number',
        };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
        isValid: false,
        error: 'Password must contain at least one special character (!@#$%^&*)',
        };
    }

    return { isValid: true };
    };

    export const validatePasswordMatch = (password: string,confirmPassword: string): PasswordValidationResult => {
    if (password !== confirmPassword) {
        return {
        isValid: false,
        error: 'Passwords do not match',
        };
    }
    return { isValid: true };
    };