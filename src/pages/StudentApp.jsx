import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StudentDashboard from '../components/student/StudentDashboard';
import ItemCatalog from '../components/student/ItemCatalog';
import MyRequests from '../components/student/MyRequests';

const titles = {
  '/student': { title: 'Dashboard', subtitle: 'Welcome to IoT Lab Inventory' },
  '/student/catalog': { title: 'Available Items', subtitle: 'Browse and request lab components' },
  '/student/requests': { title: 'My Requests', subtitle: 'Track your component requests' },
};

function PageWrapper({ path, children }) {
  const t = titles[path] || { title: 'IoT Lab', subtitle: '' };
  return (
    <>
      <Header title={t.title} subtitle={t.subtitle} />
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        {children}
      </main>
    </>
  );
}

export default function StudentApp() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 overflow-hidden">
        <Routes>
          <Route path="/" element={<PageWrapper path="/student"><StudentDashboard /></PageWrapper>} />
          <Route path="/catalog" element={<PageWrapper path="/student/catalog"><ItemCatalog /></PageWrapper>} />
          <Route path="/requests" element={<PageWrapper path="/student/requests"><MyRequests /></PageWrapper>} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </div>
    </div>
  );
}
