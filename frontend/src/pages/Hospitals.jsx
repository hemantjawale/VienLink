import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { CheckCircle, XCircle, Building2, AlertCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved'

  useEffect(() => {
    fetchHospitals();
  }, [filter]);

  const fetchHospitals = async () => {
    try {
      const params = {};
      if (filter === 'pending') {
        params.isApproved = 'false';
      } else if (filter === 'approved') {
        params.isApproved = 'true';
      }
      const response = await api.get('/hospitals', { params });
      setHospitals(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this hospital?')) return;

    try {
      await api.put(`/hospitals/${id}/reject`);
      toast.success('Hospital rejected successfully');
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to reject hospital');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/hospitals/${id}/approve`);
      toast.success('Hospital approved successfully');
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to approve hospital');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingCount = hospitals.filter((h) => !h.isApproved).length;
  const approvedCount = hospitals.filter((h) => h.isApproved).length;

  const filteredHospitals = hospitals.filter((hospital) => {
    if (filter === 'pending') return !hospital.isApproved;
    if (filter === 'approved') return hospital.isApproved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hospitals</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and approve hospital accounts</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="text-orange-600" size={20} />
            <span className="text-orange-800 font-medium">
              {pendingCount} {pendingCount === 1 ? 'hospital' : 'hospitals'} pending approval
            </span>
          </div>
        )}
      </div>

      {/* Filter and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Hospitals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{hospitals.length}</p>
              </div>
              <Building2 className="text-primary-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <AlertCircle className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
                <p className="text-2xl font-bold text-secondary-600">{approvedCount}</p>
              </div>
              <CheckCircle className="text-secondary-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Select
              label="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Hospitals' },
                { value: 'pending', label: 'Pending Only' },
                { value: 'approved', label: 'Approved Only' },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pending Hospitals Alert */}
      {pendingCount > 0 && filter !== 'approved' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">
                  {pendingCount} {pendingCount === 1 ? 'hospital is' : 'hospitals are'} waiting for approval
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Review and approve hospitals below to grant them access to the system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <Building2 className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{hospital.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{hospital.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    hospital.isApproved
                      ? 'bg-secondary-100 text-secondary-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {hospital.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                <p>{hospital.phone}</p>
                {hospital.address && (
                  <p>
                    {hospital.address.street}, {hospital.address.city}, {hospital.address.state}
                  </p>
                )}
                {hospital.licenseNumber && <p>License: {hospital.licenseNumber}</p>}
              </div>

              {!hospital.isApproved && (
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleApprove(hospital._id)}
                  >
                    <CheckCircle size={16} />
                    Approve Hospital
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Registered: {format(new Date(hospital.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {hospital.isApproved && (
                <div className="pt-2 border-t space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Approved:{' '}
                      {hospital.approvedAt
                        ? format(new Date(hospital.approvedAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                    {hospital.approvedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        By: {hospital.approvedBy.firstName} {hospital.approvedBy.lastName}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    className="w-full"
                    onClick={() => handleReject(hospital._id)}
                  >
                    <XCircle size={16} />
                    Reject Hospital
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium">
              {filter === 'pending'
                ? 'No pending hospitals'
                : filter === 'approved'
                ? 'No approved hospitals'
                : 'No hospitals found'}
            </p>
            {filter !== 'all' && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilter('all')}
              >
                View All Hospitals
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

