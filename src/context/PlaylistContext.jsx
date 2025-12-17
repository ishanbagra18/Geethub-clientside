import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

// ================= CONTEXT =================
const PlaylistContext = createContext(null);

// ================= CUSTOM HOOK =================
export const usePlaylist = () => useContext(PlaylistContext);

// ================= PROVIDER =================
export const PlaylistProvider = ({ children }) => {
  // 🔐 User playlists
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌍 Public playlists
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [errorPublic, setErrorPublic] = useState(null);

  // =====================================================
  // 🌍 FETCH PUBLIC PLAYLISTS (NO AUTH)
  // =====================================================
  const fetchPublicPlaylists = useCallback(async () => {
    setIsLoadingPublic(true);
    setErrorPublic(null);

    try {
      const res = await axios.get("http://localhost:9000/playlists");

      // Supports: { playlists: [] } OR []
      setPublicPlaylists(res.data.playlists || res.data || []);
    } catch (err) {
      console.error("❌ Public playlists error:", err);
      setErrorPublic(err);
    } finally {
      setIsLoadingPublic(false);
    }
  }, []);

  // =====================================================
  // 🔐 FETCH USER PLAYLISTS (AUTH)
  // =====================================================
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setPlaylists([]);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:9000/playlist/playlists",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPlaylists(res.data.playlists || []);
      } catch (err) {
        console.error("❌ User playlists error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlaylists();
  }, []);

  return (
    <PlaylistContext.Provider
      value={{
        // User
        playlists,
        setPlaylists,
        loading,
        error,

        // Public
        publicPlaylists,
        fetchPublicPlaylists,
        isLoadingPublic,
        errorPublic,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};
