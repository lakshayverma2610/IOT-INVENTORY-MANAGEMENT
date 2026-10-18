import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import Badge from '../ui/Badge';
import { Search, ArrowUpDown } from 'lucide-react';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysInfo(returnDate, returnedAt) {
  if (returnedAt) return null;
  if (!returnDate) return null;
  const diff = Math.ceil((new Date(returnDate) - new Date()) / 86400000);
  return diff;
}

export default function IssuedItems() {
  const { requests, getItemById, getStudentById, markReturned } = useInventory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('returnDate');
  const [sortDir, setSortDir] = useState('asc');

  const issuedReqs = requests.filter(r => r.status === 'approved');

  const filtered = issuedReqs.filter(req => {
    const item = getItemById(req.itemId);
    const student = getStudentById(req.studentId) || {
      name: req.studentName || 'Student',
      rollNo: req.studentUrn || req.studentId,
      course: req.studentCourse || 'B.Tech',
      semester: req.studentSemester || 1,
      section: req.studentSection || 'A',
    };
    const matchSearch = search === '' ||
      item?.name.toLowerCase().includes(search.toLowerCase()) ||
      student?.name.toLowerCase().includes(search.toLowerCase()) ||
      student?.rollNo.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'active') return matchSearch && !req.returnedAt;
    if (statusFilter === 'returned') return matchSearch && !!req.returnedAt;
    if (statusFilter === 'overdue') return matchSearch && !req.returnedAt && req.returnDate && new Date(req.returnDate) < new Date();
    return matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va, vb;
    if (sortBy === 'returnDate') { va = a.returnDate || ''; vb = b.returnDate || ''; }
    else if (sortBy === 'student') { va = getStudentById(a.studentId)?.name || ''; vb = getStudentById(b.studentId)?.name || ''; }
    else if (sortBy === 'item') { va = getItemById(a.itemId)?.name || ''; vb = getItemById(b.itemId)?.name || ''; }
    else { va = ''; vb = ''; }
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const overdueCount = issuedReqs.filter(r => !r.returnedAt && r.returnDate && new Date(r.returnDate) < new Date()).length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or item..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white" />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'active', label: `Active (${issuedReqs.filter(r => !r.returnedAt).length})` },
            { key: 'overdue', label: `Overdue (${overdueCount})` },
            { key: 'returned', label: `Returned (${issuedReqs.filter(r => r.returnedAt).length})` },
            { key: 'all', label: 'All' },
          ].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${statusFilter === f.key ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {[
                  { key: 'item', label: 'Component' },
                  { key: 'student', label: 'Student' },
                ].map(col => (
                  <th key={col.key} className="text-left px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort(col.key)}>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {col.label} <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Course Info</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Qty</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('returnDate')}>
                  <div className="flex items-center justify-center gap-1">Return Date <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map(req => {
                const item = getItemById(req.itemId);
                const student = getStudentById(req.studentId);
                const od = !req.returnedAt && req.returnDate && new Date(req.returnDate) < new Date();
                const dl = daysInfo(req.returnDate, req.returnedAt);

                return (
                  <tr key={req.id} className={`hover:bg-slate-50/50 transition-colors ${od ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 text-sm">{item?.name}</p>
                      <p className="text-xs text-slate-400">{item?.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 text-sm">{student?.name}</p>
                      <p className="text-xs text-slate-400">{student?.rollNo}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-xs text-slate-600">{student?.course}</p>
                      <p className="text-xs text-slate-400">Sem {student?.semester} · Sec {student?.section}</p>
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-slate-700">{req.quantity}</td>
                    <td className="px-4 py-4 text-center">
                      <p className={`text-xs font-medium ${od ? 'text-red-600' : dl !== null && dl <= 3 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {formatDate(req.returnDate)}
                      </p>
                      {dl !== null && (
                        <p className={`text-xs ${od ? 'text-red-500' : dl <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                          {od ? `${Math.abs(dl)}d overdue` : `${dl}d left`}
                        </p>
                      )}
                      {req.returnedAt && <p className="text-xs text-emerald-500">Returned {formatDate(req.returnedAt)}</p>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {req.returnedAt ? (
                        <Badge variant="info">Returned</Badge>
                      ) : od ? (
                        <Badge variant="overdue">OVERDUE</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!req.returnedAt && (
                        <button
                          onClick={() => markReturned(req.id)}
                          className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors px-3 py-1.5 hover:bg-blue-50 rounded-lg"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">No records found</div>
          )}
        </div>
      </div>
    </div>
  );
}
