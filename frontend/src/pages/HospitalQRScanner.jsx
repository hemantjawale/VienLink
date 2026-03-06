import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BadgeCheck, ShieldAlert, User, Droplet, Heart, Clock, Gift, Loader2 } from 'lucide-react';

export const HospitalQRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        // Init scanner
        const scanner = new Html5QrcodeScanner('qr-reader', {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        });

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const onScanSuccess = async (decodedText) => {
        if (loading || scanResult) return; // Prevent multiple scans

        try {
            const data = JSON.parse(decodedText);

            if (!data.id) {
                throw new Error('Invalid QR Format');
            }

            // Stop scanner temporarily
            if (scannerRef.current) {
                scannerRef.current.pause(true);
            }

            setLoading(true);

            // Verify with backend
            const response = await api.post('/donor-qr/scan', { qrData: data });

            setScanResult('success');
            setParsedData(response.data.data);
            toast.success('Donor verified successfully!');
        } catch (error) {
            console.error('QR Scan Error:', error);
            setScanResult('error');
            setParsedData(null);
            toast.error(error.message || 'Invalid or unrecognized QR Code');
        } finally {
            setLoading(false);
        }
    };

    const onScanError = (errorMessage) => {
        // ignore simple parse errors while searching for QR
    };

    const resetScanner = () => {
        setScanResult(null);
        setParsedData(null);
        if (scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-900text-primary-600 rounded-lg">
                    <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Donor QR Scanner</h1>
                    <p className="text-sm text-gray-500">Scan a donor's QR code to verify identity and eligibility</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scanner Section */}
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800">
                        <CardTitle className="text-lg">Camera Scanner</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div id="qr-reader" className="w-full border-none"></div>
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                                    <p className="font-semibold dark:text-gray-300">Verifying Donor...</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Result Section */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800">
                        <CardTitle className="text-lg">Verification Result</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!scanResult && !loading && (
                            <div className="text-center text-gray-400 dark:text-gray-500 py-12">
                                <BadgeCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Waiting for QR code scan...</p>
                            </div>
                        )}

                        {scanResult === 'error' && (
                            <div className="text-center text-red-600 py-8">
                                <ShieldAlert className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Verification Failed</h3>
                                <p className="text-red-400">The QR code is invalid, tampered with, or not from VielLink.</p>
                                <button
                                    onClick={resetScanner}
                                    className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {scanResult === 'success' && parsedData && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <BadgeCheck className="w-8 h-8 text-green-600" />
                                    <div>
                                        <h3 className="font-bold text-green-800 dark:text-green-400 text-lg">Identity Verified</h3>
                                        <p className="text-sm text-green-600 dark:text-green-500">Authentic VienLink Donor Profile</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Full Name</p>
                                                <p className="font-bold dark:text-white">{parsedData.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Blood Group</p>
                                            <p className="font-bold text-red-600 text-xl">{parsedData.bloodGroup}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Droplet className="w-4 h-4 text-primary-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Total Donations</p>
                                                <p className="font-semibold dark:text-gray-300">{parsedData.totalDonations}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Lives Saved</p>
                                                <p className="font-semibold dark:text-gray-300">{parsedData.livesSaved}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Last Donation</p>
                                                <p className="font-semibold dark:text-gray-300">{parsedData.lastDonation}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-yellow-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Reward Points</p>
                                                <p className="font-semibold dark:text-gray-300">{parsedData.rewardPoints}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Eligibility Alert Highlight */}
                                    <div className={`mt-4 p-3 rounded-lg border ${parsedData.isEligible ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                                        <p className={`font-bold text-center ${parsedData.isEligible ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {parsedData.isEligible
                                                ? '✅ ELIGIBLE TO DONATE TODAY'
                                                : `❌ NOT ELIGIBLE (Wait ${parsedData.daysUntilEligible} days)`}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={resetScanner}
                                    className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold transition-colors"
                                >
                                    Scan Another Donor
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
