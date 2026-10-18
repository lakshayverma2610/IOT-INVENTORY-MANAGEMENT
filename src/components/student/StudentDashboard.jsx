import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import {
  Package,
  ClipboardList,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(req) {
  return req.status === 'approved' && req.returnDate && !req.returnedAt && new Date(req.returnDate) < new Date();
}

function daysDiff(returnDate) {
  if (!returnDate) return 0;
  return Math.ceil((new Date(returnDate) - new Date()) / 86400000);
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStudentRequests, getItemById, items } = useInventory();

  const [selectedRequest, setSelectedRequest] = useState(null);

  const myRequests = getStudentRequests(user?.id || user?.urn);
  const activeIssued = myRequests.filter(r => r.status === 'approved' && !r.returnedAt);
  const pending = myRequests.filter(r => r.status === 'pending');
  const overdue = myRequests.filter(isOverdue);

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium">Welcome back,</p>
          <h2 className="text-2xl font-bold mt-0.5">{user.name}</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-medium">{user.course}</span>
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-medium">Semester {user.semester}</span>
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-medium">Section {user.section}</span>
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-mono font-medium">{user.rollNo}</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Items Available"
          value={items.filter(i => i.availableStock > 0).length}
          subtitle={`of ${items.length} total items in lab`}
          icon={Package}
          color="blue"
          onClick={() => navigate('/student/catalog')}
        />
        <StatCard
          title="Currently Issued"
          value={activeIssued.length}
          subtitle="items in your possession"
          icon={CheckCircle}
          color="emerald"
          onClick={() => navigate('/student/requests')}
        />
        <StatCard
          title="Pending Requests"
          value={pending.length}
          subtitle="awaiting teacher approval"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/student/requests')}
        />
        <StatCard
          title="Overdue Items"
          value={overdue.length}
          subtitle={overdue.length > 0 ? "please return immediately" : "no overdue components"}
          icon={ClipboardList}
          color={overdue.length > 0 ? 'red' : 'slate'}
          onClick={() => navigate('/student/requests')}
        />
      </div>

      {/* Currently Issued Items List */}
      {activeIssued.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800">Currently Issued Items</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any item to inspect return schedule and instructions</p>
            </div>
            <button
              onClick={() => navigate('/student/requests')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              My Requests Ledger <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {activeIssued.map(req => {
              const item = getItemById(req.itemId);
              const od = isOverdue(req);
              const diff = daysDiff(req.returnDate);

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 transition-colors cursor-pointer group gap-2 ${
                    od ? 'bg-red-50/40 hover:bg-red-50/80' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${od ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="font-medium text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                        {item?.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Qty: {req.quantity} · Issued on {formatDate(req.approvedAt)} · Purpose: {req.purpose}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      {od ? (
                        <Badge variant="overdue">OVERDUE ({Math.abs(diff)}d)</Badge>
                      ) : (
                        <Badge variant="success">Active ({diff}d left)</Badge>
                      )}
                      <p className="text-xs text-slate-400 mt-1">Due: {formatDate(req.returnDate)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800">Recent Requests</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any request to view details</p>
          </div>
          <button
            onClick={() => navigate('/student/requests')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
          >
            All Requests ({myRequests.length}) <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {myRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <p>You have not submitted any component requisitions yet.</p>
            <button
              onClick={() => navigate('/student/catalog')}
              className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Browse Available Components
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myRequests.slice(0, 5).map(req => {
              const item = getItemById(req.itemId);
              const statusMap = { pending: 'warning', approved: 'success', rejected: 'danger' };
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                      {item?.name || 'Unknown Item'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Qty: {req.quantity} · Requested: {formatDate(req.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusMap[req.status]}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item & Request Details Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Requisition Details"
        size="md"
      >
        {selectedRequest && (() => {
          const item = getItemById(selectedRequest.itemId);
          const od = isOverdue(selectedRequest);
          const diff = daysDiff(selectedRequest.returnDate);

          return (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800">{item?.name || 'Item'}</h4>
                    <span className="text-xs text-slate-400">{item?.category} · Type: {item?.type}</span>
                  </div>
                  <Badge variant={od ? 'overdue' : selectedRequest.status === 'approved' ? 'success' : selectedRequest.status === 'pending' ? 'warning' : 'danger'}>
                    {od ? 'OVERDUE' : selectedRequest.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-200/60">
                  <div><span className="text-slate-400 block">Quantity</span> <span className="font-semibold">{selectedRequest.quantity} unit(s)</span></div>
                  <div><span className="text-slate-400 block">Requested Date</span> <span>{formatDate(selectedRequest.requestedAt)}</span></div>
                  {selectedRequest.approvedAt && (
                    <div><span className="text-slate-400 block">Approved Date</span> <span>{formatDate(selectedRequest.approvedAt)}</span></div>
                  )}
                  {selectedRequest.returnDate && (
                    <div>
                      <span className="text-slate-400 block">Due Return Date</span>
                      <span className={od ? 'text-red-600 font-semibold' : 'text-slate-800'}>
                        {formatDate(selectedRequest.returnDate)} {od ? `(${Math.abs(diff)}d overdue)` : `(${diff}d left)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Your Stated Purpose</p>
                <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded-xl p-3">
                  {selectedRequest.purpose}
                </p>
              </div>

              {selectedRequest.teacherNote && (
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-800">
                  <p className="font-semibold flex items-center gap-1 mb-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Instructor Feedback / Note:
                  </p>
                  <p>{selectedRequest.teacherNote}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    navigate('/student/requests');
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  Open in My Requests <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
