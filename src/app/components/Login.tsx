import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
// verified paths based on your folder structure src/imports/
import thaliImage from '../../imports/plate.png'; 
import officialLogo from '../../imports/logo.png';

interface LoginProps {
  onLogin: (userData: any, redirectTo: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success('Login successful!');
        onLogin(data.user, data.redirect_to);
      } else {
        const errorMessage = data.detail || 'Login failed. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Network error. Please check if the backend is running.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
         style={{ background: 'linear-gradient(to bottom right, #C9D5A8, #81A894, #1B4332)' }}>
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ backgroundColor: '#81A894' }}></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: '#3A2F27' }}></div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* LEFT SIDE: Branding & Interactive Illustration */}
        <div className="hidden lg:flex flex-col flex-1 text-left">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={officialLogo} 
                  alt="MealSync Logo" 
                  className="w-full h-full object-cover mix-blend-multiply" 
                />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-[#1B4332]">MealSync</h1>
                <div className="space-y-4 mb-2"></div>
                <p className="text-sm font-medium text-[#3A2F27]">
                   Midday Meal Monitoring and Nutrition System
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-4xl font-bold leading-tight text-[#3A2F27]">
              Welcome to <br />
              <span className="text-[#1B4332]">Nutritious Future</span>
            </h2>
            <p className="text-lg leading-relaxed max-w-md text-[#3A2F27]/80">
              Monitor school meals, track nutrition, and ensure every child gets a healthy, balanced diet.
            </p>
          </div>

          <div className="relative">
  <div className="w-96 h-96 relative">
    {/* The main plate with a soft glow behind it */}
    <div className="absolute inset-0 rounded-full bg-[#1B4332]/10 blur-3xl"></div>
    <img
      src={thaliImage}
      alt="Indian Thali"
      className="w-full h-full object-cover rounded-full shadow-2xl border-[10px] border-white/20 relative z-10"
    />
    
    {/* Modern "Pulse" Points instead of messy lines */}
    
              {/* Label 1: Top Right */}
              <div className="absolute top-[15%] -right-12 z-20 flex items-center gap-3">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#FF4D4D]"></div>
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Fiber</p>
                  <p className="text-[#3A2F27] font-black text-sm">Veg: 100g</p>
                </div>
              </div>

              {/* Label 2: Left Side */}
              <div className="absolute top-[40%] -left-20 z-20 flex items-center gap-3 flex-row-reverse">
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#81A894]"></div>
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Protein</p>
                  <p className="text-[#3A2F27] font-black text-sm">Dal: 70g</p>
                </div>
              </div>

              {/* Label 3: Bottom Right */}
              <div className="absolute bottom-[15%] -right-10 z-20 flex items-center gap-3">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#FFD700]"></div>
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Carbs</p>
                  <p className="text-[#3A2F27] font-black text-sm">Rice: 150g</p>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="absolute -bottom-6 -left-4 z-20 px-6 py-2 rounded-full shadow-lg font-bold bg-[#3A2F27] text-[#F5F5DC] text-xs tracking-widest uppercase">
                Balanced Diet Verified
              </div>
            </div>
          </div>  
        </div>
        {/* RIGHT SIDE: Login Card */}
        <div className="flex-1 max-w-md w-full">
          <div className="bg-[#F5F5DC] rounded-[2rem] shadow-2xl p-10 flex flex-col items-center border border-[#D2B48C]/30">
            
            <h2 className="text-3xl font-bold text-[#3A2F27] text-center">Enter your Credentials!</h2>

            {/* THE EMPTY SPACE LINE */}
            <div className="h-10" /> 

            {error && (
              <div className="w-full mb-6 p-4 bg-[#E8C5B5]/30 border border-[#3A2F27]/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#3A2F27] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#3A2F27] font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              {/* Username Section */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#3A2F27] mb-3 ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-white/50 border border-[#D2B48C] rounded-xl focus:ring-2 focus:ring-[#3A2F27] outline-none transition-all text-[#3A2F27] placeholder-[#3A2F27]/30"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Section */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#3A2F27] mb-3 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3A2F27]/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-[#D2B48C] rounded-xl focus:ring-2 focus:ring-[#3A2F27] outline-none transition-all text-[#3A2F27] placeholder-[#3A2F27]/30"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3A2F27]/40 hover:text-[#3A2F27]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3A2F27] text-[#F5F5DC] py-4 rounded-xl font-bold hover:bg-[#1B4332] transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#F5F5DC] border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="w-full mt-8 p-4 bg-[#D2B48C]/10 rounded-xl border border-[#D2B48C]/20 text-center">
              <p className="text-[10px] text-[#3A2F27]/70 leading-relaxed uppercase tracking-tighter">
                <span className="font-bold">Note:</span> Please use your assigned credentials to log in. Contact your administrator if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite ease-in-out; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}