import { useEffect, useState } from 'react';
import publicApi from '../lib/publicApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const PublicCamps = () => {
  const [camps, setCamps] = useState([]);
  const [filters, setFilters] = useState({ city: '', pinCode: '' });

  const fetchCamps = async () => {
    try {
      const res = await publicApi.get('/public-camps', { params: filters });
      setCamps(res.data.data || res.data || []);
    } catch {
      toast.error('Failed to load camps');
    }
  };

  useEffect(() => {
    fetchCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field) => (e) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchCamps();
  };

  const handleBookCamp = async (campId, timeSlotIndex) => {
    try {
      await publicApi.post('/public-appointments/camp', { campId, timeSlotIndex });
      toast.success('Registered for camp slot');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nearby Blood Donation Camps</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Find upcoming blood donation camps and reserve a time slot.
            </p>
          </div>
        </div>

        <Card>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={handleApplyFilters}>
              <Input
                label="City"
                value={filters.city}
                onChange={handleFilterChange('city')}
              />
              <Input
                label="PIN Code"
                value={filters.pinCode}
                onChange={handleFilterChange('pinCode')}
              />
              <Button type="submit">Apply Filters</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {camps.map((camp) => (
            <Card key={camp._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{camp.name}</span>
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    {format(new Date(camp.startDate), 'MMM dd')} - {format(new Date(camp.endDate), 'MMM dd, yyyy')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <p>{camp.location?.address}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {camp.location?.city} {camp.location?.zipCode && `(${camp.location.zipCode})`}
                </p>

                <div className="space-y-2 mt-2">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Available Time Slots</p>
                  <div className="flex flex-wrap gap-2">
                    {camp.timeSlots?.length
                      ? camp.timeSlots.map((slot, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => handleBookCamp(camp._id, index)}
                          >
                            {slot.label || `${slot.startTime} - ${slot.endTime}`}
                          </Button>
                        ))
                      : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          No slots configured
                        </span>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {camps.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-gray-600 dark:text-gray-300">
                No upcoming camps found for the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
