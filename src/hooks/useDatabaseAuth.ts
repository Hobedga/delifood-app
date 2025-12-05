import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

export const useDatabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const register = async (data: User) => {
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  };

  const login = async (username: string, password: string) => {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return { user, register, login, logout };
};
