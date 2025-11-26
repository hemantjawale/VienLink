// import { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../lib/api';
// import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
// import { Button } from '../components/ui/Button';
// import { Droplet, Users, FileText, Calendar, TrendingUp, AlertCircle, Building2, ArrowRight, RefreshCw } from 'lucide-react';
// import { format } from 'date-fns';
// import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// export const Dashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [pendingHospitals, setPendingHospitals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [chartData, setChartData] = useState({
//     inventoryTrends: [],
//     bloodGroupData: []
//   });

//   useEffect(() => {
//     fetchDashboardData();
//     if (user?.role === 'super_admin') {
//       fetchPendingHospitals();
//     }
//   }, [user?.role]);

//   const fetchDashboardData = async () => {
//     try {
//       const response = await api.get('/analytics/dashboard');
//       setStats(response.data.data);
      
//       // Transform data for charts
//       if (response.data.data?.inventorySummary) {
//         // Prepare blood group distribution data
//         const bloodGroupData = response.data.data.inventorySummary.map(item => ({
//           name: item._id,
//           available: item.available,
//           total: item.total
//         }));
        
//         // Prepare inventory trends data (example with dummy data - replace with actual API data)
//         const inventoryTrends = [
//           { date: 'Jan', A: 45, B: 35, AB: 25, O: 40 },
//           { date: 'Feb', A: 52, B: 38, AB: 28, O: 45 },
//           { date: 'Mar', A: 48, B: 40, AB: 30, O: 42 },
//           { date: 'Apr', A: 55, B: 42, AB: 32, O: 48 },
//           { date: 'May', A: 58, B: 45, AB: 35, O: 50 },
//           { date: 'Jun', A: 62, B: 48, AB: 38, O: 55 }
//         ];
        
//         setChartData({ inventoryTrends, bloodGroupData });
//       }
//     } catch (error) {
//       console.error('Failed to fetch dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleRefresh = () => {
//     setLoading(true);
//     fetchDashboardData();
//   };

//   const fetchPendingHospitals = async () => {
//     try {
//       const response = await api.get('/hospitals', {
//         params: { isApproved: 'false' },
//       });
//       setPendingHospitals(response.data.data || []);
//     } catch (error) {
//       console.error('Failed to fetch pending hospitals:', error);
//     }
//   };

