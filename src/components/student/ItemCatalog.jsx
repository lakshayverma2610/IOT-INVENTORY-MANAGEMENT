import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import Card3D from '../ui/Card3D';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { Search, Cpu, Zap, Radio, Monitor, Settings, Battery, Wrench, FlaskConical, Package2, Layers, Wifi } from 'lucide-react';

const categoryIcons = {
  Microcontroller: Cpu,
  Sensor: Zap,
  Communication: Radio,
  Display: Monitor,
  'Motors & Actuators': Settings,
  Power: Battery,
  Tools: Wrench,
  'Test Equipment': FlaskConical,
  'Drone / UAV': Layers,
  Electronics: Cpu,
  Accessories: Package2,
  Prototyping: Layers,
  Cables: Wifi,
  Structural: Package2,
  Soldering: Wrench,
  Other: Package2,
};

export default function ItemCatalog() {
  const { items, addRequest } = useInventory();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('non-consumable');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [success, setSuccess] = useState(false);

  const typeItems = items.filter(i => i.type === typeFilter);
  const categories = ['All', ...Array.from(new Set(typeItems.map(i => i.category))).sort()];

  const filtered = typeItems.filter(i => {
    const matchCat = category === 'All' || i.category === category;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.vendor.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleRequest = (e) => {
    e.preventDefault();
    addRequest({
      studentId: user?.id || user?.urn,
      studentName: user?.name,
      studentUrn: user?.urn || user?.rollNo,
      studentCourse: user?.course,
      studentSemester: user?.semester,
      studentSection: user?.section,
      studentEmail: user?.email,
      itemId: selected.id,
      quantity: qty,
      purpose,
    });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setSelected(null); setPurpose(''); setQty(1); }, 1800);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Type Toggle */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {[
          { key: 'non-consumable', label: 'Non-Consumables', count: items.filter(i=>i.type==='non-consumable').length },
          { key: 'consumable', label: 'Consumables', count: items.filter(i=>i.type==='consumable').length },
        ].map(t => (
          <button key={t.key} onClick={() => { setTypeFilter(t.key); setCategory('All'); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              typeFilter === t.key ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {t.label} <span className={`ml-1 text-xs ${typeFilter === t.key ? 'opacity-80' : 'text-slate-400'}`}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Search + Category */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items or vendor..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                category === cat ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >{cat}</button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} items found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => {
          const Icon = categoryIcons[item.category] || Package2;
          const available = item.availableStock > 0;
          return (
            <Card3D key={item.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" intensity={6}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${available ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  <Icon className={`w-5 h-5 ${available ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
                <Badge variant={available ? 'success' : 'danger'}>
                  {available ? `${item.availableStock} left` : 'Out of stock'}
                </Badge>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{item.name}</h3>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{item.category}</span>
                {item.type === 'consumable' && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Consumable</span>}
              </div>
              <div className="space-y-0.5 mt-2">
                <p className="text-xs text-slate-400">Vendor: <span className="text-slate-600">{item.vendor}</span></p>
                <p className="text-xs text-slate-400">Folio: <span className="text-slate-600">{item.folio}</span> &bull; Bill: <span className="text-slate-600">{item.billNo}</span></p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total: {item.totalStock}</span>
                <button onClick={() => available && setSelected(item)} disabled={!available}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    available ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {available ? 'Request' : 'Unavailable'}
                </button>
              </div>
            </Card3D>
          );
        })}
      </div>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setSuccess(false); }} title="Request Component">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800">Request Submitted</p>
            <p className="text-slate-400 text-sm mt-1">Awaiting instructor approval</p>
          </div>
        ) : selected ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <p className="font-semibold text-slate-800">{selected.name}</p>
                {selected.type === 'consumable' && <Badge variant="warning">Consumable</Badge>}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span>Folio: {selected.folio}</span>
                <span>Bill No: {selected.billNo}</span>
                <span>Date: {selected.date}</span>
                <span>Vendor: {selected.vendor}</span>
                <span className="col-span-2">Available: <span className="text-slate-700 font-medium">{selected.availableStock}</span> of {selected.totalStock}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity Required</label>
              <input type="number" min={1} max={selected.availableStock} value={qty}
                onChange={e => setQty(Number(e.target.value))} required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Purpose / Project Description</label>
              <textarea value={purpose} onChange={e => setPurpose(e.target.value)} required rows={3}
                placeholder="Briefly describe what you need this component for..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setSelected(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Submit Request</button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
