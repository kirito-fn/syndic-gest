import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Charges() {
  const { user } = useAuth();
  const [charges, setCharges] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [filters, setFilters] = useState({ buildingId: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()) });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ buildingId: 0, amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), description: '' });

  const load = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/charges?${params}`).then((r) => setCharges(r.data));
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => { api.get('/buildings').then((r) => setBuildings(r.data)); }, []);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const handleSave = async () => {
    if (editing) {
      await api.put(`/charges/${editing.id}`, form);
    } else {
      await api.post('/charges', form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ buildingId: 0, amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), description: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette charge ?')) return;
    await api.delete(`/charges/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Charges</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={() => { setEditing(null); setForm({ buildingId: 0, amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), description: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Nouvelle charge
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {user?.role === 'ADMIN' && (
          <select value={filters.buildingId} onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
            <option value="">Tous les bâtiments</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
          {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
        </select>
        <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
              {user?.role === 'ADMIN' && <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bâtiment</th>}
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Période</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
              {user?.role === 'ADMIN' && <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {charges.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{c.description}</td>
                {user?.role === 'ADMIN' && <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.building?.name}</td>}
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{monthNames[c.month - 1]} {c.year}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{c.amount.toFixed(2)} €</td>
                {user?.role === 'ADMIN' && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(c); setForm({ buildingId: c.buildingId, amount: c.amount, month: c.month, year: c.year, description: c.description }); setShowModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                )}
              </tr>
            ))}
            {charges.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">Aucune charge</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editing ? 'Modifier' : 'Nouvelle'} charge</h2>
            <div className="space-y-3">
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              {user?.role === 'ADMIN' && (
                <select value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none">
                  <option value={0}>Sélectionner un bâtiment</option>
                  {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              <div className="flex gap-3">
                <input type="number" placeholder="Montant" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none" />
                <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
                  {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
                </select>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
                  {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Annuler</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
