import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../src/config/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('weekly'); // 'weekly' or 'monthly'

  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view stats');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/stats/my?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Your Listening Stats
          </h1>
          <p className="text-gray-400 text-lg">
            Discover your music journey
          </p>
        </div>

        {/* Range Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-full p-1 inline-flex border border-gray-700">
            <button
              onClick={() => setRange('weekly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                range === 'weekly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setRange('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                range === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Minutes Listened Card */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">
              Minutes Listened
            </h3>
            <p className="text-5xl font-bold text-white mb-2">
              {stats?.minutes_listened || 0}
            </p>
            <p className="text-purple-400 text-sm">
              {range === 'weekly' ? 'This week' : 'This month'}
            </p>
          </div>

          {/* Top Song Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">
              Top Song
            </h3>
            {stats?.top_song ? (
              <div className="flex items-start gap-4">
                <img
                  src={stats.top_song.image || '/placeholder.jpg'}
                  alt={stats.top_song.title}
                  className="w-16 h-16 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg truncate mb-1">
                    {stats.top_song.title}
                  </p>
                  <p className="text-gray-400 text-sm truncate mb-2">
                    {stats.top_song.artist}
                  </p>
                  <p className="text-blue-400 text-xs font-semibold">
                    {stats.top_song.plays} plays
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          {/* Top Artist Card */}
          <div className="bg-gradient-to-br from-pink-600/20 to-rose-600/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-pink-500/30 p-3 rounded-xl">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">
              Top Artist
            </h3>
            {stats?.top_artist ? (
              <>
                <p className="text-white font-bold text-2xl mb-2 truncate">
                  {stats.top_artist.name}
                </p>
                <p className="text-pink-400 text-sm font-semibold">
                  {stats.top_artist.plays} plays
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Detailed Stats Section */}
        {stats?.top_song && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              🎵 Your Most Played Track
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img
                src={stats.top_song.image || '/placeholder.jpg'}
                alt={stats.top_song.title}
                className="w-48 h-48 rounded-2xl object-cover shadow-2xl"
              />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {stats.top_song.title}
                </h3>
                <p className="text-xl text-gray-400 mb-4">
                  by {stats.top_song.artist}
                </p>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    🔥 {stats.top_song.plays} plays
                  </span>
                  <span className="bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm font-semibold">
                    {range === 'weekly' ? 'This week' : 'This month'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!stats?.top_song && !stats?.top_artist && stats?.minutes_listened === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No listening data yet
              </h3>
              <p className="text-gray-500">
                Start listening to music to see your stats here!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;