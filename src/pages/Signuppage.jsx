import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import API_BASE_URL from '../config/api';

const Signuppage = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [usertype, setUsertype] = useState("USER");
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
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstname":
        if (!value.trim()) error = "First name is required";
        else if (value.length < 2) error = "First name must be at least 2 characters";
        break;
      case "lastname":
        if (!value.trim()) error = "Last name is required";
        else if (value.length < 2) error = "Last name must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!validateEmail(value)) error = "Please enter a valid email address";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (!validatePassword(value)) error = "Password must be at least 8 characters";
        break;
      case "phone":
        if (!value) error = "Phone number is required";
        else if (!validatePhone(value)) error = "Please enter a valid phone number";
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, eval(field));
    setErrors({ ...errors, [field]: error });
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
    
    // Validate all fields
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

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms and Privacy Policy");
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
      });

      console.log("✅ Signup Success:", response.data);
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("❌ Signup Error:", error.response?.data || error.message);
      toast.error("Signup failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };
// this was added in this 
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo to-slate-900 p-4 md:p-6">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />

      <div className="relative w-full max-w-5xl bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col lg:flex-row">

        {/* Left Section - Modern Hero with Background Image */}
        <div className="lg:w-1/2 w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 p-0 relative overflow-hidden">
          {/* No overlay, clean gradient background */}
          {/* Large gradient circle background */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-pink-500/10 rounded-full blur-3xl" style={{zIndex: 2}}></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-pink-500/20 via-indigo-500/10 to-violet-500/10 rounded-full blur-2xl" style={{zIndex: 2}}></div>
          <div className="relative z-10 w-full flex flex-col items-center justify-center px-8 py-16" style={{zIndex: 3}}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-500 rounded-full shadow-2xl mb-6 animate-pulse">
                <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center leading-tight mb-2 drop-shadow-xl">
                Welcome to GeetHub
              </h2>
              <p className="text-indigo-200/80 text-lg md:text-xl text-center max-w-xs mb-4">
                Your music, your vibe. Join a vibrant community and discover your next favorite song.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <span className="px-4 py-2 bg-indigo-600/20 text-indigo-200 rounded-full font-semibold text-sm shadow">🎵 Curated Playlists</span>
              <span className="px-4 py-2 bg-violet-600/20 text-violet-200 rounded-full font-semibold text-sm shadow">🎧 HD Audio</span>
              <span className="px-4 py-2 bg-pink-600/20 text-pink-200 rounded-full font-semibold text-sm shadow">💜 Community</span>
              <span className="px-4 py-2 bg-white/10 text-white/80 rounded-full font-semibold text-sm shadow">🌟 Exclusive</span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-indigo-100/80 text-base font-medium">"Music is the shorthand of emotion."</p>
              <p className="text-indigo-300 text-xs mt-1">— Leo Tolstoy</p>
            </div>
          </div>
        </div>

        {/* Right Section - Signup Form */}
        <div className="lg:w-1/2 w-full p-6 md:p-10 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-slate-400 text-sm">
                Start your musical journey today
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">First Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      onBlur={() => handleBlur("firstname")}
                      type="text"
                      required
                      placeholder="John"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border ${
                        touched.firstname && errors.firstname 
                          ? "border-red-500 focus:ring-red-500" 
                          : touched.firstname && !errors.firstname
                          ? "border-green-500 focus:ring-green-500"
                          : "border-slate-700 focus:ring-indigo-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                    />
                  </div>
                  {touched.firstname && errors.firstname && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.firstname}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Last Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      onBlur={() => handleBlur("lastname")}
                      type="text"
                      required
                      placeholder="Doe"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border ${
                        touched.lastname && errors.lastname 
                          ? "border-red-500 focus:ring-red-500" 
                          : touched.lastname && !errors.lastname
                          ? "border-green-500 focus:ring-green-500"
                          : "border-slate-700 focus:ring-indigo-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                    />
                  </div>
                  {touched.lastname && errors.lastname && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.lastname}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    type="email"
                    required
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border ${
                      touched.email && errors.email 
                        ? "border-red-500 focus:ring-red-500" 
                        : touched.email && !errors.email
                        ? "border-green-500 focus:ring-green-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-800/50 border ${
                      touched.password && errors.password 
                        ? "border-red-500 focus:ring-red-500" 
                        : touched.password && !errors.password
                        ? "border-green-500 focus:ring-green-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Password strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 1 ? "text-red-400" :
                        passwordStrength <= 2 ? "text-orange-400" :
                        passwordStrength <= 3 ? "text-yellow-400" :
                        passwordStrength <= 4 ? "text-lime-400" :
                        "text-green-400"
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength ? getPasswordStrengthColor() : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Use 8+ characters with uppercase, lowercase, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur("phone")}
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    maxLength="14"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border ${
                      touched.phone && errors.phone 
                        ? "border-red-500 focus:ring-red-500" 
                        : touched.phone && !errors.phone
                        ? "border-green-500 focus:ring-green-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* User Type Selector */}
              <div className="mt-2">
                <label className="block text-slate-300 text-sm font-medium mb-1.5">User Type</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                    </svg>
                  </span>
                  <select
                    value={usertype}
                    onChange={e => setUsertype(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 appearance-none"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="mt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-md bg-slate-800/50 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all duration-300 flex items-center justify-center">
                      {agreedToTerms && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    I agree to the{" "}
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium underline" onClick={(e) => e.stopPropagation()}>
                      Terms of Service
                    </a>
                    {" "}and{" "}
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium underline" onClick={(e) => e.stopPropagation()}>
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full relative bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : ''}`}>
                  Create Account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-slate-400 text-sm pt-2">
                Already have an account?{" "}
                <a 
                  href="/login" 
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
                >
                  Sign in
                </a>
              </p>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-400">
                    <span className="text-indigo-400 font-semibold">Secure & Private:</span> Your data is encrypted and protected. We never share your information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signuppage;
