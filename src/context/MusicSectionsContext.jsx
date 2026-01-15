import  { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const MusicSectionsContext = createContext();

export const useMusicSections = () => {
  const context = useContext(MusicSectionsContext);
  if (!context) {
    throw new Error('useMusicSections must be used within MusicSectionsProvider');
  }
  return context;
};

export const MusicSectionsProvider = ({ children }) => {
  const [sections, setSections] = useState({
    topCharts: [],
    mostLiked: [],
    mostSaved: [],
    hindiSongs: [],
    punjabiSongs: [],
    latestReleased: [],
    communityPlaylists: [],
    trendingSongs: [],
  });

  const [loading, setLoading] = useState({
    topCharts: true,
    mostLiked: true,
    mostSaved: true,
    hindiSongs: true,
    punjabiSongs: true,
    trendingSongs: true,
    latestReleased: true,
    communityPlaylists: true,
  });

  const getToken = () => localStorage.getItem('token');

  // Fetch Top Charts
  const fetchTopCharts = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/allsongs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, topCharts: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching top charts:', error);
      setSections((prev) => ({ ...prev, topCharts: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, topCharts: false }));
    }
  }, []);

  // Fetch Most Liked
  const fetchMostLiked = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/topsongs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, mostLiked: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching most liked:', error);
      setSections((prev) => ({ ...prev, mostLiked: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, mostLiked: false }));
    }
  }, []);

  // Fetch Most Saved
  const fetchMostSaved = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, mostSaved: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching most saved:', error);
      setSections((prev) => ({ ...prev, mostSaved: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, mostSaved: false }));
    }
  }, []);

  // Fetch Hindi Songs
  const fetchHindiSongs = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/hindisongs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, hindiSongs: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching Hindi songs:', error);
      setSections((prev) => ({ ...prev, hindiSongs: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, hindiSongs: false }));
    }
  }, []);

  // Fetch Punjabi Songs
  const fetchPunjabiSongs = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/punjabisongs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, punjabiSongs: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching Punjabi songs:', error);
      setSections((prev) => ({ ...prev, punjabiSongs: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, punjabiSongs: false }));
    }
  }, []);

  // Fetch Latest Released
  const fetchLatestReleased = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/latestreleased`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, latestReleased: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching latest released:', error);
      setSections((prev) => ({ ...prev, latestReleased: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, latestReleased: false }));
    }
  }, []);

  // Fetch Community Playlists (Public Playlists)
  const fetchCommunityPlaylists = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, communityPlaylists: response.data.playlists || [] }));
    } catch (error) {
      console.error('Error fetching community playlists:', error);
      setSections((prev) => ({ ...prev, communityPlaylists: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, communityPlaylists: false }));
    }
  }, []);

  // Fetch Trending Songs
  const fetchTrendingSongs = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/music/trendingsongs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSections((prev) => ({ ...prev, trendingSongs: response.data.songs || [] }));
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      setSections((prev) => ({ ...prev, trendingSongs: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, trendingSongs: false }));
    }
  }, []);

  // Fetch all on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchTopCharts();
      fetchMostLiked();
      fetchMostSaved();
      fetchHindiSongs();
      fetchPunjabiSongs();
      fetchLatestReleased();
      fetchCommunityPlaylists();
      fetchTrendingSongs();
    }
  }, [fetchTopCharts, fetchMostLiked, fetchMostSaved, fetchHindiSongs, fetchPunjabiSongs, fetchLatestReleased, fetchCommunityPlaylists, fetchTrendingSongs]);

  return (
    <MusicSectionsContext.Provider
      value={{
        sections,
        loading,
        fetchTopCharts,
        fetchMostLiked,
        fetchMostSaved,
        fetchHindiSongs,
        fetchPunjabiSongs,
        fetchLatestReleased,
        fetchCommunityPlaylists,
        fetchTrendingSongs,
      }}
    >
      {children}
    </MusicSectionsContext.Provider>
  );
};

MusicSectionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
