import { useEffect, useState } from 'react';
import publicApi from '../lib/publicApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';

export const PublicAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [hospitalSlots, setHospitalSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [qrModalAppt, setQrModalAppt] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [aRes, hRes] = await Promise.all([
          publicApi.get('/public-appointments'),
          publicApi.get('/hospitals/public/approved'),
        ]);
        setAppointments(aRes.data.data || aRes.data || []);
        setHospitals(hRes.data.data || []);
      } catch {
        toast.error('Failed to load appointments');
      }
    };
    init();
  }, []);

  const handleSelectHospital = async (e) => {
    const hospitalId = e.target.value;
    setSelectedHospitalId(hospitalId);
    setHospitalSlots([]);
    if (!hospitalId) return;

    setLoadingSlots(true);
    try {
      const res = await publicApi.get(`/public-appointments/hospital-slots/${hospitalId}`);
      setHospitalSlots(res.data.data || res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load hospital slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async (slot) => {
    try {
      const res = await publicApi.post('/public-appointments/hospital-slot', {
        hospitalId: selectedHospitalId,
        slotId: slot._id,
      });
      toast.success('Appointment booked');
      setShowHospitalForm(false);
      setSelectedHospitalId('');
      setHospitalSlots([]);
      const aRes = await publicApi.get('/public-appointments');
      setAppointments(aRes.data.data || aRes.data || []);
      setQrModalAppt(res.data.data || res.data?.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book slot');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donation Appointments</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              View and manage your blood donation appointments.
            </p>
          </div>
          <Button onClick={() => setShowHospitalForm(true)}>Book at Hospital</Button>
        </div>

        {showHospitalForm && (
          <Card>
            <CardHeader>
              <CardTitle>Book Hospital Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Hospital"
                value={selectedHospitalId}
                onChange={handleSelectHospital}
                required
                options={[
                  { value: '', label: 'Select hospital' },
                  ...hospitals.map((h) => ({ value: h._id, label: h.name })),
                ]}
              />
              {selectedHospitalId && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Available slots for selected hospital:
                  </p>
                  {loadingSlots ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Loading slots...</p>
                  ) : hospitalSlots.length === 0 ? (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      No active slots defined by this hospital.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {hospitalSlots.map((slot) => {
                        const start = new Date(slot.startTime);
                        const end = new Date(slot.endTime);
                        const remaining = slot.remaining ?? Math.max(0, (slot.capacity || 0) - (slot.bookedCount || 0));
                        const isFull = remaining <= 0 || slot.status !== 'active';
                        return (
                          <Card key={slot._id}>
                            <CardContent className="p-3 space-y-1 text-xs text-gray-700 dark:text-gray-200">
                              <p className="font-semibold">
                                {format(start, 'MMM dd, yyyy')} • {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                              </p>
                              <p>
                                {slot.bookedCount || 0} / {slot.capacity} booked
                                <span className="ml-1 text-[11px] text-gray-500">({remaining} remaining)</span>
                              </p>
                              <div className="flex justify-end pt-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={isFull}
                                  onClick={() => handleBookSlot(slot)}
                                >
                                  {isFull ? 'Full' : 'Book Slot'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowHospitalForm(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((appt) => (
              <Card key={appt._id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {appt.hospitalId?.name || appt.campId?.name || 'Appointment'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {appt.hospitalId ? 'Hospital appointment' : appt.campId ? 'Camp appointment' : ''}
                    </p>
                    {appt.timeSlot && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(appt.timeSlot), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 capitalize">Status: {appt.status}</p>
                    <p className="text-[11px] text-gray-400 break-all">Appointment ID: {appt._id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQrModalAppt(appt)}
                    >
                      View QR
                    </Button>
                    {appt.status === 'booked' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await publicApi.put(`/public-appointments/${appt._id}/cancel`);
                            toast.success('Appointment cancelled');
                            const res = await publicApi.get('/public-appointments');
                            setAppointments(res.data.data || res.data || []);
                          } catch {
                            toast.error('Failed to cancel');
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-gray-600 dark:text-gray-300">
                You have no appointments yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {qrModalAppt && (
        <div
          className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setQrModalAppt(null)}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Appointment QR Code</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scan at the hospital to verify your appointment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <QRCode
                    value={JSON.stringify({
                      appointmentId: qrModalAppt._id,
                      hospital: qrModalAppt.hospitalId?.name,
                      type: qrModalAppt.campId ? 'camp' : 'hospital',
                      timeSlot: qrModalAppt.timeSlot,
                    })}
                    size={200}
                    level="H"
                  />
                </div>
                <div className="mt-6 text-center space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Appointment ID</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{qrModalAppt._id}</p>
                  </div>
                  {qrModalAppt.hospitalId?.name && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hospital</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{qrModalAppt.hospitalId.name}</p>
                    </div>
                  )}
                  {qrModalAppt.timeSlot && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(qrModalAppt.timeSlot), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setQrModalAppt(null)}>
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
