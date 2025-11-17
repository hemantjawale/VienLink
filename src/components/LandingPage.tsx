import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Heart, 
  Droplets, 
  Users, 
  Shield, 
  TrendingUp, 
  Smartphone,
  Activity,
  Clock,
  Award,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';

// 3D Blood Cell Animation Component
const BloodCell3D: React.FC<{ position: [number, number, number]; color: string; scale?: number }> = ({ 
  position, 
  color, 
  scale = 1 
}) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Sphere
      position={position}
      scale={hovered ? scale * 1.2 : scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        transparent
        opacity={0.8}
        emissive={color}
        emissiveIntensity={hovered ? 0.3 : 0.1}
      />
    </Sphere>
  );
};

// 3D Scene for Hero Section
const Hero3DScene: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#ff0000" intensity={0.5} />
      
      {/* Floating blood cells */}
      <BloodCell3D position={[0, 0, 0]} color="#DC2626" scale={1.5} />
      <BloodCell3D position={[3, 2, -2]} color="#EA580C" scale={1} />
      <BloodCell3D position={[-3, -2, 1]} color="#B91C1C" scale={1.2} />
      <BloodCell3D position={[2, -3, 2]} color="#7C2D12" scale={0.8} />
      <BloodCell3D position={[-2, 3, -1]} color="#991B1B" scale={1.1} />
      
      {/* Floating text */}
      <Text
        position={[0, 4, 0]}
        fontSize={1.5}
        color="#DC2626"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        VienLink
      </Text>
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.5}
        color="#6B7280"
        anchorX="center"
        anchorY="middle"
      >
        Life-Saving Blood Management
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        enableRotate={true}
        autoRotate
        autoRotateSpeed={1}
      />
    </Canvas>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Droplets,
      title: "Real-Time Blood Inventory",
      description: "Track blood stock levels across all 8 blood types with instant updates and critical alerts.",
      color: "from-red-500 to-red-600",
      badge: "Essential"
    },
    {
      icon: Users,
      title: "Donor Management",
      description: "Comprehensive donor registration, medical history tracking, and eligibility management.",
      color: "from-blue-500 to-blue-600",
      badge: "Core"
    },
    {
      icon: Activity,
      title: "3D Visualization",
      description: "Interactive 3D blood inventory with immersive visual experience and real-time data.",
      color: "from-purple-500 to-purple-600",
      badge: "Innovative"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA-compliant security with JWT authentication and Indian healthcare standards.",
      color: "from-green-500 to-green-600",
      badge: "Secure"
    },
    {
      icon: Clock,
      title: "Smart Alerts",
      description: "Automated notifications for low stock, expiring blood, and critical situations.",
      color: "from-amber-500 to-amber-600",
      badge: "Smart"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed analytics, usage reports, and compliance documentation for hospitals.",
      color: "from-indigo-500 to-indigo-600",
      badge: "Analytics"
    }
  ];

  const bloodTypes = [
    { type: "A+", color: "bg-red-500", description: "Universal recipient for platelets" },
    { type: "A-", color: "bg-red-600", description: "Rare blood type, critical for emergencies" },
    { type: "B+", color: "bg-orange-500", description: "Common type, high demand" },
    { type: "B-", color: "bg-orange-600", description: "Rare type, urgent need" },
    { type: "AB+", color: "bg-purple-500", description: "Universal recipient for plasma" },
    { type: "AB-", color: "bg-purple-600", description: "Rarest blood type, extremely valuable" },
    { type: "O+", color: "bg-red-400", description: "Most common, universal donor for RBCs" },
    { type: "O-", color: "bg-red-700", description: "Universal donor, emergency lifesaver" }
  ];

  const stats = [
    { number: "10,000+", label: "Lives Saved", icon: Heart },
    { number: "500+", label: "Hospitals Connected", icon: Globe },
    { number: "50,000+", label: "Blood Units Managed", icon: Droplets },
    { number: "99.9%", label: "System Uptime", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VienLink</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button 
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      🩸 India's #1 Blood Bank Management System
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                      Save Lives with{' '}
                      <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                        Intelligent
                      </span>{' '}
                      Blood Management
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                      VienLink revolutionizes blood bank management with real-time inventory tracking, 
                      3D visualization, and smart alerts. Designed specifically for Indian hospitals 
                      to save more lives efficiently.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 text-lg"
                      onClick={() => navigate('/signup')}
                    >
                      Start Free Trial
                      <Zap className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 px-8 py-6 text-lg"
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Explore Features
                    </Button>
                  </div>

                  <div className="flex items-center space-x-8 pt-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                          <stat.icon className="w-4 h-4" />
                          <span>{stat.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3D Hero Scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-96 lg:h-[500px]"
            >
              <Hero3DScene />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blood Types Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Blood Type Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track and manage all 8 blood types with precision and real-time updates
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bloodTypes.map((bloodType, index) => (
              <motion.div
                key={bloodType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 hover:border-red-200">
                  <CardContent className="pt-6">
                    <div className={`w-16 h-16 ${bloodType.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-white text-xl font-bold">{bloodType.type}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{bloodType.type}</h3>
                    <p className="text-sm text-gray-600">{bloodType.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Hospitals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage blood inventory efficiently and save more lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Blood Bank Management?
            </h2>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Join hundreds of hospitals across India using VienLink to save lives more efficiently.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-6 text-lg"
                onClick={() => navigate('/demo')}
              >
                Request Demo
              </Button>
            </div>
            <p className="text-red-200 text-sm">
              ✨ No credit card required • 30-day free trial • Dedicated support
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VienLink</span>
              </div>
              <p className="text-gray-400">
                India's leading blood bank management system, designed to save lives efficiently.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">24/7 Support</a></li>
                <li><a href="#" className="hover:text-white">Training</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 VienLink. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;