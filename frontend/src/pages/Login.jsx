import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Droplet, Moon, Sun } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Error is already shown by toast in AuthContext
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Model Background - Now in back */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Spline scene="https://prod.spline.design/H3KNk3yz8XLS22If/scene.splinecode" />
      </div>
      
      {/* Overlay Gradient (very subtle, so spline stays visible) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/5 to-transparent z-10"></div>
      
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDarkMode();
          }}
          className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg hover:bg-white/20 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          type="button"
        >
          {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-white" size={20} />}
        </button>
      </div>
      
      {/* Content - In front */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/60 mb-4 shadow-lg backdrop-blur-sm">
              <Droplet className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white/90 mb-2">Vien Link</h1>
            <p className="text-gray-300/70">Blood Bank Management System</p>
          </div>

          <div className="rounded-xl bg-transparent backdrop-blur-xl border border-white/10 shadow-xl p-6">
            <CardHeader className="text-center">
              <CardTitle className="text-white/80">Sign in to your account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-transparent border border-white/10 text-white/85 placeholder-gray-300/70"
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-transparent border border-white/10 text-white/85 placeholder-gray-300/70"
                />

                <Button
                  type="submit"
                  className="w-full bg-primary-600/40 hover:bg-primary-700/50 backdrop-blur-md text-white/90 border border-white/5"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400/60">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-300/60 hover:text-primary-200/80 font-medium"
                >
                  Register your hospital
                </Link>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
};

