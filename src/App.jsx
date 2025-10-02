import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import Disciplinas from './pages/Disciplinas';
import Courts from './pages/Courts';
import Reservar from './pages/Reservar';
import Reservations from './pages/Reservations';
import Ratings from './pages/Ratings';
import Wallet from './pages/Wallet';
import Usuarios from './pages/Usuarios';
import Unauthorized from './pages/No';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Rutas para Admin */}
        <Route
          path="espacios"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor']}>
              <Facilities />
            </ProtectedRoute>
          }
        />
        <Route
          path="disciplinas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor']}>
              <Disciplinas />
            </ProtectedRoute>
          }
        />
        <Route
          path="canchas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor']}>
              <Courts />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas para Cliente */}
        <Route
          path="reservar"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Reservar />
            </ProtectedRoute>
          }
        />
        <Route
          path="mis-reservas"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="calificaciones"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Ratings />
            </ProtectedRoute>
          }
        />
        <Route
          path="wallet"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Wallet />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas para Gestor y Control de Acceso */}
        <Route
          path="reservas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor', 'control_acceso']}>
              <Reservations />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas adicionales */}
        <Route
          path="cupones"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Página de Reportes - En construcción</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="control-acceso"
          element={
            <ProtectedRoute allowedRoles={['control_acceso']}>
              <div>Página de Control de Acceso - En construcción</div>
            </ProtectedRoute>
          }
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;