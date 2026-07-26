import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "./api"; 

interface User {
  pk: number;
  email: string;
  // agrega los campos que tenga tu modelo Usuario
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password1: string, password2: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar la app, revisa si hay token y trae el usuario
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/dj-rest-auth/user/");
        setUser(data);
      } catch {
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/dj-rest-auth/login/", {
      email,
      password,
    });
    localStorage.setItem("auth_token", data.key);
    const userRes = await api.get("/dj-rest-auth/user/");
    setUser(userRes.data);
  };

  const register = async (email: string, password1: string, password2: string) => {
    await api.post("/dj-rest-auth/registration/", {
      email,
      password1,
      password2,
    });
    // No se loguea automáticamente porque tienes verificación de email obligatoria
  };

  const logout = async () => {
    try {
      await api.post("/dj-rest-auth/logout/");
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usarlo fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}