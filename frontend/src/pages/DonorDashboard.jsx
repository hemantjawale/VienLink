import { useState, useEffect } from 'react';
import { usePublicAuth } from '../context/PublicAuthContext';
import publicApi from '../lib/publicApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
    Heart,
    Droplet,
    Trophy,
    Calendar,
    Building2,
    Users,
    Shield,
    ShieldCheck,
    ShieldX,
    Clock,
    Award,
    Flame,
    Star,
    ChevronDown,
    ChevronUp,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Gift,
    Zap,
    Download
} from 'lucide-react';

const LIVES_PER_DONATION = 3;

export const DonorDashboard = () => {
    const { user } = usePublicAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [showAllBadges, setShowAllBadges] = useState(false);
    const [qrDataPayload, setQrDataPayload] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [generatingCert, setGeneratingCert] = useState(null); // stores ID of donation being generated

    const fetchQrData = async () => {
        try {
            const res = await publicApi.get('/donor-qr/generate');
            setQrDataPayload(res.data.data.qrData);
            setShowQrModal(true);
        } catch (err) {
            toast.error('Failed to generate QR Code');
        }
    };

    const downloadCertificate = async (donation) => {
        setGeneratingCert(donation._id);
        toast.loading('Generating Certificate...', { id: 'cert-toast' });
        try {
            // Give time for layout to adapt
            await new Promise(resolve => setTimeout(resolve, 100));

            const certificateElement = document.getElementById(`certificate-${donation._id}`);
            if (!certificateElement) throw new Error("Certificate template missing");

            const canvas = await html2canvas(certificateElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Donation_Certificate_${format(new Date(donation.date), 'dd_MMM_yyyy')}.pdf`);

            toast.success('Certificate downloaded!', { id: 'cert-toast' });
        } catch (error) {
            console.error('Cert generation error', error);
            toast.error('Failed to generate certificate', { id: 'cert-toast' });
        } finally {
            setGeneratingCert(null);
        }
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await publicApi.get('/donor-profile/dashboard');
                setData(res.data.data);

                if (res.data.data.newBadgesEarned) {
                    res.data.data.newBadgesEarned.forEach((b) => {
                        toast.success(`🏆 New Badge Earned: ${b.description}`, { duration: 5000 });
                    });
                }
            } catch (err) {
                console.error('Dashboard fetch failed:', err);
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading your donation journey...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <p className="text-gray-500">Unable to load dashboard data</p>
            </div>
        );
    }

    const { stats, eligibility, badges, donationHistory, donationsByMonth, hospitalBreakdown, allAppointments } = data;

    // Find the current tier badge
    const currentTier = [...badges].reverse().find((b) => b.earned);
    const nextBadge = badges.find((b) => !b.earned);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center">
            <div className="w-full max-w-5xl space-y-6">
                {/* ===== Hero Header ===== */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white p-6 md:p-8">
                    <div className="absolute top-0 right-0 opacity-10">
                        <Heart className="w-64 h-64 -mt-12 -mr-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <Droplet className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Your Donation Journey</h1>
                                <p className="text-red-100 text-sm">Every drop you give fuels someone's tomorrow</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                                <Droplet className="w-6 h-6 mx-auto mb-1 text-red-200" />
                                <p className="text-3xl font-bold">{stats.totalDonations}</p>
                                <p className="text-xs text-red-200 mt-1">Total Donations</p>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                                <Heart className="w-6 h-6 mx-auto mb-1 text-red-200" />
                                <p className="text-3xl font-bold">{stats.livesSaved}</p>
                                <p className="text-xs text-red-200 mt-1">Lives Saved</p>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                                <Building2 className="w-6 h-6 mx-auto mb-1 text-red-200" />
                                <p className="text-3xl font-bold">{stats.hospitalsHelped}</p>
                                <p className="text-xs text-red-200 mt-1">Hospitals Helped</p>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                                <Flame className="w-6 h-6 mx-auto mb-1 text-orange-300" />
                                <p className="text-3xl font-bold">{stats.streak}</p>
                                <p className="text-xs text-red-200 mt-1">Donation Streak</p>
                            </div>
                        </div>

                        {/* Last donation & next eligible */}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-red-200" />
                                <span>
                                    Last Donation:{' '}
                                    <strong>
                                        {stats.lastDonationDate
                                            ? format(new Date(stats.lastDonationDate), 'MMM dd, yyyy')
                                            : 'No donations yet'}
                                    </strong>
                                </span>
                            </div>
                            {stats.nextEligibleDate && (
                                <div className="flex items-center gap-2 bg-yellow-500/20 rounded-lg px-3 py-2">
                                    <Clock className="w-4 h-4 text-yellow-300" />
                                    <span>
                                        Next Eligible:{' '}
                                        <strong>{format(new Date(stats.nextEligibleDate), 'MMM dd, yyyy')}</strong>
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                                <Star className="w-4 h-4 text-yellow-300" />
                                <span>
                                    <strong>{stats.rewardPoints}</strong> Reward Points
                                </span>
                            </div>
                        </div>

                        {/* Generate QR Button */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={fetchQrData}
                                className="bg-white text-red-700 hover:bg-red-50 flex items-center gap-2 font-semibold shadow-lg shadow-black/10"
                            >
                                <Users className="w-5 h-5" />
                                View My Donor ID (QR)
                            </Button>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQrModal && qrDataPayload && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-center relative">
                                <h3 className="text-white font-bold text-lg">Donor Profile QR</h3>
                                <p className="text-red-100 text-xs">Scan at hospital for quick verification</p>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="absolute top-2 right-2 text-white/70 hover:text-white"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
                                    <QRCodeSVG value={JSON.stringify(qrDataPayload)} size={200} level="H" />
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="font-bold text-lg dark:text-white">{qrDataPayload.name}</p>
                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-sm font-bold mt-2">
                                        Blood Group: {qrDataPayload.bloodGroup}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Total Donations: {qrDataPayload.totalDonations} | Lives Saved: {qrDataPayload.livesSaved}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== Second Row: Eligibility + Badge Progress ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Eligibility Checker */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <Shield className="w-5 h-5" />
                                Donor Eligibility Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            {/* Overall Status */}
                            <div
                                className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${eligibility.isEligible
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                    }`}
                            >
                                {eligibility.isEligible ? (
                                    <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
                                ) : (
                                    <ShieldX className="w-8 h-8 text-red-600 flex-shrink-0" />
                                )}
                                <div>
                                    <p
                                        className={`font-bold text-lg ${eligibility.isEligible
                                            ? 'text-green-800 dark:text-green-300'
                                            : 'text-red-800 dark:text-red-300'
                                            }`}
                                    >
                                        {eligibility.isEligible ? 'You Are Eligible to Donate!' : 'Currently Not Eligible'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {eligibility.passedChecks}/{eligibility.totalChecks} checks passed
                                    </p>
                                </div>
                            </div>

                            {/* Check Items */}
                            <div className="space-y-3">
                                {eligibility.checks.map((check, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${check.passed === true
                                            ? 'bg-green-50/50 dark:bg-green-900/10'
                                            : check.passed === false
                                                ? 'bg-red-50/50 dark:bg-red-900/10'
                                                : 'bg-yellow-50/50 dark:bg-yellow-900/10'
                                            }`}
                                    >
                                        <span className="text-lg flex-shrink-0 mt-0.5">{check.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {check.name}
                                                </p>
                                                {check.passed === true ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                ) : check.passed === false ? (
                                                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{check.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badges & Rewards */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-b border-amber-100 dark:border-amber-800">
                            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                                <Trophy className="w-5 h-5" />
                                Rewards & Badges
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            {/* Current Tier */}
                            {currentTier && (
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl mb-4 border border-yellow-200 dark:border-yellow-800">
                                    <span className="text-4xl">{currentTier.emoji}</span>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{currentTier.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentTier.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Next Badge Progress */}
                            {nextBadge && (
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl opacity-50">{nextBadge.emoji}</span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Next: {nextBadge.name}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {nextBadge.remaining} donation{nextBadge.remaining !== 1 ? 's' : ''} to go
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out"
                                            style={{
                                                width: `${nextBadge.progress}%`,
                                                background: `linear-gradient(90deg, ${nextBadge.color}88, ${nextBadge.color})`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                        {Math.round(nextBadge.progress)}%
                                    </p>
                                </div>
                            )}

                            {/* Badge Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(showAllBadges ? badges : badges.slice(0, 4)).map((badge) => (
                                    <div
                                        key={badge.id}
                                        className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 ${badge.earned
                                            ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 opacity-60'
                                            }`}
                                    >
                                        <span className={`text-3xl ${badge.earned ? '' : 'grayscale'}`}>{badge.emoji}</span>
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-1">{badge.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {badge.threshold} donation{badge.threshold !== 1 ? 's' : ''}
                                        </p>
                                        {badge.earned && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        {!badge.earned && badge.progress > 0 && (
                                            <div className="mt-1 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${badge.progress}%`,
                                                        backgroundColor: badge.color,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {badges.length > 4 && (
                                <button
                                    onClick={() => setShowAllBadges(!showAllBadges)}
                                    className="w-full mt-3 text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1"
                                >
                                    {showAllBadges ? (
                                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>View All {badges.length} Badges <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ===== Third Row: Donation History + Hospital Breakdown ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Donation History */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-500" />
                                    Donation History
                                </span>
                                {donationHistory.length > 0 && (
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-normal"
                                    >
                                        {showHistory ? 'Collapse' : `View All (${donationHistory.length})`}
                                        {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {donationHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <Droplet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        No completed donations yet. Schedule one today!
                                    </p>
                                    <a
                                        href="/user/appointments"
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block"
                                    >
                                        Book an appointment →
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {(showHistory ? donationHistory : donationHistory.slice(0, 5)).map((d, i) => (
                                        <div
                                            key={d._id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                    style={{
                                                        background: `linear-gradient(135deg, #dc2626, #f97316)`,
                                                    }}
                                                >
                                                    #{donationHistory.length - i}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {d.hospital || d.camp || 'Blood Donation'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {format(new Date(d.date), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => downloadCertificate(d)}
                                                    disabled={generatingCert === d._id}
                                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                                                    title="Download Certificate"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    {generatingCert === d._id ? 'Generating...' : 'Cert'}
                                                </button>
                                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-semibold flex items-center gap-1">
                                                    <Gift className="w-3 h-3" />
                                                    +{d.rewardPoints} pts
                                                </span>
                                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold flex items-center gap-1">
                                                    <Heart className="w-3 h-3" />
                                                    {LIVES_PER_DONATION} saved
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Donation Timeline mini chart */}
                            {Object.keys(donationsByMonth).length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                        Monthly Donation Activity
                                    </p>
                                    <div className="flex items-end gap-1 h-20">
                                        {Object.entries(donationsByMonth)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .slice(-12)
                                            .map(([month, count]) => {
                                                const maxCount = Math.max(...Object.values(donationsByMonth));
                                                const height = (count / maxCount) * 100;
                                                return (
                                                    <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                        <div
                                                            className="w-full rounded-t-sm bg-gradient-to-t from-red-500 to-red-400 opacity-80 hover:opacity-100 transition-opacity min-h-[4px]"
                                                            style={{ height: `${Math.max(height, 5)}%` }}
                                                        />
                                                        <span className="text-[9px] text-gray-400 leading-none">
                                                            {month.split('-')[1]}
                                                        </span>
                                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                            {month}: {count}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hospital Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Building2 className="w-5 h-5 text-gray-500" />
                                Hospitals Helped
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(hospitalBreakdown).length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                    No hospital data yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(hospitalBreakdown)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([name, count]) => {
                                            const totalDonations = stats.totalDonations || 1;
                                            const percentage = Math.round((count / totalDonations) * 100);
                                            return (
                                                <div key={name}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={name}>
                                                            {name}
                                                        </p>
                                                        <span className="text-xs font-semibold text-gray-500 ml-2 flex-shrink-0">
                                                            {count}× ({percentage}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}

                            {/* Upcoming Appointments */}
                            {allAppointments && (
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                        Upcoming Appointments
                                    </p>
                                    {allAppointments.filter((a) => a.status === 'booked').length === 0 ? (
                                        <p className="text-xs text-gray-400 dark:text-gray-500">No upcoming appointments</p>
                                    ) : (
                                        allAppointments
                                            .filter((a) => a.status === 'booked')
                                            .slice(0, 3)
                                            .map((a) => (
                                                <div
                                                    key={a._id}
                                                    className="flex items-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                >
                                                    <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                    <span className="truncate">{a.hospital || a.camp || 'Appointment'}</span>
                                                    <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                                                        {format(new Date(a.date), 'MMM dd')}
                                                    </span>
                                                </div>
                                            ))
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ===== Motivational Banner ===== */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                    <h3 className="text-lg font-bold">
                        {stats.totalDonations === 0
                            ? 'Start Your Donation Journey Today!'
                            : stats.totalDonations < 5
                                ? `Great start! ${5 - stats.totalDonations} more donations to earn Life Saver badge 🥈`
                                : stats.totalDonations < 10
                                    ? `Amazing! ${10 - stats.totalDonations} more to become a Hero Donor 🥇`
                                    : `You're a hero! ${stats.livesSaved} lives saved and counting 🦸`}
                    </h3>
                    <p className="text-indigo-200 text-sm mt-1">
                        Each blood donation can save up to 3 lives. Be someone's hero today.
                    </p>
                    <a href="/user/appointments">
                        <Button className="mt-4 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-6">
                            Book a Donation Appointment
                        </Button>
                    </a>
                </div>
            </div>

            {/* Hidden Certificate Templates for PDF Generation */}
            <div className="hidden">
                {donationHistory.map(d => (
                    <div
                        key={`cert-${d._id}`}
                        id={`certificate-${d._id}`}
                        className="w-[842px] h-[595px] bg-white p-10 relative flex flex-col items-center justify-center border-[14px] border-red-700 mx-auto"
                        style={{ fontFamily: 'sans-serif' }}
                    >
                        <div className="absolute top-8 left-8">
                            <h2 className="text-3xl font-black text-red-700">VienLink</h2>
                            <p className="text-xs text-red-600 font-bold tracking-widest uppercase">Blood Bank System</p>
                        </div>
                        {qrDataPayload && (
                            <div className="absolute top-8 right-8">
                                <QRCodeSVG value={JSON.stringify(qrDataPayload)} size={70} level="L" />
                            </div>
                        )}
                        <Heart className="w-16 h-16 text-red-500 mb-6 drop-shadow-md" />
                        <h1 className="text-5xl font-black text-gray-900 uppercase tracking-wider mb-2">Certificate</h1>
                        <h2 className="text-2xl font-light text-gray-600 uppercase tracking-widest mb-10">Of Blood Donation</h2>

                        <p className="text-lg text-gray-700 italic mb-4">This certificate is proudly presented to</p>
                        <p className="text-4xl font-bold text-gray-900 border-b-2 border-red-200 pb-2 px-12 mb-8">
                            {user?.firstName} {user?.lastName}
                        </p>

                        <p className="text-lg text-center text-gray-600 max-w-2xl leading-relaxed mb-12">
                            In recognition of your outstanding dedication to humanity and life-saving contribution of <strong className="text-red-600">{user?.bloodGroup}</strong> blood on <strong>{format(new Date(d.date), 'MMMM dd, yyyy')}</strong> at <strong>{d.hospital || d.camp || 'VienLink'}</strong>.
                        </p>

                        <div className="flex justify-between w-full px-20">
                            <div className="text-center pt-4 border-t-2 border-gray-300 min-w-40">
                                <p className="font-bold text-gray-800">VienLink System</p>
                                <p className="text-sm text-gray-500 italic">Issued By</p>
                            </div>
                            <div className="text-center pt-4 border-t-2 border-gray-300 min-w-40">
                                <p className="font-bold text-red-600">{format(new Date(d.date), 'MMMM dd, yyyy')}</p>
                                <p className="text-sm text-gray-500 italic">Date</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
