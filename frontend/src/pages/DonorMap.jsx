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

      {/* Map */}
      <div className="flex-1 w-full h-full relative z-0">
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
              return (
                <Marker
                  key={donor._id}
                  position={{ lat, lng }}
                  icon={getDonorMarkerIcon(donor.bloodGroup)}
                  onClick={() => setSelectedDonor({ ...donor, lat, lng })}
                />
              );
            })}

            {/* InfoWindow for selected donor */}
            {selectedDonor && (
              <InfoWindow
                position={{ lat: selectedDonor.lat, lng: selectedDonor.lng }}
                onCloseClick={() => setSelectedDonor(null)}
              >
                <div className="p-3 max-w-xs text-gray-900 font-sans space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                      style={{ backgroundColor: bloodGroupColors[selectedDonor.bloodGroup] || '#ef4444' }}
                    >
                      {selectedDonor.bloodGroup}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{selectedDonor.name}</h3>
                      {selectedDonor.city && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={10} /> {selectedDonor.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedDonor.phone && (
                    <a
                      href={`tel:${selectedDonor.phone}`}
                      className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-3 text-sm font-semibold transition-colors"
                    >
                      <Phone size={14} />
                      Call {selectedDonor.phone}
                    </a>
                  )}
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
