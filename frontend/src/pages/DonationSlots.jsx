import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Calendar, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const DonationSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointmentsModalSlot, setAppointmentsModalSlot] = useState(null);
  const [slotAppointments, setSlotAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: 10,
  });

  const fetchSlots = async () => {
    try {
      const res = await api.get('/hospital-slots');
      setSlots(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointments = async (slot) => {
    setAppointmentsModalSlot(slot);
    setSlotAppointments([]);
    setLoadingAppointments(true);
    try {
      const res = await api.get(`/hospital-slots/${slot._id}/appointments`);
      setSlotAppointments(res.data.data || res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime || !form.capacity) {
      toast.error('All fields are required');
      return;
    }

    const startTime = new Date(`${form.date}T${form.startTime}`);
    const endTime = new Date(`${form.date}T${form.endTime}`);

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      await api.post('/hospital-slots', {
        startTime,
        endTime,
        capacity: Number(form.capacity),
      });
      toast.success('Slot created');
      setForm({ date: '', startTime: '', endTime: '', capacity: 10 });
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCapacity = async (slotId, capacity) => {
    try {
      await api.put(`/hospital-slots/${slotId}`, { capacity });
      toast.success('Slot updated');
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update slot');
    }
  };

  const handleCloseSlot = async (slotId) => {
    try {
      await api.put(`/hospital-slots/${slotId}`, { status: 'closed' });
      toast.success('Slot closed');
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close slot');
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donation Slots</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
            Define fixed time slots for blood donations and track remaining capacity in real time.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={handleChange('date')}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={handleChange('startTime')}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={handleChange('endTime')}
              required
            />
            <Input
              label="Capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={handleChange('capacity')}
              required
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Add Slot'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">No slots defined yet.</p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => {
                const remaining = slot.remaining ?? Math.max(0, (slot.capacity || 0) - (slot.bookedCount || 0));
                const start = new Date(slot.startTime);
                const end = new Date(slot.endTime);
                return (
                  <div
                    key={slot._id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                      <Calendar size={16} />
                      <span>{format(start, 'MMM dd, yyyy')}</span>
                      <Clock size={16} />
                      <span>
                        {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span className="font-medium">
                          {slot.bookedCount || 0} / {slot.capacity}
                        </span>
                        <span className="text-xs text-gray-500">({remaining} remaining)</span>
                      </div>
                      {/* Visual capacity indicator */}
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              (slot.bookedCount || 0) >= slot.capacity 
                                ? 'bg-red-500' 
                                : (slot.bookedCount || 0) >= slot.capacity * 0.8 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, ((slot.bookedCount || 0) / slot.capacity) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(((slot.bookedCount || 0) / slot.capacity) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          slot.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {slot.status}
                      </span>
                      <Input
                        type="number"
                        min={slot.bookedCount || 0}
                        value={slot.capacity}
                        onChange={(e) =>
                          handleUpdateCapacity(slot._id, Number(e.target.value) || slot.capacity)
                        }
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={slot.status === 'closed'}
                        onClick={() => handleCloseSlot(slot._id)}
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAppointments(slot)}
                        className="relative"
                      >
                        <Users size={14} className="mr-1" />
                        View Appointments
                        {(slot.bookedCount || 0) > 0 && (
                          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {slot.bookedCount || 0}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {appointmentsModalSlot && (
        <div
          className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setAppointmentsModalSlot(null)}
        >
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users size={20} />
                Appointments for {format(new Date(appointmentsModalSlot.startTime), 'MMM dd, yyyy')} •
                {' '}
                {format(new Date(appointmentsModalSlot.startTime), 'HH:mm')} -
                {' '}
                {format(new Date(appointmentsModalSlot.endTime), 'HH:mm')}
                <span className="ml-auto text-sm font-normal text-gray-600 dark:text-gray-400">
                  {slotAppointments.length} / {appointmentsModalSlot.capacity} slots booked
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              {loadingAppointments ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading appointments...</p>
              ) : slotAppointments.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No appointments booked for this slot yet.</p>
              ) : (
                <>
                  {/* Summary Statistics */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Appointment Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{slotAppointments.length}</div>
                        <div className="text-gray-600 dark:text-gray-400">Total Booked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {slotAppointments.filter(a => a.status === 'booked').length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Confirmed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {slotAppointments.filter(a => a.status === 'completed').length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {appointmentsModalSlot.capacity - slotAppointments.length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Available</div>
                      </div>
                    </div>
                    {/* Blood Group Distribution */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Group Distribution</h5>
                      <div className="flex flex-wrap gap-2">
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => {
                          const count = slotAppointments.filter(a => a.userId?.bloodGroup === group).length;
                          if (count === 0) return null;
                          return (
                            <span key={group} className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-semibold">
                              {group}: {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* User List */}
                  <div className="space-y-2">
                    {slotAppointments.map((appt) => (
                    <div
                      key={appt._id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                              {appt.userId
                                ? `${appt.userId.firstName || ''} ${appt.userId.lastName || ''}`.trim() || 'Donor'
                                : 'Donor'}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              {appt.userId?.bloodGroup && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-semibold">
                                  {appt.userId.bloodGroup}
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                appt.status === 'booked' 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : appt.status === 'completed'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {appt.userId?.phone && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Phone:</span> {appt.userId.phone}
                            </div>
                          )}
                          {appt.userId?.email && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Email:</span> 
                              <span className="truncate" title={appt.userId.email}>
                                {appt.userId.email}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Booked:</span> 
                            {format(new Date(appt.createdAt), 'MMM dd, HH:mm')}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">ID:</span> 
                            <span className="font-mono text-xs">{appt._id.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              )}
              <div className="pt-3 flex justify-end">
                <Button variant="outline" onClick={() => setAppointmentsModalSlot(null)}>
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
