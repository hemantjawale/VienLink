import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/Layout/MainLayout';
import { ChatbotWidget } from './components/Chatbot/ChatbotWidget';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Donors } from './pages/Donors';
import { BloodUnits } from './pages/BloodUnits';
import { BloodRequests } from './pages/BloodRequests';
import { InterHospitalRequests } from './pages/InterHospitalRequests';
import { BloodCamps } from './pages/BloodCamps';
import { Staff } from './pages/Staff';
import { Hospitals } from './pages/Hospitals';
import { Analytics } from './pages/Analytics';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/donors"
        element={
          <PrivateRoute>
            <MainLayout>
              <Donors />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/blood-units"
        element={
          <PrivateRoute>
            <MainLayout>
              <BloodUnits />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/blood-requests"
        element={
          <PrivateRoute>
            <MainLayout>
              <BloodRequests />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inter-hospital-requests"
        element={
          <PrivateRoute>
            <MainLayout>
              <InterHospitalRequests />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/blood-camps"
        element={
          <PrivateRoute>
            <MainLayout>
              <BloodCamps />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <PrivateRoute>
            <MainLayout>
              <Staff />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hospitals"
        element={
          <PrivateRoute>
            <MainLayout>
              <Hospitals />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <MainLayout>
              <Analytics />
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ChatbotWidget />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

