// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes de la Landing Page
import Navbar from './components/Navbar'; // Tu Navbar de la Landing Page
import HomePage from './pages/HomePage'; // La nueva página principal/landing

// Páginas y componentes de la aplicación autenticada
import Login from './pages/Login';
import Layout from './components/Layout'; // Tu Layout de Material-UI
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
// ... (otras importaciones de páginas como Facilities, Sports, etc.)

function AppRoutes() {
  const { user } = useAuth(); // Obtiene el estado del usuario del contexto

  return (
    <Routes>
      {/* Ruta para la página principal/landing page */}
      {/* Si el usuario está logueado, redirige al dashboard. Si no, muestra la HomePage. */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />

      {/* Ruta de Login: Si el usuario ya está logueado, redirige al dashboard */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/*
        Rutas Protegidas: Usan tu componente Layout de Material-UI.
        El Layout ya contiene su propio AppBar (navbar) y Drawer (sidebar).
        Por lo tanto, el Navbar de la Landing Page (importado arriba) NO debe renderizarse aquí.
      */}
      <Route
        path="/dashboard" // Esta es la ruta base para el área autenticada
        element={
          <ProtectedRoute>
            <Layout /> {/* Aquí se renderiza tu Layout de Material-UI */}
          </ProtectedRoute>
        }
      >
        {/* Las rutas anidadas se renderizan dentro del <Outlet /> de Layout */}
        <Route index element={<Dashboard />} />
        {/* ... (tus otras rutas protegidas anidadas, por ejemplo): */}
        <Route path="facilities" element={<ProtectedRoute allowedRoles={['admin_general']}><Facilities /></ProtectedRoute>} />
        <Route path="sports" element={<ProtectedRoute allowedRoles={['admin_general']}><Sports /></ProtectedRoute>} />
        {/* ... y así sucesivamente para todas tus páginas */}
        <Route path="courts" element={<ProtectedRoute allowedRoles={['admin_general', 'admin_facility']}><Courts /></ProtectedRoute>} />
        <Route path="book" element={<ProtectedRoute allowedRoles={['client']}><Book /></ProtectedRoute>} />
        <Route path="reservations" element={<ProtectedRoute allowedRoles={['client', 'admin_general', 'admin_facility']}><Reservations /></ProtectedRoute>} />
        <Route path="ratings" element={<ProtectedRoute allowedRoles={['client']}><Ratings /></ProtectedRoute>} />
        <Route path="wallet" element={<ProtectedRoute allowedRoles={['client']}><Wallet /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin_general', 'regulator']}><Users /></ProtectedRoute>} />
      </Route>

      {/* Ruta para cualquier otra URL no definida */}
      <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { user } = useAuth(); // Accede al estado del usuario

  return (
    <BrowserRouter>
      <AuthProvider>
        {/*
          Renderiza el Navbar de la Landing Page SÓLO si el usuario NO está logueado.
          Cuando el usuario está logueado, el Layout de Material-UI tomará el control
          y su propio AppBar (header) y Drawer (sidebar) se mostrarán.
        */}
        {!user && <Navbar />}

        <AppRoutes /> {/* Contiene todas tus rutas y el componente Layout condicional */}

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