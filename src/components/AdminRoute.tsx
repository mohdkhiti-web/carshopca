import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const AdminRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
