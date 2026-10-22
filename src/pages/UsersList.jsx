
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import {
  UserRound,
  LoaderCircle,
  MessageCircle,
  Search,
  Sparkles,
  ArrowUpRight,
  X,
  UsersRound,
  Music2,
  ChevronRight,
} from 'lucide-react';
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
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

const getFullName = (user) =>
  `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
  'Community Member';

const getInitials = (user) => {
  const name = getFullName(user);

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        const token = getToken();

        if (!token) {
          toast.error('Please login to view community messages');
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${API_BASE}/auth/messagingusers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cancelled) return;

        const filteredUsers = (response.data || []).filter(
          (user) => user.user_id !== currentUserId
        );

        setUsers(filteredUsers);
      } catch (error) {
        if (cancelled) return;

        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, navigate]);

  const handleUserClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const name = getFullName(user).toLowerCase();
    const email = (user.email || '').toLowerCase();

    return (
      name.includes(normalizedQuery) ||
      email.includes(normalizedQuery)
    );
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#090b10] text-white selection:bg-cyan-400/30">
      <Navbar />

      <main className="relative mx-auto min-h-[calc(100vh-80px)] w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-16 -z-0 h-72 w-[min(90%,700px)] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[110px]"
        />

        <div className="relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
            <Music2 size={15} />
            <span>Community</span>
            <ChevronRight size={14} />
            <span className="text-slate-300">Messages</span>
          </div>

          {/* Page heading */}
          <section className="mb-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-cyan-300">
              <Sparkles size={14} />
              YOUR MUSIC COMMUNITY
            </div>

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Find your people.
                  <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Start a conversation.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Connect with fellow listeners, discover shared interests,
                  and make every conversation part of your music journey.
                </p>
              </div>

              {/* Community count */}
              {!loading && (
                <div className="flex w-fit shrink-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
                    <UsersRound size={19} />
                  </div>

                  <div>
                    <p className="text-xl font-semibold leading-tight text-white">
                      {users.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Community members
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Search and results toolbar */}
          <section className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-md">
                <div className="group flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#11141c] px-4 transition-all duration-300 focus-within:border-cyan-400/40 focus-within:ring-4 focus-within:ring-cyan-400/[0.06]">
                  <Search
                    size={19}
                    className="shrink-0 text-slate-500 transition-colors group-focus-within:text-cyan-300"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by name or email..."
                    aria-label="Search community members"
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {!loading && (
                <p className="text-sm text-slate-500">
                  Showing{' '}
                  <span className="font-medium text-slate-300">
                    {filteredUsers.length}
                  </span>{' '}
                  of {users.length} members
                </p>
              )}
            </div>
          </section>

          {/* Section heading */}
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Discover members
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose someone to start chatting
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400">
              <MessageCircle size={17} />
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-white/[0.06] bg-[#11141c] p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/[0.06]" />

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="h-3.5 w-3/4 rounded bg-white/[0.07]" />
                      <div className="h-3 w-full rounded bg-white/[0.04]" />
                    </div>
                  </div>

                  <div className="mt-6 h-10 rounded-xl bg-white/[0.04]" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[330px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.10] bg-white/[0.015] px-6 py-14 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.07] text-indigo-300">
                {searchQuery ? (
                  <Search size={27} />
                ) : (
                  <UserRound size={27} />
                )}
              </div>

              <h3 className="text-lg font-semibold text-white">
                {searchQuery
                  ? 'No members found'
                  : 'Your community starts here'}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {searchQuery
                  ? 'We could not find anyone matching your search. Try another name or email.'
                  : 'There are no other members available right now. Check back later to connect with new listeners.'}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2.5 text-sm font-medium text-cyan-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/[0.12]"
                >
                  <X size={15} />
                  Clear search
                </button>
              )}
            </div>
          ) : (
            /* Members grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user, index) => (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => handleUserClick(user.user_id)}
                  aria-label={`Start a conversation with ${getFullName(user)}`}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#11141c] p-5 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#141923] hover:shadow-[0_12px_40px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 motion-reduce:transform-none motion-reduce:transition-none"
                  style={{
                    animation: 'memberFadeIn 450ms ease-out both',
                    animationDelay: `${Math.min(index, 8) * 45}ms`,
                  }}
                >
                  {/* Subtle top accent */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Profile */}
                  <div className="flex w-full min-w-0 items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="rounded-2xl bg-gradient-to-br from-cyan-400/70 via-blue-500/60 to-indigo-500/70 p-px transition-transform duration-300 group-hover:scale-105">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[15px] bg-[#171b27] text-lg font-semibold text-cyan-100">
                          {user.emoji || getInitials(user)}
                        </div>
                      </div>

                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-[#11141c] bg-[#11141c]">
                        <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold text-slate-100 transition-colors duration-200 group-hover:text-cyan-200">
                        {getFullName(user)}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email || 'Community member'}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-500 transition-all duration-300 group-hover:border-cyan-400/20 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
                      <ArrowUpRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="mt-6 flex w-full items-center justify-between border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-200">
                      <MessageCircle
                        size={15}
                        className="text-cyan-300/80"
                      />
                      Start a conversation
                    </div>

                    <span className="text-xs text-slate-600 transition-colors group-hover:text-cyan-300">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Bottom note */}
          {!loading && filteredUsers.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-600">
              <Sparkles size={13} className="text-indigo-400/70" />
              Good conversations start with a shared vibe.
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes memberFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersList;
