import { RegisterData } from "./contexts/AuthContext";
import { LoginFormInput } from "./pages/Login";

export const authService = {
  register: async (data: RegisterData) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    return res.json();
  },
  login: async (credentials: LoginFormInput) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      },
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    return res.json();
  },
  logout: async () => {
    await fetch(
      `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  },
};
