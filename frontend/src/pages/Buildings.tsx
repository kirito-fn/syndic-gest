import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Building2, Users as UsersIcon, Upload, X } from 'lucide-react';

export default function Buildings() {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', address: '' });
  const [importing, setImporting] = useState(false);
  const [importBuildingId, setImportBuildingId] = useState<number | null>(null);

  useEffect(() => { api.get('/buildings').then((r) => setBuildings(r.data)); }, []);

  const handleSave = async () => {
    if (editing) {
      const res = await api.put(`/buildings/${editing.id}`, form);
      setBuildings(buildings.map((b) => (b.id === editing.id ? res.data : b)));
    } else {
      const res = await api.post('/buildings', form);
      setBuildings([...buildings, res.data]);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', address: '' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce bâtiment ? Tous les résidents, paiements et charges seront supprimés.')) return;
    await api.delete(`/buildings/${id}`);
    setBuildings(buildings.filter((b) => b.id !== id));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importBuildingId) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('buildingId', String(importBuildingId));
    const res = await api.post('/residents/import', formData);
    alert(`${res.data.count} résidents importés`);
    setImporting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bâtiments</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={() => { setEditing(null); setForm({ name: '', address: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Nouveau bâtiment
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {buildings.map((b) => (
          <div key={b.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{b.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{b.address}</p>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(b); setForm({ name: b.name, address: b.address }); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <UsersIcon className="w-4 h-4" /> {b._count?.residents || 0} résidents
            </div>
            {b.users?.[0] && <p className="text-xs text-gray-400 dark:text-gray-500">Gestionnaire: {b.users[0].name}</p>}
            {user?.role === 'ADMIN' && (
              <button onClick={() => { setImportBuildingId(b.id); setImporting(true); }}
                className="mt-3 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                <Upload className="w-4 h-4" /> Importer Excel
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{editing ? 'Modifier' : 'Nouveau'} bâtiment</h2>
            <div className="space-y-3">
              <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <input placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Annuler</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {importing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setImporting(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Importer des résidents</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Format: Prénom, Nom, Appartement, Téléphone, Email (colonnes A-E)</p>
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="mb-4 text-sm text-gray-700 dark:text-gray-300" />
            <button onClick={() => setImporting(false)} className="w-full py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
