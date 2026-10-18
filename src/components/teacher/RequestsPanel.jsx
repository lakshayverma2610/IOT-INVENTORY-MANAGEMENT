import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReturnDatePicker({ returnDate, setReturnDate }) {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">Return Date</label>
      <input
        type="date"
        value={returnDate}
        min={minDate.toISOString().split('T')[0]}
        onChange={e => setReturnDate(e.target.value)}
        required
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
      />
    </div>
  );
}

export default function RequestsPanel() {
  const { requests, approveRequest, rejectRequest, getItemById, getStudentById, getStudentRequests } = useInventory();
  const [filter, setFilter] = useState('pending');
  const [actionModal, setActionModal] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);

  const handleApprove = (e) => {
    e.preventDefault();
    approveRequest(actionModal.id, returnDate, note);
    setActionModal(null); setReturnDate(''); setNote('');
  };

  const handleReject = () => {
    rejectRequest(actionModal.id, note);
    setActionModal(null); setNote('');
  };

  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
  };

  return (
    <div className="p-8 space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400 text-sm">
          No {filter} requests
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const item = getItemById(req.itemId);
            const student = getStudentById(req.studentId) || {
              name: req.studentName || 'Student',
              rollNo: req.studentUrn || req.studentId,
              course: req.studentCourse || 'B.Tech',
              semester: req.studentSemester || 1,
              section: req.studentSection || 'A',
              email: req.studentEmail || `${req.studentUrn || req.studentId}@iilm.edu`,
            };
            const studentReqs = getStudentRequests(req.studentId).filter(r => r.status === 'approved' && !r.returnedAt && r.id !== req.id);
            const s = statusConfig[req.status] || statusConfig.pending;
            const isExpanded = expanded === req.id;

            return (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{item?.name}</h3>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{req.purpose}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setActionModal({ ...req, action: 'approve' }); setNote(''); setReturnDate(''); }}
                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => { setActionModal({ ...req, action: 'reject' }); setNote(''); }}
                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : req.id)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-slate-400">Quantity</span><p className="font-medium text-slate-700">{req.quantity}</p></div>
                    <div><span className="text-slate-400">Requested</span><p className="font-medium text-slate-700">{formatDate(req.requestedAt)}</p></div>
                    {req.approvedAt && <div><span className="text-slate-400">Approved</span><p className="font-medium text-slate-700">{formatDate(req.approvedAt)}</p></div>}
                    {req.returnDate && <div><span className="text-slate-400">Return By</span><p className="font-medium text-slate-700">{formatDate(req.returnDate)}</p></div>}
                  </div>
                </div>

                {isExpanded && student && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Student Information</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-slate-400">Name</span><p className="font-semibold text-slate-800">{student.name}</p></div>
                        <div><span className="text-slate-400">Roll No.</span><p className="font-medium text-slate-700">{student.rollNo}</p></div>
                        <div><span className="text-slate-400">Course</span><p className="font-medium text-slate-700">{student.course}</p></div>
                        <div><span className="text-slate-400">Semester</span><p className="font-medium text-slate-700">Semester {student.semester}</p></div>
                        <div><span className="text-slate-400">Section</span><p className="font-medium text-slate-700">Section {student.section}</p></div>
                        <div><span className="text-slate-400">Email</span><p className="font-medium text-slate-700">{student.email}</p></div>
                      </div>
                    </div>
                    {studentReqs.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Currently Issued to This Student</p>
                        <div className="space-y-1">
                          {studentReqs.map(sr => {
                            const srItem = getItemById(sr.itemId);
                            const od = sr.returnDate && new Date(sr.returnDate) < new Date();
                            return (
                              <div key={sr.id} className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${od ? 'bg-red-50 text-red-700' : 'bg-white border border-slate-100 text-slate-700'}`}>
                                <span>{srItem?.name} (Qty: {sr.quantity})</span>
                                <span>Return: {formatDate(sr.returnDate)} {od ? '· OVERDUE' : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {req.teacherNote && (
                      <div className={`text-xs px-3 py-2 rounded-lg ${req.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <span className="font-medium">Note:</span> {req.teacherNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Modal */}
      <Modal isOpen={!!actionModal && actionModal.action === 'approve'} onClose={() => setActionModal(null)} title="Approve Request">
        {actionModal && (
          <form onSubmit={handleApprove} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-slate-800">{getItemById(actionModal.itemId)?.name}</p>
              <p className="text-slate-500 text-xs mt-1">Requested by: {getStudentById(actionModal.studentId)?.name} · Qty: {actionModal.quantity}</p>
            </div>
            <ReturnDatePicker returnDate={returnDate} setReturnDate={setReturnDate} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Note to Student (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Any special instructions..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setActionModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Approve Request</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!actionModal && actionModal.action === 'reject'} onClose={() => setActionModal(null)} title="Reject Request">
        {actionModal && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4 text-sm border border-red-100">
              <p className="font-medium text-slate-800">{getItemById(actionModal.itemId)?.name}</p>
              <p className="text-slate-500 text-xs mt-1">Requested by: {getStudentById(actionModal.studentId)?.name} · Qty: {actionModal.quantity}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Rejection</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Provide a reason to help the student understand..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-300 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setActionModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleReject} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Reject Request</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
