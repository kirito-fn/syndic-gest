import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, CheckCircle, XCircle, Clock, RotateCcw, MessageSquare, Mail, Phone, AlertTriangle } from 'lucide-react';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: '', buildingId: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), search: '' });
  const [showDeclare, setShowDeclare] = useState(false);
  const [declareForm, setDeclareForm] = useState({ residentId: 0, months: [] as number[], year: new Date().getFullYear(), amount: 100, payNow: false });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<any>(null);
  const [statusReason, setStatusReason] = useState('');
  const [showLogs, setShowLogs] = useState<number | null>(null);

  const load = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/payments?${params}`).then((r) => setPayments(r.data));
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => { api.get('/buildings').then((r) => setBuildings(r.data)); }, []);
  useEffect(() => { api.get('/residents').then((r) => setResidents(r.data)); }, []);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { PAID: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', UNPAID: 'bg-red-100 text-red-700' };
    const labels: Record<string, string> = { PAID: 'Payé', PENDING: 'En attente', UNPAID: 'Impayé' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || ''}`}>{labels[status] || status}</span>;
  };

  const handleVerify = async (id: number) => { await api.post(`/payments/${id}/verify`); load(); };
  const handleUnverify = async (id: number) => { await api.post(`/payments/${id}/unverify`); load(); };
  const handleReset = async (id: number, oldStatus: string) => { await api.post(`/payments/${id}/reset`, { oldStatus, reason: 'Réinitialisation manuelle' }); load(); };
  const handleNoPayment = async (id: number) => { await api.post(`/payments/${id}/no-payment`); load(); };
  const handleMarkUnpaid = async (id: number) => { if (!window.confirm('Marquer cet impayé ?')) return; await api.post(`/payments/${id}/mark-unpaid`); load(); };
  const handleStatusChange = async () => {
    if (!statusReason.trim()) return alert('Le motif est obligatoire');
    await api.post(`/payments/${statusTarget.id}/status`, { status: statusTarget.newStatus, reason: statusReason });
    setShowStatusModal(false);
    setStatusReason('');
    load();
  };

  const handleDeclare = async () => {
    if (!declareForm.residentId || declareForm.months.length === 0) return alert('Sélectionnez un résident et au moins un mois');
    await api.post('/payments/declare', declareForm);
    setShowDeclare(false);
    setDeclareForm({ residentId: 0, months: [], year: new Date().getFullYear(), amount: 100, payNow: false });
    load();
  };

  const toggleMonth = (m: number) => {
    setDeclareForm((prev) => ({ ...prev, months: prev.months.includes(m) ? prev.months.filter((x) => x !== m) : [...prev.months, m] }));
  };

  const sendConfirmation = async (paymentId: number) => {
    await api.post(`/notifications/payment-confirmation/${paymentId}`);
    alert('Confirmation envoyée');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Paiements</h1>
        <button onClick={() => setShowDeclare(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <CheckCircle className="w-4 h-4" /> Déclarer un paiement
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="PAID">Payé</option>
          <option value="PENDING">En attente</option>
          <option value="UNPAID">Impayé</option>
        </select>
        {user?.role === 'ADMIN' && (
          <select value={filters.buildingId} onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Tous les bâtiments</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
        </select>
        <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Résident</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">App.</th>
              {user?.role === 'ADMIN' && <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Bâtiment</th>}
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Période</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{p.resident.firstName} {p.resident.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.resident.apartment}</td>
                {user?.role === 'ADMIN' && <td className="px-4 py-3 text-sm text-gray-500">{p.resident.building?.name}</td>}
                <td className="px-4 py-3 text-sm text-gray-700">{monthNames[p.month - 1]} {p.year}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.amount.toFixed(2)} €</td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <a href={`mailto:${p.resident.email}`} className="p-1 text-gray-400 hover:text-indigo-600"><Mail className="w-3.5 h-3.5" /></a>
                    <a href={`https://wa.me/${p.resident.phone.replace(/\s/g, '')}`} target="_blank" className="p-1 text-gray-400 hover:text-green-600"><Phone className="w-3.5 h-3.5" /></a>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setShowLogs(showLogs === p.id ? null : p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" title="Logs">
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    {p.status === 'PENDING' && user?.role === 'ADMIN' && (
                      <button onClick={() => handleVerify(p.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Vérifier">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {p.status === 'PAID' && user?.role === 'ADMIN' && (
                      <button onClick={() => handleUnverify(p.id)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Dévérifier">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {p.status === 'PAID' && (
                      <button onClick={() => sendConfirmation(p.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Confirmation">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(p.status === 'PENDING' || p.status === 'PAID') && user?.role === 'ADMIN' && (
                      <button onClick={() => handleReset(p.id, p.status)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Réinitialiser">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {user?.role === 'ADMIN' && (
                      <button onClick={() => { setStatusTarget({ id: p.id, newStatus: p.status === 'PAID' ? 'UNPAID' : 'PAID' }); setShowStatusModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" title="Changer statut">
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {p.status === 'PENDING' && (
                      <button onClick={() => handleNoPayment(p.id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600" title="Sans paiement">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {p.status === 'PENDING' && (
                      <button onClick={() => handleMarkUnpaid(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Marquer impayé">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {showLogs === p.id && p.logs && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-left">
                      {p.logs.map((log: any) => (
                        <div key={log.id} className="py-1 border-b border-gray-100 last:border-0">
                          <span className="font-medium">{log.user?.name}</span> — {log.action}
                          {log.reason && <span className="text-gray-400">: {log.reason}</span>}
                          <span className="text-gray-400 ml-1">({new Date(log.createdAt).toLocaleString('fr-FR')})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">Aucun paiement</td></tr>}
          </tbody>
        </table>
      </div>

      {showDeclare && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowDeclare(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Déclarer un paiement</h2>
            <div className="space-y-3">
              <select value={declareForm.residentId} onChange={(e) => setDeclareForm({ ...declareForm, residentId: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none">
                <option value={0}>Sélectionner un résident</option>
                {residents.map((r) => <option key={r.id} value={r.id}>{r.firstName} {r.lastName} - {r.apartment} ({r.building?.name})</option>)}
              </select>
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((name, i) => (
                  <label key={i} className={`flex items-center gap-2 p-2 rounded-lg border text-sm cursor-pointer ${declareForm.months.includes(i + 1) ? 'bg-indigo-50 border-indigo-300' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={declareForm.months.includes(i + 1)} onChange={() => toggleMonth(i + 1)} className="sr-only" />
                    {name.slice(0, 3)}
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <input type="number" placeholder="Montant" value={declareForm.amount} onChange={(e) => setDeclareForm({ ...declareForm, amount: Number(e.target.value) })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none" />
                <select value={declareForm.year} onChange={(e) => setDeclareForm({ ...declareForm, year: Number(e.target.value) })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {user?.role === 'ADMIN' && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={declareForm.payNow} onChange={(e) => setDeclareForm({ ...declareForm, payNow: e.target.checked })} />
                  Payer directement (statut PAYÉ)
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeclare(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm">Annuler</button>
              <button onClick={handleDeclare} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Déclarer</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Changer le statut</h2>
            <p className="text-sm text-gray-500 mb-3">Nouveau statut: <strong>{statusTarget?.newStatus === 'PAID' ? 'Payé' : 'Impayé'}</strong></p>
            <textarea value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="Motif obligatoire..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowStatusModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm">Annuler</button>
              <button onClick={handleStatusChange} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
