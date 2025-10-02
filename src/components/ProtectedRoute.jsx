import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress className="text-primary" size={60} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles - usa 'rol' que viene del backend
  if (allowedRoles && !allowedRoles.includes(profile?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}