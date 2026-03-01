import { User } from "./definitions";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshRes = await fetch(
      `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/auth/refresh`,
      {
        ...options,
        credentials: "include",
        method: "POST",
      },
    );

    if (!refreshRes.ok) {
      console.error("Refreshing failed, logging out...");
      throw new Error("Loggin out...");
    }

    return fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}

export async function fetchCurrentUser(): Promise<{ user: User }> {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/users/me`,
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }
  return res.json();
}
