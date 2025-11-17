import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface BloodTypeData {
  blood_type: string;
  quantity_ml: number;
  unit_count: number;
  expiring_soon: number;
  critical_level: boolean;
}

// 3D Blood Bag Component
const BloodBag3D: React.FC<{ bloodType: string; quantity: number; isCritical: boolean; position: [number, number, number] }> = ({ 
  bloodType, 
  quantity, 
  isCritical, 
  position 
}) => {
  const [hovered, setHovered] = useState(false);
  
  const getBloodColor = (bloodType: string) => {
    const colors = {
      'A+': '#DC2626',
      'A-': '#B91C1C',
      'B+': '#EA580C',
      'B-': '#C2410C',
      'AB+': '#7C2D12',
      'AB-': '#92400E',
      'O+': '#991B1B',
      'O-': '#7F1D1D'
    };
    return colors[bloodType as keyof typeof colors] || '#DC2626';
  };

  return (
    <group position={position}>
      <Box
        args={[1, quantity / 1000, 0.5]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial 
          color={getBloodColor(bloodType)} 
          transparent
          opacity={isCritical ? 0.7 : 0.9}
        />
      </Box>
      <Text
        position={[0, (quantity / 1000) + 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {bloodType}
      </Text>
      <Text
        position={[0, (quantity / 1000) + 0.1, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {quantity}ml
      </Text>
    </group>
  );
};

// 3D Scene Component
const BloodInventory3D: React.FC<{ data: BloodTypeData[] }> = ({ data }) => {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} color="#ff0000" intensity={0.3} />
      
      {data.map((item, index) => (
        <BloodBag3D
          key={item.blood_type}
          bloodType={item.blood_type}
          quantity={item.quantity_ml}
          isCritical={item.critical_level}
          position={[(index % 4) * 3 - 4.5, 0, Math.floor(index / 4) * 3 - 1.5]}
        />
      ))}
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [inventoryData, setInventoryData] = useState<BloodTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchInventoryData();
  }, [user, navigate]);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const data = await response.json();
      setInventoryData(data.inventory);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const criticalBloodTypes = inventoryData.filter(item => item.critical_level);
  const totalUnits = inventoryData.reduce((sum, item) => sum + item.unit_count, 0);
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity_ml, 0);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground">VienLink</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <p className="text-sm text-muted-foreground">{user.hospital.name}</p>
                <p className="text-xs text-muted-foreground">License: {user.hospital.license_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blood Units</CardTitle>
              <svg className="w-4 h-4 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
              <p className="text-xs text-red-200">Active units</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
              <p className="text-xs text-blue-200">ml total volume</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryData.reduce((sum, item) => sum + item.expiring_soon, 0)}
              </div>
              <p className="text-xs text-amber-200">Units in 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Levels</CardTitle>
              <svg className="w-4 h-4 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalBloodTypes.length}</div>
              <p className="text-xs text-red-200">Blood types</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalBloodTypes.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Critical Blood Level Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {criticalBloodTypes.map((item) => (
                  <div key={item.blood_type} className="text-center p-3 bg-card rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-lg font-bold text-red-600">{item.blood_type}</div>
                    <div className="text-sm text-muted-foreground">{item.quantity_ml}ml</div>
                    <Badge variant="destructive" className="mt-1">Critical</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3D Blood Inventory Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3D Blood Inventory Visualization</CardTitle>
            <CardDescription>
              Interactive 3D view of your blood inventory. Hover and drag to explore.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              {!isLoading && <BloodInventory3D data={inventoryData} />}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Inventory</CardTitle>
              <CardDescription>Add or update blood stock</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/inventory')}>
                Go to Inventory
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donor Management</CardTitle>
              <CardDescription>Register and manage donors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate('/donors')}>
                Manage Donors
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blood Requests</CardTitle>
              <CardDescription>Process blood requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate('/requests')}>
                View Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;