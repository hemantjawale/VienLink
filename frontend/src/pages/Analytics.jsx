import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { TrendingUp, AlertTriangle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('A+');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedBloodGroup) {
      fetchPrediction();
    }
  }, [selectedBloodGroup]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      const response = await api.get(`/analytics/stock-prediction/${selectedBloodGroup}`);
      setPrediction(response.data.data);
    } catch (error) {
      console.error('Failed to fetch prediction');
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const monthlyData = dashboardData?.monthlyTrend?.map((item) => ({
    month: `${item._id.month}/${item._id.year}`,
    collections: item.count,
  })) || [];

  const inventoryData = dashboardData?.inventorySummary?.map((item) => ({
    bloodGroup: item._id,
    available: item.available,
    total: item.total,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Insights and predictions for your blood bank</p>
      </div>

      {/* Stock Prediction */}
      {prediction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Stock Prediction</CardTitle>
              <Select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                options={bloodGroups.map((bg) => ({ value: bg, label: bg }))}
                className="w-32"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{prediction.currentStock}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Avg Daily Collection</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {prediction.avgDailyCollection}
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Avg Daily Issue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{prediction.avgDailyIssue}</p>
              </div>
              <div className="p-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Risk Level</p>
                <p
                  className={`text-2xl font-bold ${
                    prediction.riskLevel === 'critical'
                      ? 'text-danger-600'
                      : prediction.riskLevel === 'high'
                      ? 'text-orange-600'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {prediction.riskLevel.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Prediction</p>
              <p className="text-gray-600 dark:text-gray-300">{prediction.prediction}</p>
              {prediction.daysUntilLowStock && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Low stock predicted in {prediction.daysUntilLowStock} days
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="collections" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory by Blood Group</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bloodGroup" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" fill="#22c55e" name="Available" />
                <Bar dataKey="total" fill="#0ea5e9" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Donors</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.totalDonors || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.recentRequests?.filter((r) => r.status === 'pending').length ||
                    0}
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Upcoming Camps</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.upcomingCamps?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-900/30 rounded-lg">
                <TrendingUp className="text-secondary-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

