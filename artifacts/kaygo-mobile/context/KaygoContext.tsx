import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  verificationStatus: string;
}

interface KaygoContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const KaygoContext = createContext<KaygoContextType | null>(null);

export function KaygoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem("kaygo_user"),
          AsyncStorage.getItem("kaygo_token"),
        ]);
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const login = async (u: User, t: string) => {
    setUser(u);
    setToken(t);
    await AsyncStorage.multiSet([
      ["kaygo_user", JSON.stringify(u)],
      ["kaygo_token", t],
    ]);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(["kaygo_user", "kaygo_token"]);
  };

  const updateUser = (u: User) => {
    setUser(u);
    AsyncStorage.setItem("kaygo_user", JSON.stringify(u));
  };

  return (
    <KaygoContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </KaygoContext.Provider>
  );
}

export function useKaygo() {
  const ctx = useContext(KaygoContext);
  if (!ctx) throw new Error("useKaygo must be used inside KaygoProvider");
  return ctx;
}
