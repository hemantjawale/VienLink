import { useEffect, useState } from 'react';
import publicApi from '../lib/publicApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PublicRequestBlood = () => {
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    hospitalId: '',
    bloodGroup: '',
    quantity: 1,
    urgency: 'medium',
    reason: '',
    requiredBy: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [hRes, rRes] = await Promise.all([
          publicApi.get('/hospitals/public/approved'),
          publicApi.get('/public-blood-requests'),
        ]);
        setHospitals(hRes.data.data || []);
        setRequests(rRes.data.data || rRes.data || []);
      } catch (error) {
        toast.error('Failed to load blood request data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await publicApi.post('/public-blood-requests', form);
      toast.success('Blood request submitted');
      setShowForm(false);
      setForm({ hospitalId: '', bloodGroup: '', quantity: 1, urgency: 'medium', reason: '', requiredBy: '' });
      const res = await publicApi.get('/public-blood-requests');
      setRequests(res.data.data || res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request Blood</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Create and track your blood requests to nearby hospitals.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>New Request</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Blood Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Hospital"
                  value={form.hospitalId}
                  onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                  required
                  options={[
                    { value: '', label: hospitals.length ? 'Select hospital' : 'No approved hospitals available' },
                    ...hospitals.map((h) => ({
                      value: h._id,
                      label: h.name,
                    })),
                  ]}
                />
                {!hospitals.length && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    There are currently no approved hospitals available. Please contact the administrator or try again
                    later.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Blood Group"
                    value={form.bloodGroup}
                    onChange={handleChange('bloodGroup')}
                    required
                    options={[
                      { value: '', label: 'Select group' },
                      ...bloodGroups.map((bg) => ({ value: bg, label: bg })),
                    ]}
                  />
                  <Input
                    label="Quantity (units)"
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={handleChange('quantity')}
                    required
                  />
                  <Select
                    label="Urgency"
                    value={form.urgency}
                    onChange={handleChange('urgency')}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'critical', label: 'Critical' },
                    ]}
                    required
                  />
                </div>
                <Input
                  label="Reason"
                  value={form.reason}
                  onChange={handleChange('reason')}
                  required
                />
                <Input
                  label="Required By (optional)"
                  type="date"
                  value={form.requiredBy}
                  onChange={handleChange('requiredBy')}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req._id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {req.hospitalId?.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {req.reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(req.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold">
                      {req.bloodGroup}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-200">
                      {req.quantity} units
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : req.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-gray-600 dark:text-gray-300">
                You have not created any blood requests yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
