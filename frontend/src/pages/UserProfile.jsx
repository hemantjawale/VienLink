import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicAuth } from '../context/PublicAuthContext';
import publicApi from '../lib/publicApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfile = () => {
  const { user, logout } = usePublicAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await publicApi.get('/user-auth/me');
        setProfile(res.data.user);
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const body = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        pinCode: profile.pinCode,
      };
      const res = await publicApi.put('/user-auth/profile', body);
      setProfile(res.data.user || profile);
      localStorage.setItem('publicUser', JSON.stringify(res.data.user || profile));
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    setPwSaving(true);
    try {
      await publicApi.put('/user-auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleToggleLocationSharing = async () => {
    if (!profile) return;
    setLocationSaving(true);

    const newValue = !profile.shareLocationForEmergency;

    try {
      if (newValue) {
        // Turning ON: request geolocation first
        if (!navigator.geolocation) {
          toast.error('Geolocation is not supported by your browser');
          setLocationSaving(false);
          return;
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        const location = {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude],
        };

        const res = await publicApi.put('/user-auth/profile', {
          shareLocationForEmergency: true,
          location,
        });
        setProfile(res.data.user || { ...profile, shareLocationForEmergency: true, location });
        toast.success('Location sharing enabled! Your location has been saved.');
      } else {
        // Turning OFF: clear location
        const res = await publicApi.put('/user-auth/profile', {
          shareLocationForEmergency: false,
        });
        setProfile(res.data.user || { ...profile, shareLocationForEmergency: false });
        toast.success('Location sharing disabled');
      }
    } catch (error) {
      if (error.code === 1) {
        toast.error('Location permission denied. Please allow location access in your browser settings.');
      } else if (error.code === 2) {
        toast.error('Unable to determine your location. Please try again.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update location sharing');
      }
    } finally {
      setLocationSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Manage your personal details and account security.
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Emergency Location Sharing Card */}
        <Card className="border-red-200 dark:border-red-900/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl flex-shrink-0">
                  <Shield className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Emergency Location Sharing
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Share your location so people requesting blood can find you on the donor map.
                    Your location is only visible to logged-in users during emergencies.
                  </p>
                  {profile.shareLocationForEmergency && profile.location?.coordinates && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      <MapPin size={12} />
                      Location saved ({profile.location.coordinates[1]?.toFixed(4)}, {profile.location.coordinates[0]?.toFixed(4)})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleToggleLocationSharing}
                disabled={locationSaving}
                className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                  profile.shareLocationForEmergency
                    ? 'bg-red-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${locationSaving ? 'opacity-50 cursor-wait' : ''}`}
                role="switch"
                aria-checked={profile.shareLocationForEmergency}
                aria-label="Toggle emergency location sharing"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    profile.shareLocationForEmergency ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  {locationSaving && (
                    <Loader2 size={14} className="animate-spin text-gray-400 m-1" />
                  )}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={profile.firstName || ''}
                    onChange={handleChange('firstName')}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={profile.lastName || ''}
                    onChange={handleChange('lastName')}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={profile.email || ''}
                  onChange={handleChange('email')}
                  required
                />
                <Input
                  label="Mobile Number"
                  value={profile.phone || ''}
                  onChange={handleChange('phone')}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="City"
                    value={profile.city || ''}
                    onChange={handleChange('city')}
                  />
                  <Input
                    label="PIN Code"
                    value={profile.pinCode || ''}
                    onChange={handleChange('pinCode')}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-3 text-sm">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline" disabled={pwSaving}>
                    {pwSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
