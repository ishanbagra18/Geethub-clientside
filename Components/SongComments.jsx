/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Heart, Trash2, Send, Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../src/config/api";

const getUidFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.Uid;
  } catch {
    return null;
  }
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const QUICK_CHIPS = [
  "Great song ❤️",
  "Amazing 🔥",
  "Masterpiece 💎",
  "On repeat 🎧",
  "Pure vibes ✨",
];

const SongComments = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [likingId, setLikingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const inputRef = useRef(null);
  const currentUserId = getUidFromToken();

  // Fetch comments
  useEffect(() => {
    if (!songId) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/comments/${songId}`);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [songId]);

  // Post comment
  const handlePost = async (textToPost = null) => {
    const content = (textToPost || newComment).trim();
    if (!content || posting) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setPosting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/comments/${songId}`,
        { text: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPosting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setDeletingId(commentId);
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Like comment
  const handleLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token || likingId) return;

    setLikingId(commentId);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const likes = c.likes || [];
          if (res.data.liked) {
            return { ...c, likes: [...likes, currentUserId] };
          } else {
            return { ...c, likes: likes.filter((id) => id !== currentUserId) };
          }
        })
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    } finally {
      setLikingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-zinc-800/80 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 text-violet-400">
            <MessageCircle size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Community Comments
              <Sparkles size={16} className="text-pink-400 animate-pulse" />
            </h3>
            <p className="text-xs text-zinc-400">Join the conversation on this track</p>
          </div>
        </div>
        <span className="text-xs text-zinc-300 bg-zinc-800/80 px-3.5 py-1.5 rounded-full font-bold border border-zinc-700/60">
          {comments.length} Comments
        </span>
      </div>

      {/* Quick Reaction Chips */}
      {currentUserId && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1 mr-1">
            Quick:
          </span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handlePost(chip)}
              disabled={posting}
              className="px-3.5 py-1.5 rounded-full bg-zinc-800/60 hover:bg-violet-600/30 hover:border-violet-500/50 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/50 transition-all duration-200 flex-shrink-0 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {currentUserId ? (
        <div className="mb-8 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/30 via-pink-600/20 to-blue-600/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md focus-within:border-violet-500/50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-lg shadow-violet-500/20">
              {localStorage.getItem("user_emoji") || "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                maxLength={500}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-500 resize-none focus:outline-none text-sm leading-relaxed"
                style={{ minHeight: "28px", maxHeight: "120px" }}
                onInput={(e) => {
                  e.target.style.height = "28px";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
                <span className={`text-[11px] font-mono transition-colors ${newComment.length > 450 ? "text-amber-400" : newComment.length > 490 ? "text-red-400" : "text-zinc-500"}`}>
                  {newComment.length}/500
                </span>
                <button
                  onClick={() => handlePost()}
                  disabled={!newComment.trim() || posting}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${
                    newComment.trim()
                      ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-95"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {posting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {posting ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <p className="text-zinc-400 text-sm">
            <a href="/login" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
              Sign in
            </a>{" "}
            to join the discussion and post comments
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-violet-400" />
          <span className="text-zinc-400 text-sm font-medium">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-14 bg-zinc-900/30 rounded-3xl border border-zinc-800/40">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-zinc-800/60 flex items-center justify-center text-zinc-500">
            <MessageCircle size={26} />
          </div>
          <p className="text-zinc-300 font-bold">No comments yet</p>
          <p className="text-zinc-500 text-xs mt-1">Be the first to comment on this track!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment, idx) => {
            const isOwn = currentUserId && comment.user_id === currentUserId;
            const isLiked = currentUserId && (comment.likes || []).includes(currentUserId);
            const likeCount = (comment.likes || []).length;

            return (
              <div
                key={comment.id || idx}
                className="group relative p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700/60 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-base flex-shrink-0 shadow-md">
                    {comment.user_emoji || comment.user_name?.[0]?.toUpperCase() || "👤"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">
                          {comment.user_name || "Listener"}
                        </span>
                        {isOwn && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                            YOU
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {timeAgo(comment.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-wrap font-normal">
                      {comment.text}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-800/40">
                      <button
                        onClick={() => handleLike(comment.id)}
                        disabled={!currentUserId || likingId === comment.id}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-200 ${
                          isLiked
                            ? "text-pink-500"
                            : "text-zinc-400 hover:text-pink-400"
                        } ${!currentUserId ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <Heart
                          size={14}
                          fill={isLiked ? "currentColor" : "none"}
                          className={`transition-transform duration-200 ${isLiked ? "scale-110" : "group-hover:scale-110"}`}
                        />
                        <span>{likeCount > 0 ? likeCount : "Like"}</span>
                      </button>

                      {isOwn && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 font-semibold transition-all opacity-0 group-hover:opacity-100"
                        >
                          {deletingId === comment.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongComments;
