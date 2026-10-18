import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const categories = ['Microcontroller','Sensor','Communication','Display','Motors & Actuators','Power','Tools','Test Equipment','Drone / UAV','Electronics','Accessories','Prototyping','Cables','Structural','Soldering','Other'];
const emptyItem = { name: '', category: 'Sensor', type: 'non-consumable', totalStock: 1, availableStock: 1, vendor: '', folio: '', billNo: '', date: '', gst: 18, unitPrice: 0, totalAmount: 0 };

export default function InventoryManager() {
  const { items, updateItem, addItem, deleteItem } = useInventory();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('non-consumable');
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const typeItems = items.filter(i => i.type === typeFilter);
  const filtered = typeItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.vendor || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item) => { setEditModal(item); setForm({ ...item }); };
  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateItem(editModal.id, { ...form, totalStock: Number(form.totalStock), availableStock: Number(form.availableStock) });
    setEditModal(null);
  };
  const handleAdd = (e) => {
    e.preventDefault();
    addItem({ ...form, totalStock: Number(form.totalStock), availableStock: Number(form.availableStock) });
    setAddModal(false);
    setForm({ ...emptyItem, type: typeFilter });
  };

  const stockLevel = (item) => {
    const pct = item.availableStock / item.totalStock;
    if (pct === 0) return 'danger';
    if (pct <= 0.25) return 'warning';
    return 'success';
  };

  const FormFields = ({ f, setF }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
        <input value={f.name} onChange={e => setF({...f, name: e.target.value})} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <select value={f.category} onChange={e => setF({...f, category: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
          <select value={f.type} onChange={e => setF({...f, type: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
            <option value="non-consumable">Non-Consumable</option>
            <option value="consumable">Consumable</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Stock</label>
          <input type="number" min={0} value={f.totalStock} onChange={e => setF({...f, totalStock: e.target.value})} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Available Stock</label>
          <input type="number" min={0} value={f.availableStock} onChange={e => setF({...f, availableStock: e.target.value})} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor</label>
          <input value={f.vendor || ''} onChange={e => setF({...f, vendor: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bill No.</label>
          <input value={f.billNo || ''} onChange={e => setF({...f, billNo: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Folio</label>
          <input value={f.folio || ''} onChange={e => setF({...f, folio: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
          <input value={f.date || ''} onChange={e => setF({...f, date: e.target.value})} placeholder="DD/MM/YY" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>
      </div>
      {f.type === 'consumable' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Price (Rs.)</label>
            <input type="number" min={0} value={f.unitPrice || 0} onChange={e => setF({...f, unitPrice: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">GST %</label>
            <input type="number" min={0} value={f.gst || 18} onChange={e => setF({...f, gst: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Type tabs */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {['non-consumable', 'consumable'].map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setSearch(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              typeFilter === t ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {t === 'non-consumable' ? 'Non-Consumables' : 'Consumables'} ({items.filter(i=>i.type===t).length})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, vendor, category..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white" />
        </div>
        <button onClick={() => { setAddModal(true); setForm({...emptyItem, type: typeFilter}); }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 w-10">Sno.</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Item Name</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Vendor</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Folio</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Bill</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Available</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{item.sno}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 text-sm leading-tight">{item.name}</p>
                    {item.type === 'consumable' && item.unitPrice > 0 && (
                      <p className="text-xs text-slate-400">Rs. {item.unitPrice}/unit</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{item.vendor}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono hidden lg:table-cell">{item.folio}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono hidden lg:table-cell">{item.billNo}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.totalStock}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.availableStock}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={stockLevel(item)}>
                      {item.availableStock === 0 ? 'Out of Stock' : item.availableStock <= Math.ceil(item.totalStock * 0.25) ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-slate-400 hover:text-blue-500">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(item)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">No items found</div>}
        </div>
      </div>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Item" size="lg">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormFields f={form} setF={setForm} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Item" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormFields f={form} setF={setForm} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Add Item</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">Remove <span className="font-semibold text-slate-800">{deleteConfirm.name}</span> from inventory?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { deleteItem(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
