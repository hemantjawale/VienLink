import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicAuth } from '../context/PublicAuthContext';
import publicApi from '../lib/publicApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const UserDashboard = () => {
  const { user, logout } = usePublicAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await publicApi.get('/public-auth/me');
        setProfile(res.data.user);
      } catch {
        // ignore for now
      }
    };
    fetchMe();
  }, []);

  const displayName = profile?.firstName || user?.firstName;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {displayName}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
              This is your personal blood donation & request hub.
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p>{profile?.email}</p>
              <p>{profile?.phone}</p>
              <p>
                Blood Group:{' '}
                <span className="font-semibold">{profile?.bloodGroup || 'Not set'}</span>
              </p>
              <p>
                Location:{' '}
                <span className="font-semibold">
                  {profile?.city || '-'} {profile?.pinCode ? `(${profile.pinCode})` : ''}
                </span>
              </p>
              <Link
                to="/user/profile"
                className="text-primary-600 dark:text-primary-400 text-xs font-medium inline-block mt-2"
              >
                Edit profile
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p>
                Reward Points:{' '}
                <span className="font-semibold">{profile?.rewardPoints ?? 0}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Earn points every time you donate or help in an emergency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to="/user/request-blood">
                <Button className="w-full" variant="primary">
                  Request Blood
                </Button>
              </Link>
              <Link to="/user/appointments">
                <Button className="w-full" variant="outline">
                  My Appointments
                </Button>
              </Link>
              <Link to="/user/camps">
                <Button className="w-full" variant="outline">
                  Nearby Camps
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
