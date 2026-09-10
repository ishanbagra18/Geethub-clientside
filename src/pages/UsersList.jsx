import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { User, Loader2, MessageCircle, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const API_BASE = API_BASE_URL;

const getToken = () => localStorage.getItem('token');

const getUserIdFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.Uid;
  } catch (err) {
    console.error('Token decode error:', err);
    return null;
  }
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please login to view community messages');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE}/auth/messagingusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out current user
      const filteredUsers = (response.data || []).filter(
        (user) => user.user_id !== currentUserId
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header Hero Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Sparkles size={14} className="text-cyan-400 animate-pulse" />
            Desi Community Messages
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Start a <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Conversation</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Connect instantly with fellow listeners across India. Share favorite tracks, playlists, and vibes.
          </p>
          
          {/* Search Bar Container */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative flex items-center bg-[#14161f] rounded-full border border-slate-700/60 shadow-xl overflow-hidden">
                <Search className="ml-4 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                />
              </div>
            </div>
            {searchQuery && (
              <p className="text-xs text-cyan-400 font-semibold mt-2">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* Users Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-cyan-400" size={48} />
            <p className="text-gray-400 text-sm font-medium animate-pulse">Loading active listeners...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#12141d]/60 rounded-3xl border border-slate-800/80 p-8 text-center">
            <User size={56} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-1">
              {searchQuery ? 'No Matching Users Found' : 'No Other Users Available'}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              {searchQuery 
                ? 'Try searching with a different name or email keyword.' 
                : 'Check back later as new listeners join the platform!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => handleUserClick(user.user_id)}
                className="group relative bg-[#12141d]/80 hover:bg-[#181a26] rounded-2xl p-5 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  {/* User Avatar with Glow & Online Status Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl">
                        {user.emoji || user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    {/* Active online pulse dot */}
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#12141d] rounded-full shadow-sm"></span>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-lg font-bold truncate group-hover:text-cyan-300 transition-colors">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-gray-400 text-xs truncate mt-0.5 font-mono">
                      {user.email}
                    </p>
                  </div>

                  {/* Chat Action Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
                      <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersList;
