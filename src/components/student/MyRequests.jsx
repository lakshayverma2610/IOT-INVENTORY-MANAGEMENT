import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import Badge from '../ui/Badge';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(req) {
  return req.status === 'approved' && req.returnDate && !req.returnedAt && new Date(req.returnDate) < new Date();
}

function daysLeft(returnDate) {
  if (!returnDate) return null;
  const diff = Math.ceil((new Date(returnDate) - new Date()) / 86400000);
  return diff;
}

export default function MyRequests() {
  const { user } = useAuth();
  const { getStudentRequests, getItemById } = useInventory();
  const requests = getStudentRequests(user?.id || user?.urn);

  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{requests.length} total requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-slate-400 font-medium">No requests yet</p>
          <p className="text-slate-300 text-sm mt-1">Go to Available Items to request components</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const item = getItemById(req.itemId);
            const od = isOverdue(req);
            const dl = daysLeft(req.returnDate);
            const s = statusConfig[req.status] || statusConfig.pending;

            return (
              <div key={req.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${od ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{item?.name || 'Unknown Item'}</h3>
                      <Badge variant={od ? 'overdue' : s.variant}>{od ? 'OVERDUE' : s.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{req.purpose}</p>
                  </div>
                  <div className="text-right text-sm flex-shrink-0">
                    <p className="text-slate-400 text-xs">Qty: <span className="text-slate-700 font-medium">{req.quantity}</span></p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Requested</p>
                    <p className="text-xs font-medium text-slate-700">{formatDate(req.requestedAt)}</p>
                  </div>
                  {req.approvedAt && (
                    <div>
                      <p className="text-xs text-slate-400">Approved</p>
                      <p className="text-xs font-medium text-slate-700">{formatDate(req.approvedAt)}</p>
                    </div>
                  )}
                  {req.returnDate && (
                    <div>
                      <p className="text-xs text-slate-400">Return By</p>
                      <p className={`text-xs font-medium ${od ? 'text-red-600' : dl <= 3 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {formatDate(req.returnDate)}
                        {dl !== null && !req.returnedAt && (
                          <span className="ml-1">({od ? `${Math.abs(dl)}d overdue` : `${dl}d left`})</span>
                        )}
                      </p>
                    </div>
                  )}
                  {req.returnedAt && (
                    <div>
                      <p className="text-xs text-slate-400">Returned</p>
                      <p className="text-xs font-medium text-emerald-600">{formatDate(req.returnedAt)}</p>
                    </div>
                  )}
                </div>

                {req.teacherNote && (
                  <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${req.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                    <span className="font-medium">Instructor note:</span> {req.teacherNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
