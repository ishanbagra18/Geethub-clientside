import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { 
  Music, User, Mail, Lock, Phone, ShieldCheck, 
  Eye, EyeOff, Sparkles, Check, ArrowRight, Disc
} from "lucide-react";
import API_BASE_URL from '../config/api';

const PROFILE_EMOJIS = [
  "🎧", "🎸", "⚡", "🔥", "🎵", "🚀", "👑", "👽", 
  "🦊", "💎", "🌊", "🎹", "🎙️", "🌟", "🦄", "👾"
];

const Signuppage = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [usertype, setUsertype] = useState("USER");
  const [selectedEmoji, setSelectedEmoji] = useState("🎧");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Field validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  // Password strength calculator
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Validation functions
  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const validatePhone = (val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const validatePassword = (val) => {
    return val.length >= 8;
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstname":
        if (!value.trim()) error = "First name is required";
        else if (value.length < 2) error = "Min 2 characters required";
        break;
      case "lastname":
        if (!value.trim()) error = "Last name is required";
        else if (value.length < 2) error = "Min 2 characters required";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!validateEmail(value)) error = "Please enter a valid email";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (!validatePassword(value)) error = "Min 8 characters required";
        break;
      case "phone":
        if (!value) error = "Phone number is required";
        else if (!validatePhone(value)) error = "Valid 10-digit phone required";
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    let val = "";
    if (field === "firstname") val = firstname;
    if (field === "lastname") val = lastname;
    if (field === "email") val = email;
    if (field === "password") val = password;
    if (field === "phone") val = phone;

    const error = validateField(field, val);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    newErrors.firstname = validateField("firstname", firstname);
    newErrors.lastname = validateField("lastname", lastname);
    newErrors.email = validateField("email", email);
    newErrors.password = validateField("password", password);
    newErrors.phone = validateField("phone", phone);
    
    setErrors(newErrors);
    setTouched({
      firstname: true,
      lastname: true,
      email: true,
      password: true,
      phone: true
    });

    if (Object.values(newErrors).some(err => err)) {
      toast.error("Please resolve the highlighted validation errors");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please accept the Terms & Privacy Policy to register");
      return;
    }

    setIsLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const response = await axios.post(`${API_BASE_URL}/register`, {
        first_name: firstname,
        last_name: lastname,
        email: email,
        password: password,
        phone: cleanedPhone,
        user_type: usertype,
        emoji: selectedEmoji,
      });

      console.log("✅ Signup Success:", response.data);
      if (selectedEmoji) {
        localStorage.setItem("user_emoji", selectedEmoji);
      }
      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1400);
    } catch (error) {
      console.error("❌ Signup Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-[#11131c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">

        {/* Left Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-purple-950/80 p-8 lg:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="relative z-10">
            {/* Brand Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Geet<span className="text-blue-400">Hub</span></span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Join the sound revolution.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Stream millions of high-definition tracks, build custom playlists, and connect with a community of music lovers.
            </p>

            {/* Selected Avatar Preview */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-8 flex items-center gap-4 shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center text-3xl shadow-lg relative">
                {selectedEmoji}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#11131c] flex items-center justify-center">
                  <Check size={10} className="text-black stroke-[3]" />
                </span>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-blue-400 tracking-wider">Your Profile Badge</p>
                <h4 className="text-base font-bold text-white">
                  {firstname || lastname ? `${firstname} ${lastname}`.trim() : "Music Enthusiast"}
                </h4>
                <p className="text-xs text-slate-400">{email || "Tap an emoji to set avatar"}</p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold">✓</div>
                <span>Spatial Audio & Lossless Streaming</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 font-bold">✓</div>
                <span>Private & Community Playlists</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold">✓</div>
                <span>Real-time Direct Music Sharing</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/5 mt-8 text-xs text-slate-500">
            Need assistance? Contact support@geethub.com
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 bg-[#11131c]/60 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Fill in your details below to activate your account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* EMOJI AVATAR SELECTOR */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                <span>Choose Profile Emoji Avatar</span>
                <span className="text-[11px] text-blue-400 font-normal">
                  {selectedEmoji ? `Selected: ${selectedEmoji}` : "No Emoji Selected"}
                </span>
              </label>
              <div className="p-3 rounded-2xl bg-[#181a26] border border-white/10 grid grid-cols-6 sm:grid-cols-9 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmoji("")}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                    selectedEmoji === ""
                      ? 'bg-blue-600 text-white border-2 border-blue-400 scale-105 shadow-lg shadow-blue-500/40'
                      : 'bg-white/5 hover:bg-white/15 text-slate-400 border border-transparent'
                  }`}
                  title="No Emoji Avatar (Use Default Initials)"
                >
                  <span>🚫</span>
                  <span className="text-[8px] uppercase">None</span>
                </button>

                {PROFILE_EMOJIS.filter(e => e !== "").map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedEmoji === emoji 
                        ? 'bg-blue-600 border-2 border-blue-400 scale-110 shadow-lg shadow-blue-500/40' 
                        : 'bg-white/5 hover:bg-white/15 border border-transparent hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* NAME FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    onBlur={() => handleBlur("firstname")}
                    required
                    placeholder="John"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181a26] border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      touched.firstname && errors.firstname
                        ? "border-red-500/80 focus:border-red-500"
                        : touched.firstname && !errors.firstname
                        ? "border-emerald-500/80 focus:border-emerald-500"
                        : "border-white/10 focus:border-blue-500"
                    }`}
                  />
                </div>
                {touched.firstname && errors.firstname && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstname}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    onBlur={() => handleBlur("lastname")}
                    required
                    placeholder="Doe"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181a26] border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      touched.lastname && errors.lastname
                        ? "border-red-500/80 focus:border-red-500"
                        : touched.lastname && !errors.lastname
                        ? "border-emerald-500/80 focus:border-emerald-500"
                        : "border-white/10 focus:border-blue-500"
                    }`}
                  />
                </div>
                {touched.lastname && errors.lastname && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastname}</p>
                )}
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                  placeholder="john.doe@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181a26] border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.email && errors.email
                      ? "border-red-500/80 focus:border-red-500"
                      : touched.email && !errors.email
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  required
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#181a26] border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.password && errors.password
                      ? "border-red-500/80 focus:border-red-500"
                      : touched.password && !errors.password
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 p-2 rounded-lg bg-black/20 border border-white/5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-bold text-slate-200">{getPasswordStrengthText()}</span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength ? getPasswordStrengthColor() : "bg-slate-700/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PHONE FIELD */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur("phone")}
                  required
                  placeholder="(555) 123-4567"
                  maxLength="14"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181a26] border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.phone && errors.phone
                      ? "border-red-500/80 focus:border-red-500"
                      : touched.phone && !errors.phone
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* USER TYPE SELECTOR */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Account Role</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <select
                  value={usertype}
                  onChange={(e) => setUsertype(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181a26] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="USER">User (Standard Account)</option>
                  <option value="ADMIN">Admin (Platform Manager)</option>
                </select>
              </div>
            </div>

            {/* TERMS CHECKBOX */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-[#181a26] text-blue-500 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I agree to the <a href="#" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline">Privacy Policy</a>.
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-xs text-slate-400 pt-2">
              Already have an account?{" "}
              <a href="/login" className="text-blue-400 font-bold hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Signuppage;
