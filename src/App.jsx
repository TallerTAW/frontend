import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
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
import Register from './pages/Register';
import ControlAcceso from './pages/ControlAcceso';
import ProfilePage from './pages/ProfilePage'; // NUEVO IMPORT
import CourtsVisitante from './pages/CourtsVisitante'; // Importación correcta

function AppRoutes() {
  return (
    <Routes>
      {/* =======================================================
          RUTAS PÚBLICAS (NO REQUIEREN INICIAR SESIÓN)
         ======================================================= */}
      
      {/* Página de Inicio */}
      <Route path="/" element={<Home />} />

      {/* 🔥 AQUÍ ESTÁ LA CORRECCIÓN: La ruta de visitantes debe estar AQUÍ, fuera de ProtectedRoute */}
      <Route path="/canchas-visitante" element={<CourtsVisitante />} />

      {/* Autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />


      {/* =======================================================
          RUTAS PROTEGIDAS (DENTRO DEL LAYOUT Y CON PROTECCIÓN)
         ======================================================= */}
      <Route
        element={
          <ProtectedRoute allowGuest={true}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Accesible para invitados logueados */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Reservar - Accesible para invitados */}
        <Route path="/reservar" element={<Reservar />} />

        {/* Perfil del usuario - Solo autenticados */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Rutas para Admin */}
        {/* Rutas para Admin y Gestor */}
        <Route
          path="/espacios"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor']}>
              <Facilities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disciplinas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor']}>
              <Disciplinas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canchas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor']}>
              <Courts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Cliente - Solo autenticados */}
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calificaciones"
          element={
            <ProtectedRoute allowedRoles={['cliente', 'admin']}>
              <Ratings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Wallet />
            </ProtectedRoute>
          }
        />

        {/* Gestor / Control de acceso */}
        <Route
          path="/reservas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor', 'control_acceso']}>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/control-acceso"
          element={
            <ProtectedRoute allowedRoles={['control_acceso']}>
              <ControlAcceso />
            </ProtectedRoute>
          }
        />

        {/* Admin extra */}
        <Route
          path="/cupones"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Página de Reportes - En construcción</div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback: cualquier ruta desconocida redirige al dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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