import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import Login from './pages/Login';
import StudentApp from './pages/StudentApp';
import TeacherApp from './pages/TeacherApp';

function ProtectedStudentRoute({ children }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role !== 'student') return <Navigate to="/teacher" replace />;
  return children;
}

function ProtectedTeacherRoute({ children }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role !== 'teacher') return <Navigate to="/student" replace />;
  return children;
}

function AppRoutes() {
  const { user, role } = useAuth();
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={role === 'teacher' ? '/teacher' : '/student'} replace /> : <Login />
      } />
      <Route path="/student/*" element={
        <ProtectedStudentRoute><StudentApp /></ProtectedStudentRoute>
      } />
      <Route path="/teacher/*" element={
        <ProtectedTeacherRoute><TeacherApp /></ProtectedTeacherRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <AppRoutes />
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
