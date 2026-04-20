import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';


import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStats from './pages/AdminStats';
import MobileNavbar from './components/MobileNavbar';
import { useAuth } from './context/AuthContext';
import api from './utils/api';

let pendingPushToken = null;

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && pendingPushToken) {
      api.put('/api/auth/update-push-token', { token: pendingPushToken })
        .then(() => {
          console.log('Push token updated on server');
          pendingPushToken = null; // Clear after update
        })
        .catch(err => console.error('Error updating push token on server:', err));
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      {<MobileNavbar userRole={user?.role} />}
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initializing native features
    const initApp = async () => {
      try {
        // Set Status Bar Style
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' }); // Matches your dark theme

        // Hide Splash Screen
        await SplashScreen.hide();

        // Handle Back Button for Android
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        });

        // Initialize Push Notifications (Disabled until google-services.json is added)
        /*
        const requestPushPermission = async () => {
          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }
          if (permStatus.receive !== 'granted') {
            console.warn('User denied push permissions');
            return;
          }
          await PushNotifications.register();
        };

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          pendingPushToken = token.value;
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Push registration error: ', err.error);
        });

        await requestPushPermission();
        */
      } catch (err) {
        console.warn('Capacitor plugins not available or failed:', err);
      }
    };

    initApp();
  }, []);

  return (

    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student-dashboard" element={<StudentDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/stats" element={<AdminStats />} />
            </Route>
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
