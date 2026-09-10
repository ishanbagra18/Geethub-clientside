import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Navbar from '../../Components/Navbar';
import { ArrowLeft, Play, Pause, Trophy, Flame, Zap, Award, RefreshCw, CheckCircle2, XCircle, Sparkles, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const BADGES = [
  { id: 'first_win', name: 'Desi Novice', emoji: '🎵', desc: 'Score your first correct song guess', threshold: 1, type: 'score' },
  { id: 'streak_3', name: 'Dhol King', emoji: '⚡', desc: 'Get 3 correct guesses in a row', threshold: 3, type: 'streak' },
  { id: 'bolly_buff', name: 'BollyBuff Master', emoji: '👑', desc: 'Score 500+ points in trivia', threshold: 500, type: 'points' },
  { id: 'maestro', name: 'Sufi Maestro', emoji: '🎶', desc: 'Score 1000+ points in trivia', threshold: 1000, type: 'points' },
];

const DesiMusicTrivia = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [songsList, setSongsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timer, setTimer] = useState(15);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('desi_trivia_badges');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Fetch songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const list = res.data?.songs || res.data || [];
        setSongsList(list);
      } catch (err) {
        console.error('Trivia song fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Generate a new trivia round
  const generateNewRound = (allSongs) => {
    const pool = allSongs && allSongs.length > 0 ? allSongs : songsList;
    if (!pool || pool.length === 0) return;

    // Pick 1 correct target song
    const targetIndex = Math.floor(Math.random() * pool.length);
    const target = pool[targetIndex];

    // Pick 3 distractor songs
    const distractors = pool.filter((_, idx) => idx !== targetIndex);
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);

    // Combine & shuffle options
    const options = [target, ...shuffledDistractors].sort(() => 0.5 - Math.random());

    setCurrentQuestion({
      targetSong: target,
      options: options,
    });

    setSelectedOption(null);
    setIsAnswered(false);
    setTimer(15);
    setIsPlayingAudio(false);

    // Auto play audio clip snippet
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = target.file_url || target.song_url || target.url || DEFAULT_AUDIO;
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.log('Audio autoplay blocked:', e);
      });
    }
  };

  useEffect(() => {
    if (!loading && songsList.length > 0 && !currentQuestion) {
      generateNewRound(songsList);
    }
  }, [loading, songsList]);

  // Countdown Timer
  useEffect(() => {
    if (isAnswered || !currentQuestion) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isAnswered, currentQuestion]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setStreak(0);
    if (audioRef.current) audioRef.current.pause();
    toast.error('Time up! ⌛ No points awarded.');
  };

  const handleOptionSelect = (option) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOption(option);
    if (audioRef.current) audioRef.current.pause();

    const isCorrect = (option.song_id || option.id) === (currentQuestion.targetSong.song_id || currentQuestion.targetSong.id);

    setTotalQuestions((prev) => prev + 1);

    if (isCorrect) {
      const timeBonus = timer * 10;
      const pointsWon = 100 + timeBonus;
      const newScore = score + pointsWon;
      const newStreak = streak + 1;
      const newCorrectCount = correctAnswersCount + 1;

      setScore(newScore);
      setStreak(newStreak);
      setCorrectAnswersCount(newCorrectCount);

      toast.success(`Correct! +${pointsWon} PTS 🎉`, {
        icon: '🎯',
        style: {
          borderRadius: '14px',
          background: '#064e3b',
          color: '#34d399',
          border: '1px solid #10b981',
        },
      });

      // Check badges
      checkBadges(newCorrectCount, newStreak, newScore);
    } else {
      setStreak(0);
      toast.error(`Wrong choice! The correct song was "${currentQuestion.targetSong.title}"`, {
        icon: '❌',
        style: {
          borderRadius: '14px',
          background: '#450a0a',
          color: '#f87171',
          border: '1px solid #ef4444',
        },
      });
    }
  };

  const checkBadges = (correctCount, currentStreak, currentScore) => {
    const newlyUnlocked = [];

    BADGES.forEach((badge) => {
      if (!unlockedBadges.includes(badge.id)) {
        let conditionMet = false;
        if (badge.type === 'score' && correctCount >= badge.threshold) conditionMet = true;
        if (badge.type === 'streak' && currentStreak >= badge.threshold) conditionMet = true;
        if (badge.type === 'points' && currentScore >= badge.threshold) conditionMet = true;

        if (conditionMet) {
          newlyUnlocked.push(badge.id);
          toast(`UNLOCKED BADGE: ${badge.emoji} ${badge.name}!`, {
            icon: '🏆',
            duration: 4000,
            style: {
              borderRadius: '16px',
              background: '#1e1b4b',
              color: '#a855f7',
              border: '2px solid #8b5cf6',
              fontWeight: 'bold',
            },
          });
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      const updated = [...unlockedBadges, ...newlyUnlocked];
      setUnlockedBadges(updated);
      localStorage.setItem('desi_trivia_badges', JSON.stringify(updated));
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-black text-slate-100 font-sans pb-20">
      <Navbar />

      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} />

      <div className="pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-3 font-medium text-sm"
            >
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-rose-500/20">
                <Trophy size={26} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Desi Music Trivia Arena 🏆
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  Listen to the audio clip & guess the Indian track to earn points & badges!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Badges Header */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Score</span>
              <span className="text-xl font-extrabold text-amber-400">{score}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Streak</span>
              <span className="text-xl font-extrabold text-rose-400 flex items-center justify-center gap-1">
                <Flame size={16} fill="currentColor" />
                {streak}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Badges</span>
              <span className="text-xl font-extrabold text-purple-400">{unlockedBadges.length}/{BADGES.length}</span>
            </div>
          </div>
        </div>

        {/* Main Trivia Arena */}
        {loading ? (
          <div className="h-96 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-800 flex items-center justify-center">
            <p className="text-slate-400 font-bold">Loading Music Trivia Arena...</p>
          </div>
        ) : !currentQuestion ? (
          <div className="py-20 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            <p className="text-lg font-semibold">No songs available for trivia right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Question & Options (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Question Card Header */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <Volume2 size={14} />
                    Question #{totalQuestions + 1}
                  </span>

                  {/* Countdown Circle Timer */}
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-sm border ${
                    timer <= 5
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                      : 'bg-slate-800 text-cyan-300 border-slate-700'
                  }`}>
                    <span>⏱️</span>
                    <span>{timer}s</span>
                  </div>
                </div>

                {/* Audio Snippet Trigger Box */}
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950/40 border border-slate-800/80 text-center relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30 mb-4 cursor-pointer hover:scale-110 transition-transform" onClick={toggleAudio}>
                    {isPlayingAudio ? <Pause size={32} /> : <Play size={32} className="ml-1" fill="currentColor" />}
                  </div>

                  <p className="text-white text-lg font-bold">
                    {isPlayingAudio ? '🔊 Playing 10-Second Audio Clip...' : '▶ Click Play to Listen Again'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Guess which song is playing from the choices below!
                  </p>
                </div>
              </div>

              {/* 4 Answer Choice Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const targetId = currentQuestion.targetSong.song_id || currentQuestion.targetSong.id;
                  const optionId = option.song_id || option.id;
                  const isTarget = optionId === targetId;
                  const isSelected = selectedOption && (selectedOption.song_id || selectedOption.id) === optionId;

                  let btnStyle = 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 text-white';
                  if (isAnswered) {
                    if (isTarget) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50';
                    } else if (isSelected && !isTarget) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={optionId || idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(option)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-3 shadow-lg ${btnStyle}`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mb-0.5">
                          Option {String.fromCharCode(65 + idx)}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base truncate">
                          {option.title || 'Untitled'}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {option.artist || 'Unknown Artist'}
                        </p>
                      </div>

                      {isAnswered && (
                        <div>
                          {isTarget ? (
                            <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle size={24} className="text-rose-400 flex-shrink-0" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Question CTA */}
              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => generateNewRound(songsList)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-sm font-extrabold shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
                  >
                    <RefreshCw size={18} />
                    <span>Next Trivia Round →</span>
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Desi Achievement Badges Showcase */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="text-purple-400" size={22} />
                  <h3 className="text-lg font-black text-white">Desi Achievement Badges</h3>
                </div>

                <div className="space-y-3">
                  {BADGES.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);

                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                          isUnlocked
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 shadow-lg shadow-purple-500/10'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                          isUnlocked ? 'bg-purple-900/60 border border-purple-500/50' : 'bg-slate-900 border border-slate-800'
                        }`}>
                          {badge.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                              {badge.name}
                            </h4>
                            {isUnlocked && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                                UNLOCKED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {badge.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DesiMusicTrivia;
