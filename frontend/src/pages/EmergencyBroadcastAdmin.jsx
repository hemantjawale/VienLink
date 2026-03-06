import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
    AlertTriangle,
    Activity,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Radio,
    Zap,
    BarChart3,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    User,
    Phone,
    Timer,
    TrendingUp,
    Search,
} from 'lucide-react';

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const statusFilters = ['', 'Active', 'Accepted', 'Expired', 'Cancelled'];

export const EmergencyBroadcastAdmin = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterBloodGroup, setFilterBloodGroup] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [respondingDonor, setRespondingDonor] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterBloodGroup) params.append('bloodGroup', filterBloodGroup);
            params.append('page', page);
            params.append('limit', 15);

            const res = await api.get(`/emergency-broadcast/admin/all?${params.toString()}`);
            setRequests(res.data.data || []);
            setStats(res.data.stats || null);
            setPagination(res.data.pagination || null);
        } catch (err) {
            toast.error('Failed to load emergency requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterBloodGroup, page]);

    useEffect(() => {
        fetchData();
        // Poll every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleDonorResponse = async (requestId, donorId, action) => {
        try {
            setRespondingDonor(donorId);
            const res = await api.post(`/emergency-broadcast/${requestId}/respond`, {
                donorId,
                action,
            });
            toast.success(res.data.message);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to respond');
        } finally {
            setRespondingDonor(null);
        }
    };

    const formatDuration = (ms) => {
        if (!ms) return '--';
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (minutes < 60) return `${minutes}m ${secs}s`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Active': return <Activity className="w-4 h-4 text-amber-500 animate-pulse" />;
            case 'Accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'Expired': return <Clock className="w-4 h-4 text-gray-400" />;
            case 'Cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Active': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700';
            case 'Accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
            case 'Expired': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700';
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Broadcast Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Monitor and manage emergency blood requests in real-time
                        </p>
                    </div>
                </div>
                <Button onClick={fetchData} variant="outline" className="hidden md:flex items-center gap-2" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <Card className="!p-4 border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-3">
                            <Activity className="w-8 h-8 text-amber-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Active Now</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4 border-l-4 border-l-green-500">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Accepted</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4 border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDonorsNotified}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Donors Notified</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4 border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-purple-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Requests</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="!p-4 border-l-4 border-l-rose-500">
                        <div className="flex items-center gap-3">
                            <Timer className="w-8 h-8 text-rose-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(stats.avgTimeTakenMs)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Response Time</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Response Stats Bar */}
            {stats && stats.totalDonorsNotified > 0 && (
                <Card className="!p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Donor Response Rate</span>
                    </div>
                    <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {stats.totalAccepted > 0 && (
                            <div
                                className="bg-green-500 transition-all duration-500"
                                style={{ width: `${(stats.totalAccepted / stats.totalDonorsNotified) * 100}%` }}
                                title={`Accepted: ${stats.totalAccepted}`}
                            />
                        )}
                        {stats.totalRejected > 0 && (
                            <div
                                className="bg-red-400 transition-all duration-500"
                                style={{ width: `${(stats.totalRejected / stats.totalDonorsNotified) * 100}%` }}
                                title={`Rejected: ${stats.totalRejected}`}
                            />
                        )}
                        <div
                            className="bg-yellow-300 transition-all duration-500"
                            style={{
                                width: `${((stats.totalDonorsNotified - stats.totalAccepted - stats.totalRejected) / stats.totalDonorsNotified) * 100}%`,
                            }}
                            title={`Pending: ${stats.totalDonorsNotified - stats.totalAccepted - stats.totalRejected}`}
                        />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Accepted: {stats.totalAccepted}
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Rejected: {stats.totalRejected}
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" /> Pending:{' '}
                            {stats.totalDonorsNotified - stats.totalAccepted - stats.totalRejected}
                        </span>
                    </div>
                </Card>
            )}

            {/* Filters */}
            <Card className="!p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters:</span>
                    </div>
                    <Select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        options={statusFilters.map((s) => ({ value: s, label: s || 'All Statuses' }))}
                        className="!mb-0"
                    />
                    <Select
                        value={filterBloodGroup}
                        onChange={(e) => { setFilterBloodGroup(e.target.value); setPage(1); }}
                        options={bloodGroups.map((bg) => ({ value: bg, label: bg || 'All Blood Groups' }))}
                        className="!mb-0"
                    />
                </div>
            </Card>

            {/* Requests List */}
            {loading && requests.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                </div>
            ) : requests.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No emergency requests found for the selected filters.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <Card
                            key={req._id}
                            className={`transition-all duration-200 hover:shadow-md ${req.status === 'Active' ? 'border-l-4 border-l-amber-500' : ''
                                }`}
                        >
                            <CardContent className="p-4">
                                {/* Header Row */}
                                <div
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                                    onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(req.status)}
                                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-bold">
                                            {req.bloodGroup}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {req.patientId?.firstName} {req.patientId?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {format(new Date(req.createdAt), 'MMM dd, yyyy HH:mm')} · Radius: {req.currentSearchRadius}km
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2 text-xs">
                                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
                                                {req.totalDonorsNotified} notified
                                            </span>
                                            <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300">
                                                {req.acceptedCount} accepted
                                            </span>
                                            <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
                                                {req.rejectedCount} rejected
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                        {expandedId === req._id ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === req._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                        {/* Metrics Row */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{req.totalDonorsNotified}</p>
                                                <p className="text-xs text-gray-500">Donors Notified</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                <p className="text-lg font-bold text-green-600">{req.acceptedCount}</p>
                                                <p className="text-xs text-gray-500">Accepted</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                <p className="text-lg font-bold text-red-600">{req.rejectedCount}</p>
                                                <p className="text-xs text-gray-500">Rejected</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                                <p className="text-lg font-bold text-blue-600">{formatDuration(req.timeTakenToAcceptMs)}</p>
                                                <p className="text-xs text-gray-500">Time to Accept</p>
                                            </div>
                                        </div>

                                        {/* Patient Info */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Patient Info</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {req.patientId?.firstName} {req.patientId?.lastName}
                                                </span>
                                                {req.patientId?.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {req.patientId.phone}
                                                    </span>
                                                )}
                                                {req.patientId?.email && (
                                                    <span className="flex items-center gap-1">{req.patientId.email}</span>
                                                )}
                                            </div>
                                            {req.notes && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Notes: {req.notes}</p>
                                            )}
                                        </div>

                                        {/* Accepted Donor */}
                                        {req.acceptedDonor && (
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                                <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">Accepted Donor</p>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {req.acceptedDonor.firstName} {req.acceptedDonor.lastName}
                                                    </span>
                                                    {req.acceptedDonor.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {req.acceptedDonor.phone}
                                                        </span>
                                                    )}
                                                    <span className="font-bold">{req.acceptedDonor.bloodGroup}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Donor Response List — with Accept/Reject buttons for active requests */}
                                        {req.donorResponses?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                                    Donor Responses ({req.donorResponses.length})
                                                </p>
                                                <div className="max-h-60 overflow-y-auto space-y-2">
                                                    {req.donorResponses.map((dr, i) => (
                                                        <div
                                                            key={dr._id || i}
                                                            className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <User className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {dr.donorId?.firstName
                                                                        ? `${dr.donorId.firstName} ${dr.donorId.lastName}`
                                                                        : `Donor #${i + 1}`}
                                                                </span>
                                                                {dr.distanceKm != null && (
                                                                    <span className="text-xs text-gray-400">({dr.distanceKm}km)</span>
                                                                )}
                                                                <span className="text-xs text-gray-400">@{dr.notifiedAtRadius}km</span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {dr.status === 'Pending' && req.status === 'Active' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDonorResponse(req._id, dr.donorId?._id || dr.donorId, 'Accept');
                                                                            }}
                                                                            disabled={respondingDonor === (dr.donorId?._id || dr.donorId)}
                                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDonorResponse(req._id, dr.donorId?._id || dr.donorId, 'Reject');
                                                                            }}
                                                                            disabled={respondingDonor === (dr.donorId?._id || dr.donorId)}
                                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dr.status === 'Accepted'
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                                : dr.status === 'Rejected'
                                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                                    : dr.status === 'Pending'
                                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                                        : 'bg-gray-100 text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {dr.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Radius Expansion Timeline */}
                                        {req.radiusExpandedAt?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Radius Expansion Timeline</p>
                                                <div className="flex items-center gap-2">
                                                    {req.radiusExpandedAt.map((re, i) => (
                                                        <div key={i} className="flex items-center gap-1">
                                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-bold text-purple-800 dark:text-purple-300">
                                                                {re.radius}km
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {format(new Date(re.expandedAt), 'HH:mm:ss')}
                                                            </span>
                                                            {i < req.radiusExpandedAt.length - 1 && (
                                                                <span className="text-gray-300 dark:text-gray-600">→</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.pages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};