//   const handleApprove = async (hospitalId) => {
//     try {
//       await api.put(`/hospitals/${hospitalId}/approve`);
//       fetchPendingHospitals();
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Failed to approve hospital:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   const statCards = [
//     {
//       title: 'Total Blood Units',
//       value: stats?.inventorySummary?.reduce((sum, item) => sum + item.total, 0) || 0,
//       icon: Droplet,
//       color: 'text-primary-600',
//       bgColor: 'bg-primary-50',
//     },
//     {
//       title: 'Available Units',
//       value: stats?.inventorySummary?.reduce((sum, item) => sum + item.available, 0) || 0,
//       icon: Droplet,
//       color: 'text-secondary-600',
//       bgColor: 'bg-secondary-50',
//     },
//     {
//       title: 'Total Donors',
//       value: stats?.totalDonors || 0,
//       icon: Users,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50',
//     },
//     {
//       title: 'Pending Requests',
//       value: stats?.recentRequests?.filter(r => r.status === 'pending').length || 0,
//       icon: FileText,
//       color: 'text-orange-600',
//       bgColor: 'bg-orange-50',
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
//           <p className="text-gray-600 dark:text-gray-300 mt-1">
//             Welcome back, {user?.firstName}! Here's what's happening today.
//           </p>
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handleRefresh}
//           disabled={loading}
//           className="flex items-center gap-2"
//         >
//           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Pending Hospitals Alert for Super Admin */}
//       {user?.role === 'super_admin' && pendingHospitals.length > 0 && (
//         <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
//           <CardContent className="p-6">
//             <div className="flex items-start justify-between">
//               <div className="flex items-start gap-4 flex-1">
//                 <div className="p-3 bg-orange-500 rounded-lg">
//                   <AlertCircle className="text-white" size={24} />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold text-orange-900 mb-1">
//                     {pendingHospitals.length} {pendingHospitals.length === 1 ? 'Hospital' : 'Hospitals'} Pending Approval
//                   </h3>
//                   <p className="text-sm text-orange-700 mb-4">
//                     Review and approve hospitals waiting for access to the system.
//                   </p>
//                   <div className="space-y-2">
//                     {pendingHospitals.slice(0, 3).map((hospital) => (
//                       <div
//                         key={hospital._id}
//                         className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
//                       >
//                         <div className="flex items-center gap-3">
//                           <Building2 className="text-orange-600 dark:text-orange-400" size={20} />
//                           <div>
//                             <p className="font-medium text-gray-900 dark:text-white">{hospital.name}</p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">{hospital.email}</p>
//                           </div>
//                         </div>
//                         <Button
//                           size="sm"
//                           variant="secondary"
//                           onClick={() => handleApprove(hospital._id)}
//                         >
//                           Approve
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                   {pendingHospitals.length > 3 && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="mt-4"
//                       onClick={() => navigate('/hospitals')}
//                     >
//                       View All {pendingHospitals.length} Pending Hospitals
//                       <ArrowRight size={16} />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={index}>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{stat.title}</p>
//                     <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
//                   </div>
//                   <div className={`${stat.bgColor} p-3 rounded-lg`}>
//                     <Icon className={stat.color} size={24} />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Blood Group Inventory */}
//       {stats?.inventorySummary && stats.inventorySummary.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Blood Inventory by Group</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.inventorySummary.map((item) => (
//                 <div
//                   key={item._id}
//                   className="p-4 border border-gray-200 rounded-lg"
//                 >
//                   <p className="text-2xl font-bold text-gray-900 dark:text-white">{item._id}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
//                     Available: <span className="font-medium text-gray-900 dark:text-white">{item.available}</span>
//                   </p>
//                   <p className="text-sm text-gray-600 dark:text-gray-300">
//                     Total: <span className="font-medium">{item.total}</span>
//                   </p>
//                   {item.expiringSoon > 0 && (
//                     <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
//                       <AlertCircle size={14} />
//                       {item.expiringSoon} expiring soon
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Recent Requests */}
//       {stats?.recentRequests && stats.recentRequests.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Blood Requests</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {stats.recentRequests.map((request) => (
//                 <div
//                   key={request._id}
//                   className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <div>
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {request.patientName} - {request.bloodGroup}
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">
//                       {request.requestedBy?.firstName} {request.requestedBy?.lastName} •{' '}
//                       {format(new Date(request.createdAt), 'MMM dd, yyyy')}
//                     </p>
//                   </div>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       request.status === 'approved'
//                         ? 'bg-secondary-100 text-secondary-700'
//                         : request.status === 'pending'
//                         ? 'bg-orange-100 text-orange-700'
//                         : 'bg-gray-100 text-gray-700'
//                     }`}
//                   >
//                     {request.status}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Upcoming Camps */}
//       {stats?.upcomingCamps && stats.upcomingCamps.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Upcoming Blood Camps</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {stats.upcomingCamps.map((camp) => (
//                 <div
//                   key={camp._id}
//                   className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-primary-50 rounded-lg">
//                       <Calendar className="text-primary-600" size={20} />
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-900">{camp.name}</p>
//                       <p className="text-sm text-gray-600">
//                         {format(new Date(camp.startDate), 'MMM dd, yyyy')} •{' '}
//                         {camp.totalRegistrations} registrations
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Droplet, Users, FileText, Calendar, TrendingUp, AlertCircle, Building2, ArrowRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    inventoryTrends: [],
    bloodGroupData: []
  });

  useEffect(() => {
    fetchDashboardData();
    if (user?.role === 'super_admin') {
      fetchPendingHospitals();
    }
  }, [user?.role]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      const data = response.data.data;
      setStats(data);
      
      if (data?.inventorySummary) {
        // Prepare blood group distribution data
        const bloodGroupData = data.inventorySummary.map(item => ({
          name: item._id,
          available: item.available,
          total: item.total
        }));

        // Prepare inventory trends data (last 6 months)
        const currentDate = new Date();
        const months = [];
        
        // Get month names for the last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - i);
          const monthData = { date: date.toLocaleString('default', { month: 'short' }) };
          
          // Initialize data for each blood group
          data.inventorySummary.forEach(item => {
            // Calculate a value based on available units (this is a placeholder)
            // In a real app, you'd get this from your historical data
            monthData[item._id] = Math.floor(item.available * (0.7 + Math.random() * 0.6));
          });
          
          months.push(monthData);
        }

        setChartData({ 
          inventoryTrends: months,
          bloodGroupData 
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const fetchPendingHospitals = async () => {
    try {
      const response = await api.get('/hospitals', {
        params: { isApproved: 'false' },
      });
      setPendingHospitals(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pending hospitals:', error);
    }
  };

  const handleApprove = async (hospitalId) => {
    try {
      await api.put(`/hospitals/${hospitalId}/approve`);
      fetchPendingHospitals();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to approve hospital:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Blood Units',
      value: stats?.inventorySummary?.reduce((sum, item) => sum + item.total, 0) || 0,
      icon: Droplet,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Available Units',
      value: stats?.inventorySummary?.reduce((sum, item) => sum + item.available, 0) || 0,
      icon: Droplet,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'Total Donors',
      value: stats?.totalDonors || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Requests',
      value: stats?.recentRequests?.filter(r => r.status === 'pending').length || 0,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Trends Chart */}
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Blood Inventory Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData.inventoryTrends}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {chartData.bloodGroupData.map((_, index) => {
                    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899'];
                    const color = colors[index % colors.length];
                    return (
                      <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartData.bloodGroupData.map((group, index) => {
                  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899'];
                  const color = colors[index % colors.length];
                  return (
                    <Area 
                      key={group.name}
                      type="monotone" 
                      dataKey={group.name} 
                      stroke={color} 
                      fillOpacity={0.2} 
                      strokeWidth={2}
                      fill={`url(#color${index})`} 
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blood Group Distribution - Blood Bag Visualization */}
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Blood Stock by Group</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)] flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-xl">
              {chartData.bloodGroupData.map((group) => {
                const total = group.total || 0;
                const available = group.available || 0;
                const fillPercent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

                return (
                  <div key={group.name} className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-28 rounded-b-xl border-2 border-red-500 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                      {/* Neck */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-4 rounded-t-md border-2 border-red-500 bg-white dark:bg-gray-900"></div>
                      {/* Fill */}
                      <div
                        className="absolute bottom-0 left-0 w-full bg-red-500/90"
                        style={{ height: `${fillPercent}%` }}
                      />
                      {/* Label inside bag */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-semibold text-white drop-shadow">
                        <span>{group.name}</span>
                        <span>{available}/{total}</span>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-700 dark:text-gray-200">
                      <p className="font-semibold">{group.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{fillPercent}% full</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Group Inventory */}
      {stats?.inventorySummary && stats.inventorySummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blood Inventory by Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.inventorySummary.map((item) => (
                <div
                  key={item._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item._id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Available: <span className="font-medium text-gray-900 dark:text-white">{item.available}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total: <span className="font-medium text-gray-900 dark:text-white">{item.total}</span>
                  </p>
                  {item.expiringSoon > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {item.expiringSoon} expiring soon
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Hospitals Section */}
      {user?.role === 'super_admin' && pendingHospitals.length > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-900 mb-1">
                    {pendingHospitals.length} {pendingHospitals.length === 1 ? 'Hospital' : 'Hospitals'} Pending Approval
                  </h3>
                  <div className="space-y-2 mt-4">
                    {pendingHospitals.slice(0, 3).map((hospital) => (
                      <div
                        key={hospital._id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="text-orange-600 dark:text-orange-400" size={20} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{hospital.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{hospital.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApprove(hospital._id)}
                        >
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
