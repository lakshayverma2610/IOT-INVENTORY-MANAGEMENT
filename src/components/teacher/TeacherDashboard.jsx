import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Card3D from '../ui/Card3D';
import {
  Package,
  ClipboardCheck,
  PackageCheck,
  AlertTriangle,
  Search,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Box,
  Layers,
  X
} from 'lucide-react';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(req) {
  return req.status === 'approved' && req.returnDate && !req.returnedAt && new Date(req.returnDate) < new Date();
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { items, requests, getItemById, getStudentById } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  const pending = requests.filter(r => r.status === 'pending');
  const activeIssued = requests.filter(r => r.status === 'approved' && !r.returnedAt);
  const overdue = requests.filter(isOverdue);
  const lowStock = items.filter(i => i.availableStock <= 3);

  // Group items by category with rich metadata
  const categoryStats = items.reduce((acc, i) => {
    if (!acc[i.category]) {
      acc[i.category] = {
        name: i.category,
        totalItems: 0,
        totalUnits: 0,
        availableUnits: 0,
        nonConsumables: 0,
        consumables: 0,
      };
    }
    acc[i.category].totalItems += 1;
    acc[i.category].totalUnits += i.totalStock;
    acc[i.category].availableUnits += i.availableStock;
    if (i.type === 'consumable') {
      acc[i.category].consumables += 1;
    } else {
      acc[i.category].nonConsumables += 1;
    }
    return acc;
  }, {});

  const categoryList = Object.values(categoryStats).sort((a, b) => b.totalItems - a.totalItems);

  // Filtered items when a category is selected in the fullscreen card
  const categoryFilteredItems = selectedCategory
    ? items
        .filter(i => i.category === selectedCategory)
        .filter(i =>
          i.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
          (i.vendor || '').toLowerCase().includes(categorySearch.toLowerCase()) ||
          String(i.billNo || '').toLowerCase().includes(categorySearch.toLowerCase()) ||
          String(i.folio || '').toLowerCase().includes(categorySearch.toLowerCase())
        )
    : [];

  const stockBadge = (item) => {
    if (item.availableStock === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (item.availableStock <= Math.ceil(item.totalStock * 0.25)) return <Badge variant="warning">{item.availableStock} Left (Low)</Badge>;
    return <Badge variant="success">{item.availableStock} Available</Badge>;
  };

  return (
    <div className="p-8 space-y-8">
      {/* 1. TOP STAT CARDS (Clickable and interactive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Components"
          value={items.length}
          subtitle={`${items.reduce((a, i) => a + i.totalStock, 0)} total units in lab`}
          icon={Package}
          color="blue"
          onClick={() => navigate('/teacher/inventory')}
        />
        <StatCard
          title="Pending Requests"
          value={pending.length}
          subtitle="awaiting your review"
          icon={ClipboardCheck}
          color="amber"
          onClick={() => navigate('/teacher/requests')}
        />
        <StatCard
          title="Active Issues"
          value={activeIssued.length}
          subtitle="currently with students"
          icon={PackageCheck}
          color="emerald"
          onClick={() => navigate('/teacher/issued')}
        />
        <StatCard
          title="Overdue Items"
          value={overdue.length}
          subtitle={overdue.length > 0 ? "action required" : "all returns on time"}
          icon={AlertTriangle}
          color={overdue.length > 0 ? 'red' : 'slate'}
          onClick={() => navigate('/teacher/issued')}
        />
      </div>

      {/* 2. INVENTORY BY CATEGORY (Moved ABOVE Pending Requests & fully clickable) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-800 text-lg">Inventory by Category</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any category card to open the fullscreen component ledger with search and stock inspection.
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/inventory')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors w-fit"
          >
            Manage All Inventory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clickable category cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categoryList.map(cat => (
            <Card3D
              key={cat.name}
              intensity={7}
              className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 text-center cursor-pointer transition-all hover:shadow-md group relative"
            >
              <div
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setCategorySearch('');
                }}
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Box className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {cat.totalItems}
                  </p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5 truncate title-cat" title={cat.name}>
                    {cat.name}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{cat.availableUnits} avail</span>
                  <span className="text-blue-500 font-semibold group-hover:underline flex items-center gap-0.5">
                    View <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>

      {/* 3. OVERDUE ITEMS (Moved BELOW Inventory by Category) */}
      <div className={`bg-white rounded-2xl border ${overdue.length > 0 ? 'border-red-200' : 'border-slate-100'} shadow-sm overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${overdue.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            <h3 className="font-semibold text-slate-800">Overdue Items Ledger</h3>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={overdue.length > 0 ? 'overdue' : 'success'}>
              {overdue.length} overdue
            </Badge>
            <button
              onClick={() => navigate('/teacher/issued')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              Open Issued Items <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {overdue.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No items are currently overdue. All student returns are on schedule.
          </div>
        ) : (
          <div className="divide-y divide-red-100/60">
            {overdue.map(req => {
              const item = getItemById(req.itemId);
              const student = getStudentById(req.studentId) || {
                name: req.studentName || 'Student',
                rollNo: req.studentUrn || req.studentId,
                course: req.studentCourse || 'B.Tech',
                semester: req.studentSemester || 1,
                section: req.studentSection || 'A',
              };
              const daysOd = Math.ceil((new Date() - new Date(req.returnDate)) / 86400000);

              return (
                <div
                  key={req.id}
                  onClick={() => navigate('/teacher/issued')}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50/30 hover:bg-red-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm group-hover:text-red-700 transition-colors">
                          {item?.name || 'Unknown Item'}
                        </p>
                        <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          Qty: {req.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Issued to <span className="font-semibold text-slate-800">{student?.name}</span> ({student?.rollNo})
                        {' · '}{student?.course} (Sem {student?.semester}, Sec {student?.section})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <Badge variant="overdue">{daysOd} days overdue</Badge>
                      <p className="text-xs text-slate-400 mt-1">Due Date: {formatDate(req.returnDate)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/teacher/issued');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      Resolve Return
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. QUICK ACTION GRID: PENDING REQUESTS & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Quick View */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-800">Pending Requests</h3>
            </div>
            <button
              onClick={() => navigate('/teacher/requests')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              View All ({pending.length}) <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {pending.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm my-auto">
              No pending requests. All student requisitions have been processed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {pending.slice(0, 5).map(req => {
                const item = getItemById(req.itemId);
                const student = getStudentById(req.studentId) || {
                  name: req.studentName || 'Student',
                  rollNo: req.studentUrn || req.studentId,
                  course: req.studentCourse || 'B.Tech',
                  semester: req.studentSemester || 1,
                  section: req.studentSection || 'A',
                };
                return (
                  <div
                    key={req.id}
                    onClick={() => navigate('/teacher/requests')}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                        {item?.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {student?.name} · {student?.course} · Sem {student?.semester} · Sec {student?.section}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        Qty: {req.quantity}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {pending.length > 5 && (
            <div
              onClick={() => navigate('/teacher/requests')}
              className="px-6 py-3 text-xs text-blue-600 font-medium text-center bg-blue-50/50 hover:bg-blue-50 cursor-pointer border-t border-slate-100 transition-colors"
            >
              +{pending.length - 5} more pending requests · Click to review
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-800">Low Stock Alert</h3>
            </div>
            <button
              onClick={() => navigate('/teacher/inventory')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              Inventory Manager <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm my-auto">
              All items in Room B2-105 have sufficient stock levels.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {lowStock.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCategory(item.category);
                    setCategorySearch(item.name);
                  }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.category} · Vendor: {item.vendor || 'Lab Stock'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.availableStock === 0 ? 'danger' : 'warning'}>
                      {item.availableStock === 0 ? 'Out of stock' : `${item.availableStock} / ${item.totalStock} left`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lowStock.length > 5 && (
            <div
              onClick={() => navigate('/teacher/inventory')}
              className="px-6 py-3 text-xs text-blue-600 font-medium text-center bg-blue-50/50 hover:bg-blue-50 cursor-pointer border-t border-slate-100 transition-colors"
            >
              +{lowStock.length - 5} more low stock items · Click to inspect
            </div>
          )}
        </div>
      </div>

      {/* 5. FULLSCREEN CATEGORY EXPLORER CARD / MODAL WITH LIVE SEARCH */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedCategory}</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                      {items.filter(i => i.category === selectedCategory).length} Items
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Room B2-105 Component Registry · Total Units:{' '}
                    {items.filter(i => i.category === selectedCategory).reduce((a, b) => a + b.totalStock, 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigate('/teacher/inventory');
                    setSelectedCategory(null);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Inventory
                </button>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Search & Filter */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  placeholder={`Search ${selectedCategory} products...`}
                  autoFocus
                  className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {categorySearch && (
                  <button
                    onClick={() => setCategorySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
                {categoryFilteredItems.length} products found
              </div>
            </div>

            {/* Modal Items List - Simple, Clean Product List */}
            <div className="flex-1 overflow-y-auto p-6">
              {categoryFilteredItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-base font-medium">No products match your search</p>
                  <p className="text-xs mt-1">Try a different search term or clear the filter.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {categoryFilteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-400 w-6 text-right flex-shrink-0">
                          {index + 1}.
                        </span>
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {item.availableStock} / {item.totalStock} in stock
                        </span>
                        {item.availableStock === 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : (
                          <Badge variant="success">Available</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {selectedCategory} · {categoryFilteredItems.length} Products
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
