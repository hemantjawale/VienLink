import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { MapPin, ArrowLeft, Droplet, Phone, User, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import publicApi from '../lib/publicApi';
import toast from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const defaultCenter = { lat: 18.5204, lng: 73.8567 };

const bloodGroupColors = {
  'A+': '#ef4444',
  'A-': '#f97316',
  'B+': '#3b82f6',
  'B-': '#6366f1',
  'AB+': '#8b5cf6',
  'AB-': '#a855f7',
  'O+': '#22c55e',
  'O-': '#14b8a6',
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the user's current position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // silently fall back to default
        }
      );
    }
  }, []);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      const res = await publicApi.get('/user-auth/nearby-donors', { params });
      if (res.data.success) {
        setDonors(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load donor map data');
    } finally {
      setLoading(false);
    }
  }, [bloodGroupFilter]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const getDonorMarkerIcon = (bloodGroup) => {
    const color = bloodGroupColors[bloodGroup] || '#ef4444';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial">${bloodGroup}</text>
      </svg>
    `;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: { width: 36, height: 36 },
      anchor: { x: 18, y: 18 },
    };
  };

  const userMarkerIcon = {
    url:
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 28, height: 28 },
    anchor: { x: 14, y: 14 },
  };

  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/user/request-blood">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
            </Link>
            <h1 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
              <Droplet className="text-red-500" />
              Nearby Donors
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 flex-1 sm:flex-none sm:w-40"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Donor count badge */}
      <div className="absolute top-20 sm:top-[72px] right-4 z-10">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          <User size={14} className="inline mr-1.5 -mt-0.5" />
          {loading ? '...' : donors.length} {donors.length === 1 ? 'donor' : 'donors'} available
        </div>
      </div>

      {/* Map and Details Sidebar */}
      <div className="flex-1 w-full h-full relative z-0 flex flex-col md:flex-row overflow-hidden">
        {/* Donor Details Sidebar (Mobile: Bottom, Desktop: Left/Right) */}
        {selectedDonor && (
          <div className="w-full md:w-80 bg-gray-900 border-t md:border-t-0 md:border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="text-red-500" />
                Donor Profile
              </h2>
              <button 
                onClick={() => setSelectedDonor(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-4 border-b border-gray-800">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-gray-800"
                style={{ backgroundColor: bloodGroupColors[selectedDonor.bloodGroup] || '#ef4444' }}
              >
                {selectedDonor.bloodGroup}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">{selectedDonor.name}</h3>
                <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  <MapPin size={14} /> {selectedDonor.city || 'Unknown Location'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">Blood Type</span>
                <span className="text-white font-bold">{selectedDonor.bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">Status</span>
                <span className="text-green-500 font-bold flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Active Donor
                </span>
              </div>
            </div>

            {selectedDonor.phone && (
              <div className="mt-auto pt-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Emergency Contact</p>
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone size={20} />
                  Call {selectedDonor.phone}
                </a>
                <p className="text-[10px] text-gray-500 text-center mt-3">
                  Please only call in case of real blood emergencies.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 h-full relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={12}
              options={mapOptions}
              onClick={() => setSelectedDonor(null)}
            >
              {/* User's own location marker */}
              {userLocation && <Marker position={userLocation} icon={userMarkerIcon} title="Your location" />}

              {/* Donor markers */}
              {donors.map((donor) => {
                if (!donor.coordinates || donor.coordinates.length < 2) return null;
                const lat = donor.coordinates[1];
                const lng = donor.coordinates[0];
                const isSelected = selectedDonor?._id === donor._id;
                return (
                  <Marker
                    key={donor._id}
                    position={{ lat, lng }}
                    icon={getDonorMarkerIcon(donor.bloodGroup)}
                    onClick={() => setSelectedDonor({ ...donor, lat, lng })}
                    zIndex={isSelected ? 1000 : 1}
                  />
                );
              })}

              {/* InfoWindow for selected donor (kept as fallback) */}
              {selectedDonor && (
                <InfoWindow
                  position={{ lat: selectedDonor.lat, lng: selectedDonor.lng }}
                  onCloseClick={() => setSelectedDonor(null)}
                >
                  <div className="p-2 text-gray-900 font-sans">
                    <p className="font-bold text-sm">{selectedDonor.name}</p>
                    <p className="text-xs">{selectedDonor.bloodGroup} | {selectedDonor.city}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile legend */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-11/12 bg-gray-900/90 backdrop-blur-sm border border-gray-700 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 text-center">Blood Groups</p>
        <div className="flex flex-wrap justify-center gap-2">
          {bloodGroups.map((bg) => (
            <button
              key={bg}
              onClick={() => setBloodGroupFilter(bloodGroupFilter === bg ? '' : bg)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold text-white transition-all ${
                bloodGroupFilter === bg ? 'ring-2 ring-white scale-110' : 'opacity-70'
              }`}
              style={{ backgroundColor: bloodGroupColors[bg] }}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
