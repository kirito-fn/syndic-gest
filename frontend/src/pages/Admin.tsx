import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Download, Users, Shield } from 'lucide-react';

export default function Admin() {
  const [managers, setManagers] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', buildingId: 0 });
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportBuilding, setExportBuilding] = useState('');

  useEffect(() => {
    api.get('/admin/managers').then((r) => setManagers(r.data));
    api.get('/buildings').then((r) => setBuildings(r.data));
  }, []);

  const loadManagers = () => api.get('/admin/managers').then((r) => setManagers(r.data));

  const handleSave = async () => {
    if (editing) {
      await api.put(`/admin/managers/${editing.id}`, form);
    } else {
      if (!form.password) return alert('Mot de passe requis');
      await api.post('/admin/managers', form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', email: '', password: '', buildingId: 0 });
    loadManagers();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce gestionnaire ?')) return;
    await api.delete(`/admin/managers/${id}`);
    loadManagers();
  };

  const handleExport = async () => {
    const params = new URLSearchParams({ month: String(exportMonth), year: String(exportYear) });
    if (exportBuilding) params.set('buildingId', exportBuilding);
    const res = await api.get(`/admin/export?${params}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${exportMonth}-${exportYear}.xlsx`;
    a.click();
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Administration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Gestionnaires</h2>
            </div>
            <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', buildingId: 0 }); setShowModal(true); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {managers.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{m.email}</p>
                  {m.building && <p className="text-xs text-indigo-500 dark:text-indigo-400">Bâtiment: {m.building.name}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(m); setForm({ name: m.name, email: m.email, password: '', buildingId: m.buildingId || 0 }); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {managers.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Aucun gestionnaire</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Export Excel</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Télécharger le rapport mensuel des paiements</p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <select value={exportMonth} onChange={(e) => setExportMonth(Number(e.target.value))}
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
                {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
              </select>
              <select value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))}
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <select value={exportBuilding} onChange={(e) => setExportBuilding(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
              <option value="">Tous les bâtiments</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button onClick={handleExport} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Download className="w-4 h-4 inline mr-2" /> Télécharger le rapport
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editing ? 'Modifier' : 'Nouveau'} gestionnaire</h2>
            <div className="space-y-3">
              <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <input placeholder={editing ? 'Nouveau mot de passe (laisser vide)' : 'Mot de passe'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <select value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none">
                <option value={0}>Aucun bâtiment</option>
                {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
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
