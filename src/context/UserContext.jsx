import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from '../config/api';

const UserContext = createContext();

// ✅ Custom Hook
export const useUser = () => useContext(UserContext);

// ✅ Helper: decode userId from JWT
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.Uid; // 👈 matches your backend JWT
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = getUserIdFromToken();

        if (!token || !userId) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/auth/myprofile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data.user);
      } catch (err) {
        console.error("UserContext fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
