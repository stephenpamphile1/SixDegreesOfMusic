import React, { createContext, useContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface User {
    id: string;
    email: string;
    username: string;
    totalScore: number;
    currentStreak: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedUser = await AsyncStorage.getItem('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${apiBaseUrl}/login`, { email, password});
            const { token: newToken, user: userData } = response.data;

            await AsyncStorage.setItem('authToken', newToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
            throw new Error('Login failed!');
        }
    };

    const register = async (email: string, password: string, username: string) => {
        try {
            const response = await axios.post(`${apiBaseUrl}/register`, { email, password, username});

            await login(email, password);
        } catch (error) {
            throw new Error("Registration failed!");
        }
    }

    const logout = async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);