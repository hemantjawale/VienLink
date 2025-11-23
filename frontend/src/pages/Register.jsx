import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Droplet } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    licenseNumber: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/hospitals/register', {
        hospitalName: formData.hospitalName,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
      });

      if (response.data.success) {
        // Store token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast.success('Hospital registered successfully! Waiting for approval.');
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 dark:from-gray-900 via-white dark:via-gray-900 to-secondary-50 dark:to-gray-800 p-4 py-12 transition-colors">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
            <Droplet className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Hospital</h1>
          <p className="text-gray-600">Join Vien Link to manage your blood bank efficiently</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hospital Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Hospital Information
                </h3>
                <Input
                  label="Hospital Name"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="Enter hospital name"
                  required
                />
                <Input
                  label="License Number (Optional)"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="Enter license number"
                />
              </div>

              {/* Admin Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Administrator Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@hospital.com"
                  required
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Account Security
                </h3>
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Hospital Address (Optional)
                </h3>
                <Input
                  label="Street Address"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="State"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="ZIP Code"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value },
                      })
                    }
                  />
                </div>
                <Input
                  label="Country"
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: e.target.value },
                    })
                  }
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your hospital registration will be reviewed by our team.
                  You'll be notified once your account is approved.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link to="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Hospital'}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

