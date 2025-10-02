import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import Disciplinas from './pages/Disciplinas';
import Courts from './pages/Courts';
//import Book from './pages/Book';
import Reservations from './pages/Reservar';
import Ratings from './pages/Ratings';
import Wallet from './pages/Wallet';
import Usuarios from './pages/Usuarios';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="facilities"
          element={
            <ProtectedRoute allowedRoles={['admin_general']}>
              <Facilities />
            </ProtectedRoute>
          }
        />
        <Route
          path="sports"
          element={
            <ProtectedRoute allowedRoles={['admin_general']}>
              <Disciplinas />
            </ProtectedRoute>
          }
        />
        <Route
          path="courts"
          element={
            <ProtectedRoute allowedRoles={['admin_general', 'admin_facility']}>
              <Courts />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="book"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Book />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="reservations"
          element={
            <ProtectedRoute allowedRoles={['client', 'admin_general', 'admin_facility']}>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="ratings"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Ratings />
            </ProtectedRoute>
          }
        />
        <Route
          path="wallet"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin_general', 'regulator']}>
              <Usuarios />
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
