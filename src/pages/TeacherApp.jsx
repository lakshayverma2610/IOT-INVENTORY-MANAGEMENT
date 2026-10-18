import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import TeacherDashboard from '../components/teacher/TeacherDashboard';
import RequestsPanel from '../components/teacher/RequestsPanel';
import InventoryManager from '../components/teacher/InventoryManager';
import IssuedItems from '../components/teacher/IssuedItems';

const titles = {
  '/teacher': { title: 'Dashboard', subtitle: 'IoT Lab inventory overview' },
  '/teacher/requests': { title: 'Component Requests', subtitle: 'Review and manage student requests' },
  '/teacher/inventory': { title: 'Inventory Management', subtitle: 'Manage lab components and stock' },
  '/teacher/issued': { title: 'Issued Items', subtitle: 'Track all issued components' },
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

export default function TeacherApp() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 overflow-hidden">
        <Routes>
          <Route path="/" element={<PageWrapper path="/teacher"><TeacherDashboard /></PageWrapper>} />
          <Route path="/requests" element={<PageWrapper path="/teacher/requests"><RequestsPanel /></PageWrapper>} />
          <Route path="/inventory" element={<PageWrapper path="/teacher/inventory"><InventoryManager /></PageWrapper>} />
          <Route path="/issued" element={<PageWrapper path="/teacher/issued"><IssuedItems /></PageWrapper>} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </div>
    </div>
  );
}
