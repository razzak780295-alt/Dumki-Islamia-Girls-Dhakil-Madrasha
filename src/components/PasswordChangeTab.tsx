import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, RefreshCw, Eye, EyeOff, User, Lock, Save } from 'lucide-react';

interface PasswordChangeTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  onForceLogout: () => void;
}

export default function PasswordChangeTab({ showToast, onForceLogout }: PasswordChangeTabProps) {
  // Credentials change states
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Field error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset to default credentials
  const handleResetToDefault = () => {
    const isAgree = window.confirm(
      'আপনি কি নিশ্চিত যে সিস্টেমে ডিফল্ট ক্রেডেনশিয়ালস ফিরিয়ে আনতে চান? (Are you sure you want to restore default admin/dumki2024 credentials?)'
    );
    if (isAgree) {
      localStorage.setItem(
        'madrasha_credentials',
        JSON.stringify({ username: 'admin', password: 'dumki2024' })
      );
      showToast('লগইন তথ্য সফলভাবে ডিফল্টে রিসেট করা হয়েছে! (Credentials reset to default!)', 'success');
      // Clear fields
      setCurrentUsername('');
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      
      // Auto logout after 1 second so they use new default
      setTimeout(() => {
        onForceLogout();
      }, 1000);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Get current stored credentials
    let activeUsername = 'admin';
    let activePassword = 'dumki2024';

    const stored = localStorage.getItem('madrasha_credentials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.username && parsed.password) {
          activeUsername = parsed.username.trim();
          activePassword = parsed.password;
        }
      } catch (err) {
        console.error('Error parsing credentials:', err);
      }
    }

    // Validation checks
    if (!currentUsername.trim()) {
      newErrors.currentUsername = 'বর্তমান ইউজারনেম পূরণ করুন!';
    } else if (currentUsername.trim() !== activeUsername) {
      newErrors.currentUsername = 'ভুল বর্তমান ইউজারনেম!';
    }

    if (!currentPassword) {
      newErrors.currentPassword = 'বর্তমান পাসওয়ার্ড পূরণ করুন!';
    } else if (currentPassword !== activePassword) {
      newErrors.currentPassword = 'ভুল বর্তমান পাসওয়ার্ড!';
    }

    if (!newUsername.trim()) {
      newErrors.newUsername = 'নতুন ইউজারনেম খালি রাখা যাবে না!';
    }

    if (!newPassword) {
      newErrors.newPassword = 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'পাসওয়ার্ড নিশ্চিতকরণ ফিল্ড পূরণ করুন!';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মেলেনি!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('অনুগ্রহপূর্বক সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন!', 'error');
      return;
    }

    // Success - Save and auto logout
    setErrors({});
    const newCredentials = {
      username: newUsername.trim(),
      password: newPassword
    };

    localStorage.setItem('madrasha_credentials', JSON.stringify(newCredentials));
    showToast('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! ২ সেকেন্ড পর অটো-লগআউট হবে।', 'success');

    setTimeout(() => {
      onForceLogout();
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in no-print font-sans">
      
      {/* Title */}
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-madrasha-green-700 tracking-tight flex items-center gap-2">
            🔐 পাসওয়ার্ড পরিবর্তন (Change Password)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">
            Change administrative login credentials securely
          </p>
        </div>
        <div className="h-[2px] w-12 bg-madrasha-gold-500"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Informative Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-3 text-xs text-zinc-750">
            <h3 className="font-bold text-madrasha-green-800 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>নিরাপত্তা নিরাপত্তা নির্দেশনা (Secure Guidelines)</span>
            </h3>
            <p className="leading-relaxed">
              সিস্টেমকে সুরক্ষিত রাখতে মাঝে মাঝে প্রশাসনিক ইউজারনেম ও পাসওয়ার্ড পরিবর্তন করা উচিত। 
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-600 font-medium">
              <li>ইউজারনেম বা পাসওয়ার্ড ফাঁকা রাখা যাবে না।</li>
              <li>পাসওয়ার্ডে অন্তত <strong className="text-madrasha-green-700">৬টি অক্ষর</strong> বা সংখ্যা ব্যবহার করতে হবে।</li>
              <li>নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড অবশ্যই হুবহু মিলতে হবে।</li>
              <li>পরিবর্তন সফল হলে ২ সেকেন্ড পর অটো-লগআউট করা হবে নতুন পিন দিয়ে পুনরায় লগইনের জন্য।</li>
            </ul>
          </div>

          <div className="bg-rose-50 border border-thin border-rose-200 rounded-xl p-4 text-xs font-sans text-rose-800 flex gap-2.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">সতর্কতা! (Warning)</p>
              <p className="text-[10px] text-rose-750 mt-0.5 leading-relaxed font-medium">
                নতুন পাসওয়ার্ড নিরাপদ স্থানে লিখে রাখুন। ভুলে গেলে "ডিফল্টে ফিরুন" ব্যবহার করে রিসেট করতে পারবেন।
              </p>
            </div>
          </div>
        </div>

        {/* Password Form Panel */}
        <form onSubmit={handleUpdatePassword} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <h3 className="text-xs font-bold text-madrasha-green-750 uppercase tracking-wide border-b pb-2">
            ক্রেডেনশিয়ালস পরিবর্তন ফর্ম (Password Change Fields)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Current Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 block">
                বর্তমান ইউজারনেম (Current Username) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={currentUsername}
                  onChange={(e) => {
                    setCurrentUsername(e.target.value);
                    if (errors.currentUsername) {
                      setErrors(prev => ({ ...prev, currentUsername: '' }));
                    }
                  }}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
                />
              </div>
              {errors.currentUsername && (
                <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1.5 rounded inline-block">
                  {errors.currentUsername}
                </p>
              )}
            </div>

            {/* Current Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 block">
                বর্তমান পাসওয়ার্ড (Current Password) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) {
                      setErrors(prev => ({ ...prev, currentPassword: '' }));
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-madrasha-green-600 transition"
                >
                  {showCurrentPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1.5 rounded inline-block">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 block">
                নতুন ইউজারনেম (New Username) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    if (errors.newUsername) {
                      setErrors(prev => ({ ...prev, newUsername: '' }));
                    }
                  }}
                  placeholder="নতুন ইউজারনেম লিখুন"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
                />
              </div>
              {errors.newUsername && (
                <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1.5 rounded inline-block">
                  {errors.newUsername}
                </p>
              )}
            </div>

            <div /> {/* Spacer */}

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 block">
                নতুন পাসওয়ার্ড (New Password) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors(prev => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  placeholder="কমপক্ষে ৬ জোড়া ক্যারেক্টার"
                  className="w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-madrasha-green-600 transition"
                >
                  {showNewPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1.5 rounded inline-block">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 block">
                পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full pl-9 pr-9 py-2 border rounded-lg focus:ring-2 focus:ring-madrasha-green-600 border-zinc-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-madrasha-green-600 transition"
                >
                  {showConfirmPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1.5 rounded inline-block">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

          </div>

          {/* Form Actions footer buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t justify-between items-center bg-transparent">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 font-bold text-xs rounded-lg transition duration-200 flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              <span>ডিফল্টে ফিরুন (Reset to Default)</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-madrasha-green-600 hover:bg-madrasha-green-700 text-white font-extrabold text-xs rounded-lg transition duration-200 shadow hover:shadow-md flex items-center gap-1.5 focus:ring-2 focus:ring-offset-1 focus:ring-madrasha-green-600"
            >
              <Save className="h-4 w-4" />
              <span>পরিবর্তন সংরক্ষণ করুন (Save Admin Credentials)</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
