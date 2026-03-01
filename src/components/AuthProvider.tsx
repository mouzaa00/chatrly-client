import { ReactNode, useEffect, useState } from "react";
import { fetchCurrentUser } from "../utils/helpers";
import { User } from "../utils/definitions";
import { authService } from "../authService";
import { LoginFormInput } from "../pages/Login";
import { AuthContext, RegisterData } from "../contexts/AuthContext";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const { user } = await fetchCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  const register = async (data: RegisterData) => {
    const { user } = await authService.register(data);
    setCurrentUser(user);
  };

  const login = async (credentials: LoginFormInput) => {
    const { user } = await authService.login(credentials);
    setCurrentUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
