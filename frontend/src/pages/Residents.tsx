import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Search, Phone, Mail } from 'lucide-react';

export default function Residents() {
  const { user } = useAuth();
  const [residents, setResidents] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingFilter, setBuildingFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ buildingId: 0, firstName: '', lastName: '', apartment: '', phone: '', email: '' });

  const load = () => {
    const params = new URLSearchParams();
    if (buildingFilter) params.set('buildingId', buildingFilter);
    if (search) params.set('search', search);
    api.get(`/residents?${params}`).then((r) => setResidents(r.data));
  };

  useEffect(() => { load(); }, [buildingFilter, search]);
  useEffect(() => { api.get('/buildings').then((r) => setBuildings(r.data)); }, []);

  const handleSave = async () => {
    if (editing) {
      await api.put(`/residents/${editing.id}`, form);
    } else {
      await api.post('/residents', form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ buildingId: 0, firstName: '', lastName: '', apartment: '', phone: '', email: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce résident ?')) return;
    await api.delete(`/residents/${id}`);
    load();
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ buildingId: r.buildingId, firstName: r.firstName, lastName: r.lastName, apartment: r.apartment, phone: r.phone, email: r.email });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Résidents</h1>
        <button onClick={() => { setEditing(null); setForm({ buildingId: user?.buildingId || 0, firstName: '', lastName: '', apartment: '', phone: '', email: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Nouveau résident
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {user?.role === 'ADMIN' && (
          <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
            <option value="">Tous les bâtiments</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">App.</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prénom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</th>
              {user?.role === 'ADMIN' && <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bâtiment</th>}
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{r.apartment}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.firstName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${r.email}`} className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"><Mail className="w-4 h-4" /></a>
                    <a href={`https://wa.me/${r.phone.replace(/\s/g, '')}`} target="_blank" className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"><Phone className="w-4 h-4" /></a>
                  </div>
                </td>
                {user?.role === 'ADMIN' && <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{r.building?.name}</td>}
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {residents.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">Aucun résident</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editing ? 'Modifier' : 'Nouveau'} résident</h2>
            <div className="space-y-3">
              {user?.role === 'ADMIN' && (
                <select value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none">
                  <option value={0}>Sélectionner un bâtiment</option>
                  {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              <div className="flex gap-3">
                <input placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                <input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <input placeholder="Appartement" value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex gap-3">
                <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
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
