import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, ArrowLeft, Droplet, Activity, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import publicApi from '../lib/publicApi';
import toast from 'react-hot-toast';

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Map options to create a dark/high-tech feel fitting the landing page
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
    ]
};

const center = {
    lat: 18.5204,
    lng: 73.8567
};

export const LiveMap = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [mapData, setMapData] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const res = await publicApi.get('/analytics/live-map-data');
                if (res.data.success) {
                    setMapData(res.data.data);
                }
            } catch (err) {
                toast.error('Failed to load live map data');
            }
        };
        fetchMapData();
    }, []);

    const getMarkerIcon = (status, color) => {
        // Draw SVG marker dynamically based on status color
        const svgMarker = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    `;
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgMarker),
            scaledSize: { width: 40, height: 40 },
            anchor: { x: 20, y: 40 }
        };
    };

    return (
        <div className="relative w-full h-screen bg-gray-900 flex flex-col">
            {/* Header Panel */}
            <div className="absolute top-0 left-0 w-full z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                                <ArrowLeft size={16} className="mr-2" /> Back
                            </Button>
                        </Link>
                        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            <MapPin className="text-red-500" />
                            Live Blood Demand Map
                        </h1>
                    </div>

                    <div className="hidden md:flex gap-4">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-sm text-gray-300">Sufficient</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><span className="text-sm text-gray-300">Moderate Shortage</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span><span className="text-sm text-gray-300">Critical Shortage</span></div>
                    </div>
                </div>
            </div>

            {/* Map View */}
            <div className="flex-1 w-full h-full relative z-0">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapData.length > 0 && mapData[0].coordinates
                            ? { lat: mapData[0].coordinates[1] || mapData[0].coordinates[0], lng: mapData[0].coordinates[0] || mapData[0].coordinates[1] }
                            : center}
                        zoom={13}
                        options={options}
                        onClick={() => setSelectedHospital(null)}
                    >
                        {mapData.map((h, index) => {
                            // Extract valid lat lng from [lng, lat] format or similar fallback
                            const lat = h.coordinates && h.coordinates[1] ? h.coordinates[1] : 18.5204 + (Math.random() * 0.1);
                            const lng = h.coordinates && h.coordinates[0] ? h.coordinates[0] : 73.8567 + (Math.random() * 0.1);
                            return (
                                <Marker
                                    key={index}
                                    position={{ lat, lng }}
                                    icon={getMarkerIcon(h.status, h.color)}
                                    onClick={() => setSelectedHospital({ ...h, lat, lng })}
                                    animation={h.status === 'critical' ? 1 : null} // BOUNCE if critical
                                />
                            );
                        })}

                        {selectedHospital && (
                            <InfoWindow
                                position={{ lat: selectedHospital.lat, lng: selectedHospital.lng }}
                                onCloseClick={() => setSelectedHospital(null)}
                            >
                                <div className="p-2 max-w-sm text-gray-900 font-sans">
                                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                        <Building2 size={18} className="text-gray-500" />
                                        {selectedHospital.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 border-b pb-2">{selectedHospital.address}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100 flex flex-col items-center">
                                            <Droplet size={20} className="text-red-500 mb-1" />
                                            <span className="text-xl font-bold">{selectedHospital.availableUnits}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Stock</span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100 flex flex-col items-center">
                                            <Activity size={20} className="text-blue-500 mb-1" />
                                            <span className="text-xl font-bold">{selectedHospital.pendingRequests}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Demands</span>
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <span className={`inline-block w-full py-1 px-3 text-xs font-bold uppercase tracking-wider rounded text-white`} style={{ backgroundColor: selectedHospital.color }}>
                                            {selectedHospital.status} Demand
                                        </span>
                                    </div>

                                    {selectedHospital.status === 'critical' && (
                                        <div className="mt-3">
                                            <Link to="/user/login">
                                                <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded py-2 text-sm font-bold shadow-md">
                                                    Donate Here Now
                                                </button>
                                            </Link>
                                        </div>
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

            {/* Mobile Legend */}
            <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-11/12 bg-gray-900/90 backdrop-blur-sm border border-gray-700 p-3 rounded-xl shadow-2xl flex justify-between">
                <div className="flex flex-col items-center gap-1"><span className="w-4 h-4 rounded-full bg-green-500"></span><span className="text-[10px] text-gray-300 font-bold uppercase">Sufficient</span></div>
                <div className="flex flex-col items-center gap-1"><span className="w-4 h-4 rounded-full bg-yellow-500"></span><span className="text-[10px] text-gray-300 font-bold uppercase">Moderate</span></div>
                <div className="flex flex-col items-center gap-1"><span className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></span><span className="text-[10px] text-gray-300 font-bold uppercase">Critical</span></div>
            </div>
        </div>
    );
};
