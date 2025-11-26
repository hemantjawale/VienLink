import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublicAuth } from '../context/PublicAuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import Spline from '@splinetool/react-spline';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const UserSignup = () => {
  const { signup } = usePublicAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    city: '',
    pinCode: '',
    hasUnderlyingDisease: false,
    diseaseDetails: '',
    onMedication: false,
    medicationDetails: '',
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleBooleanChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created successfully');
      navigate('/user/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Model Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Spline scene="https://prod.spline.design/H3KNk3yz8XLS22If/scene.splinecode" />
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/15 shadow-2xl p-8 text-white">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Join as a Donor / Recipient</h1>
            <p className="text-gray-200 mt-1 text-sm">
              Create a public account to request blood, book donations, and track your impact.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={handleChange('firstName')}
                required
                className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={handleChange('lastName')}
                required
                className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              required
              className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
            />

            <Input
              label="Mobile Number"
              value={form.phone}
              onChange={handleChange('phone')}
              required
              className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Blood Group (optional)"
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                options={[
                  { value: '', label: 'Select group' },
                  ...bloodGroups.map((bg) => ({ value: bg, label: bg })),
                ]}
              />
              <Input
                label="City"
                value={form.city}
                onChange={handleChange('city')}
                className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
              />
              <Input
                label="PIN Code"
                value={form.pinCode}
                onChange={handleChange('pinCode')}
                className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-200">
                Do you have any underlying disease (e.g. heart disease, diabetes, chronic illness)?
              </p>
              <div className="flex gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasUnderlyingDisease', false)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    !form.hasUnderlyingDisease
                      ? 'bg-green-200/80 border-green-500 text-green-900'
                      : 'border-white/40 text-gray-100'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasUnderlyingDisease', true)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    form.hasUnderlyingDisease
                      ? 'bg-red-200/80 border-red-500 text-red-900'
                      : 'border-white/40 text-gray-100'
                  }`}
                >
                  Yes
                </button>
              </div>
              {form.hasUnderlyingDisease && (
                <Input
                  label="Please mention your condition"
                  value={form.diseaseDetails}
                  onChange={handleChange('diseaseDetails')}
                  required
                  className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
                />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-200">
                Are you currently on any regular medication?
              </p>
              <div className="flex gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => handleBooleanChange('onMedication', false)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    !form.onMedication
                      ? 'bg-green-200/80 border-green-500 text-green-900'
                      : 'border-white/40 text-gray-100'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => handleBooleanChange('onMedication', true)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    form.onMedication
                      ? 'bg-red-200/80 border-red-500 text-red-900'
                      : 'border-white/40 text-gray-100'
                  }`}
                >
                  Yes
                </button>
              </div>
              {form.onMedication && (
                <Input
                  label="Please mention your medication"
                  value={form.medicationDetails}
                  onChange={handleChange('medicationDetails')}
                  required
                  className="bg-transparent border-white/40 text-white placeholder-gray-200/70"
                />
              )}
            </div>

            <p className="text-[11px] text-gray-200/80">
              Your answers help hospitals decide if you are currently eligible to donate blood. They are kept
              confidential.
            </p>

            <Button
              type="submit"
              className="w-full bg-primary-600/80 hover:bg-primary-700/90"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-200 mt-2">
              Already have a public account?{' '}
              <Link to="/user/login" className="text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
