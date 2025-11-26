import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicAuth } from '../context/PublicAuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import publicApi from '../lib/publicApi';

export const UserLogin = () => {
  const { login } = usePublicAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Signed in successfully');
      navigate('/user/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    try {
      const response = await publicApi.post('/public-auth/forgot-password', { email: resetEmail || form.email });
      
      if (response.data.verificationCode) {
        toast.success(`Verification code: ${response.data.verificationCode}`);
      } else {
        toast.success('Verification code generated');
      }
      
      setResetStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate verification code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await publicApi.post('/public-auth/reset-password', {
        email: resetEmail || form.email,
        code: resetCode,
        newPassword,
      });
      toast.success('Password reset successfully. You can now sign in.');
      setShowReset(false);
      setResetStep(1);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Public User Sign In</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
            Sign in to request blood, book donations, and view your rewards.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            required
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-primary-600 dark:text-primary-300 hover:underline"
              onClick={() => setShowReset(true)}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
            New here?{' '}
            <Link to="/user/signup" className="text-primary-600 dark:text-primary-400 font-medium">
              Create a public account
            </Link>
          </p>
        </form>

        {showReset && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {resetStep === 1 ? 'Reset password - send code' : 'Reset password - verify code'}
            </h2>
            {resetStep === 1 ? (
              <form onSubmit={handleRequestResetCode} className="space-y-3">
                <Input
                  label="Email"
                  type="email"
                  value={resetEmail || form.email}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReset(false);
                      setResetStep(1);
                      setResetEmail('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Send code
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <Input
                  label="Verification code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <div className="flex justify-between items-center gap-2">
                  <button
                    type="button"
                    className="text-xs text-primary-600 dark:text-primary-300 hover:underline"
                    onClick={() => setResetStep(1)}
                  >
                    Back
                  </button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReset(false);
                        setResetStep(1);
                        setResetEmail('');
                        setResetCode('');
                        setNewPassword('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Reset password
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
