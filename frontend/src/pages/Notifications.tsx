import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { Send, Mail, MessageSquare, History } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const { t } = useLang();
  const [residents, setResidents] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [filterBuilding, setFilterBuilding] = useState('');
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState({ type: 'EMAIL', message: '', residentIds: [] as number[], selectAll: false });

  useEffect(() => {
    api.get('/residents').then((r) => setResidents(r.data));
    api.get('/buildings').then((r) => setBuildings(r.data));
    api.get('/notifications').then((r) => setLogs(r.data));
  }, []);

  useEffect(() => { api.get(`/notifications${filterBuilding ? `?buildingId=${filterBuilding}` : ''}`).then((r) => setLogs(r.data)); }, [filterBuilding]);

  const filteredResidents = filterBuilding ? residents.filter((r) => r.buildingId === Number(filterBuilding)) : residents;

  const toggleResident = (id: number) => {
    setSendForm((prev) => ({
      ...prev,
      residentIds: prev.residentIds.includes(id) ? prev.residentIds.filter((x) => x !== id) : [...prev.residentIds, id],
    }));
  };

  const handleSend = async () => {
    const ids = sendForm.selectAll ? filteredResidents.map((r) => r.id) : sendForm.residentIds;
    if (ids.length === 0) return alert('Sélectionnez au moins un résident');
    if (!sendForm.message.trim()) return alert('Message requis');
    const res = await api.post('/notifications/send', { residentIds: ids, type: sendForm.type, message: sendForm.message });
    alert(`${res.data.count} notification(s) envoyée(s)`);
    setShowSend(false);
    setSendForm({ type: 'EMAIL', message: '', residentIds: [], selectAll: false });
    api.get('/notifications').then((r) => setLogs(r.data));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('notifications.title')}</h1>
        <button onClick={() => setShowSend(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Send className="w-4 h-4" /> {t('notifications.send')}
        </button>
      </div>

      <div className="mb-4">
        {user?.role === 'ADMIN' && (
          <select value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm">
            <option value="">{t('common.all')} {t('common.buildings')}</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Résident</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Message</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Envoyé par</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit ${log.type === 'EMAIL' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'}`}>
                    {log.type === 'EMAIL' ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{log.resident?.firstName} {log.resident?.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{log.message}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{log.user?.name}</td>
                <td className="px-4 py-3"><span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">{log.status}</span></td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">{t('common.noNotification')}</td></tr>}
          </tbody>
        </table>
      </div>

      {showSend && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowSend(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('notifications.send')}</h2>
            <div className="space-y-3">
              <select value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none">
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
              {user?.role === 'ADMIN' && (
                <select value={filterBuilding} onChange={(e) => { setFilterBuilding(e.target.value); setSendForm({ ...sendForm, residentIds: [] }); }}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none">
                  <option value="">{t('common.all')} {t('common.buildings')}</option>
                  {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={sendForm.selectAll} onChange={(e) => setSendForm({ ...sendForm, selectAll: e.target.checked, residentIds: [] })} className="accent-indigo-600" />
                {t('notifications.selectAll')}
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                {filteredResidents.map((r) => (
                  <label key={r.id} className={`flex items-center gap-2 p-1.5 rounded text-sm cursor-pointer ${sendForm.residentIds.includes(r.id) ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <input type="checkbox" checked={sendForm.residentIds.includes(r.id)} onChange={() => toggleResident(r.id)} className="accent-indigo-600" />
                    <span className="text-gray-700 dark:text-gray-300">{r.firstName} {r.lastName} - {r.apartment}</span>
                  </label>
                ))}
              </div>
              <textarea value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} placeholder={t('notifications.yourMessage')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSend(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">{t('common.cancel')}</button>
              <button onClick={handleSend} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">{t('common.send')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
