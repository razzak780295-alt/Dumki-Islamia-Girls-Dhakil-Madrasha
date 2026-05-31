import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function LoginScreen({ onLoginSuccess, showToast }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === 'dumki2024') {
      setError('');
      showToast('লগইন সফল হয়েছে! স্বাগত জানাচ্ছি। (Login successful! Welcome.)', 'success');
      onLoginSuccess();
    } else {
      setError('ভুল ব্যবহারকারীর নাম অথবা পাসওয়ার্ড! (Invalid username or password!)');
      showToast('লগইন ব্যর্থ হয়েছে! সঠিক তথ্য দিন। (Login failed! Provide correct credentials.)', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans select-none relative overflow-hidden border-t-4 border-madrasha-green-700">
      {/* Decorative Islamic Background Pattern Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-madrasha-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-madrasha-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-slate-200 p-6 relative z-10 transition-all duration-300">
        
        {/* Emblem/Logo */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 bg-madrasha-green-600 rounded-full flex items-center justify-center p-3 shadow-md border-2 border-madrasha-gold-500 hover:scale-105 transition-transform duration-300">
            {/* Islamic Crescent & Star Symbol Web Icon representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M 45,10 C 25,10 10,25 10,45 C 10,65 25,80 45,80 C 35,75 30,62 30,45 C 30,28 35,15 45,10 Z" />
              <polygon points="65,25 70,38 82,38 72,46 76,58 65,50 54,58 58,46 48,38 60,38" className="fill-madrasha-gold-400" />
            </svg>
          </div>
          <h1 className="mt-3 text-center text-lg font-bold text-madrasha-green-700 tracking-tight leading-tight">
            দুমকি ইসলামিয়া গার্লস মাদ্রাসা
          </h1>
          <p className="text-[10px] text-zinc-500 mt-0.5 uppercase font-bold tracking-wider font-sans">
            Dumki Islamia Girls Madrasha
          </p>
          <div className="h-[2px] w-12 bg-madrasha-gold-500 mt-2"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-700">
              ব্যবহারকারীর নাম (Username)
            </label>
            <div className="relative rounded-lg shadow-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 focus:border-madrasha-green-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-700">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative rounded-lg shadow-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-9 pr-9 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-madrasha-green-600 focus:border-madrasha-green-600 transition-colors"
              />
              <button
                id="password-toggle-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-madrasha-green-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <p id="login-error" className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100">
              {error}
            </p>
          )}

          <button
            id="login-btn"
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow hover:shadow-md text-xs font-bold text-white bg-madrasha-green-600 hover:bg-madrasha-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-madrasha-green-600 transition-all duration-200 font-sans cursor-pointer animate-fade-in"
          >
            লগইন করুন (Login)
          </button>
        </form>

        {/* Footer Credentials */}
        <div className="mt-5 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <p className="text-[10px] text-zinc-405 font-semibold">পরীক্ষার জন্য ব্যবহার করুন (Use for testing):</p>
          <div className="flex justify-center space-x-3 text-[10px] font-mono text-zinc-750 mt-1 select-all">
            <span>Name: <strong>admin</strong></span>
            <span>Pass: <strong>dumki2024</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
