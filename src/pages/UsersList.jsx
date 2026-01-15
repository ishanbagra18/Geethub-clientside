import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { User, Loader2, MessageCircle } from 'lucide-react';
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
        toast.error('Please login to view users');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE}/auth/messagingusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out current user
      const filteredUsers = response.data.filter(
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
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent mb-4">
              Start a Conversation
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Select a user to send messages
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full px-6 py-3 bg-gray-800/50 text-white rounded-full border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-12"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={48} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <User size={64} className="mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No Users Found' : 'No Users Available'}
              </h3>
              <p className="text-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'There are no other users to chat with at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => handleUserClick(user.user_id)}
                  className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-xl font-semibold truncate group-hover:text-blue-400 transition-colors">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate mt-1">
                        {user.email}
                      </p>
                    </div>

                    {/* Chat Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <MessageCircle className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersList;
