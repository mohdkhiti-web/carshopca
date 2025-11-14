// Browser routes
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import { type CarDocument } from './types/Car';
import { Analytics } from '@vercel/analytics/react';
import { initializeSampleData, sampleCars } from './data/sampleCars';
import { getAllCars } from './services/api';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Admin Components
import AdminRoute from './components/AdminRoute';

// Lazy-loaded pages
const HomePage = lazy(() => import('./components/HomePage'));
const ListingPage = lazy(() => import('./components/ListingPage'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));
const CarDetails = lazy(() => import('./components/CarDetails'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminRegister = lazy(() => import('./components/admin/AdminRegister'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const CarManagement = lazy(() => import('./components/admin/CarManagement'));
const CarForm = lazy(() => import('./components/admin/CarForm'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'));
const Favorites = lazy(() => import('./components/Favorites'));
const Compare = lazy(() => import('./components/Compare'));
const SavedSearches = lazy(() => import('./components/SavedSearches'));
const AdminMessages = lazy(() => import('./components/admin/AdminMessages'));
const AdminSubscribers = lazy(() => import('./components/admin/AdminSubscribers'));

// Admin Auth Context
import { AdminAuthProvider } from './contexts/AdminAuthContext';

// Extend the Window interface to include our db property
declare global {
  interface Window {
    dbInitialized: boolean;
  }
}

const App = () => {
  const [cars, setCars] = useState<CarDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize database and load data
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize sample data if not already done
        if (!window.dbInitialized) {
          await initializeSampleData();
          window.dbInitialized = true;
        }
        
        // Load featured cars (first 3 cars as featured)
        const featured = await getAllCars(3);
        setCars(featured);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback to sample data if IndexedDB fails
        setCars(sampleCars.slice(0, 3) as CarDocument[]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <Analytics />
        <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>}>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage featuredCars={cars} isLoading={isLoading} />} />
          <Route path="listings" element={<ListingPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="car/:id" element={<CarDetails />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="compare" element={<Compare />} />
          <Route path="saved-searches" element={<SavedSearches />} />
          
          {/* Admin Login */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/register" element={<AdminRegister />} />
          
          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/cars" element={<CarManagement />} />
            <Route path="admin/cars/new" element={<CarForm />} />
            <Route path="admin/cars/edit/:id" element={<CarForm isEdit />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            <Route path="admin/messages" element={<AdminMessages />} />
            <Route path="admin/subscribers" element={<AdminSubscribers />} />
          </Route>
          
          {/* 404 - Keep this last */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
        </Suspense>
      </AdminAuthProvider>
    </ThemeProvider>
  );
};

export default App;
