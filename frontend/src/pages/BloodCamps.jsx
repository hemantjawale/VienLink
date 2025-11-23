import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Calendar, MapPin, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const BloodCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignedVolunteer: '',
    startDate: '',
    endDate: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    timeSlots: [{ startTime: '09:00', endTime: '10:00', maxDonors: 10 }],
  });

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const response = await api.get('/blood-camps');
      setCamps(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch blood camps');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Frontend ZIP code validation: must be 6-digit numeric if provided
    const zip = formData.location.zipCode?.trim();
    if (zip && !/^\d{6}$/.test(zip)) {
      toast.error('ZIP Code must be a 6-digit number');
      return;
    }
    try {
      await api.post('/blood-camps', formData);
      toast.success('Blood camp created successfully');
      setShowModal(false);
      resetForm();
      fetchCamps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [
        ...formData.timeSlots,
        { startTime: '09:00', endTime: '10:00', maxDonors: 10 },
      ],
    });
  };

  const removeTimeSlot = (index) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...formData.timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, timeSlots: updated });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: { address: '', city: '', state: '', zipCode: '' },
      timeSlots: [{ startTime: '09:00', endTime: '10:00', maxDonors: 10 }],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blood Camps</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Organize and manage blood donation camps</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Create Camp
        </Button>
      </div>

      {/* Camps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map((camp) => (
          <Card key={camp._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{camp.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    camp.status === 'ongoing'
                      ? 'bg-secondary-100 text-secondary-800'
                      : camp.status === 'upcoming'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              {camp.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{camp.description}</p>
              )}

              {camp.assignedVolunteer && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Assigned Volunteer: <span className="font-medium">{camp.assignedVolunteer}</span>
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar size={16} />
                  <span>
                    {format(new Date(camp.startDate), 'MMM dd, yyyy')} -{' '}
                    {format(new Date(camp.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin size={16} />
                  <span>{camp.location?.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{camp.totalRegistrations} registrations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{camp.timeSlots?.length || 0} time slots</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedCamp(camp);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {camps.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No blood camps found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Create Blood Camp</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Camp Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  <Input
                    label="End Date"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Location</h3>
                  <div className="space-y-3">
                    <Input
                      label="Address"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value },
                        })
                      }
                      required
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="City"
                        value={formData.location.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, city: e.target.value },
                          })
                        }
                      />
                      <Input
                        label="State"
                        value={formData.location.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, state: e.target.value },
                          })
                        }
                      />
                      <Input
                        label="ZIP Code"
                        value={formData.location.zipCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, zipCode: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Assigned Volunteer</h3>
                  <Input
                    label="Volunteer Name (Optional)"
                    value={formData.assignedVolunteer}
                    onChange={(e) => setFormData({ ...formData, assignedVolunteer: e.target.value })}
                    placeholder="e.g., Kumar Sharma"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Time Slots</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addTimeSlot}>
                      Add Slot
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-gray-500 dark:text-gray-400">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          min={1}
                          value={slot.maxDonors}
                          onChange={(e) =>
                            updateTimeSlot(index, 'maxDonors', parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                        {formData.timeSlots.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => removeTimeSlot(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Camp</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedCamp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-xl my-8">
            <CardHeader>
              <CardTitle>{selectedCamp.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Calendar size={16} />
                  <span>
                    {format(new Date(selectedCamp.startDate), 'MMM dd, yyyy p')} -{' '}
                    {format(new Date(selectedCamp.endDate), 'MMM dd, yyyy p')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <MapPin size={16} />
                  <span>
                    {selectedCamp.location?.address}, {selectedCamp.location?.city}{' '}
                    {selectedCamp.location?.state} {selectedCamp.location?.zipCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Users size={16} />
                  <span>{selectedCamp.totalRegistrations} registrations</span>
                </div>
                {selectedCamp.assignedVolunteer && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <span className="font-medium">Assigned Volunteer:</span>
                    <span>{selectedCamp.assignedVolunteer}</span>
                  </div>
                )}
                {selectedCamp.description && (
                  <p className="text-gray-700 dark:text-gray-200 pt-2 border-t">
                    {selectedCamp.description}
                  </p>
                )}
                {selectedCamp.timeSlots && selectedCamp.timeSlots.length > 0 && (
                  <div className="pt-3 border-t space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Time Slots</h3>
                    <div className="space-y-1">
                      {selectedCamp.timeSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-200"
                        >
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span>Max donors: {slot.maxDonors}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCamp(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

