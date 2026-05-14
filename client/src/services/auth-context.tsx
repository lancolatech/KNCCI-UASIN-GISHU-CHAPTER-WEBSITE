import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/auth-service';
import { useLocation } from 'wouter';

interface User {
    _id: string;
    name: string;
    email: string;
    reg_no: string;
    role: string;
    phone?: string;
    requirePasswordChange?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<User>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    temporaryPassword: string | null;
    clearTemporaryPassword: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TEMP_PASSWORD_STORAGE_KEY = 'temporaryPassword';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedTemporaryPassword = sessionStorage.getItem(TEMP_PASSWORD_STORAGE_KEY);

            if (storedTemporaryPassword) {
                setTemporaryPassword(storedTemporaryPassword);
            }

            if (token) {
                try {
                    const response = await authService.getMe();
                    if (response.success) {
                        setUser(response.data);
                        if (!response.data.requirePasswordChange) {
                            sessionStorage.removeItem(TEMP_PASSWORD_STORAGE_KEY);
                            setTemporaryPassword(null);
                        }
                    } else {
                        localStorage.removeItem('accessToken');
                        sessionStorage.removeItem(TEMP_PASSWORD_STORAGE_KEY);
                        setTemporaryPassword(null);
                    }
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    localStorage.removeItem('accessToken');
                    sessionStorage.removeItem(TEMP_PASSWORD_STORAGE_KEY);
                    setTemporaryPassword(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: any): Promise<User> => {
        try {
            const response = await authService.login(credentials);
            if (response.success) {
                localStorage.setItem('accessToken', response.data.accessToken);
                setUser(response.data.user);

                const shouldKeepTemporaryPassword =
                    response.data.user?.requirePasswordChange &&
                    typeof credentials?.password === 'string' &&
                    credentials.password.length > 0;

                if (shouldKeepTemporaryPassword) {
                    setTemporaryPassword(credentials.password);
                    sessionStorage.setItem(TEMP_PASSWORD_STORAGE_KEY, credentials.password);
                } else {
                    setTemporaryPassword(null);
                    sessionStorage.removeItem(TEMP_PASSWORD_STORAGE_KEY);
                }

                return response.data.user;
            }
            throw new Error('Login failed');
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem(TEMP_PASSWORD_STORAGE_KEY);
        setTemporaryPassword(null);
        setUser(null);
        setLocation('/');
    };

    const clearTemporaryPassword = () => {
        sessionStorage.removeItem(TEMP_PASSWORD_STORAGE_KEY);
        setTemporaryPassword(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                updateUser,
                temporaryPassword,
                clearTemporaryPassword,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
