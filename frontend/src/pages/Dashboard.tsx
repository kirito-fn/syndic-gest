import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, Clock, XCircle, Euro, TrendingUp, Building2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get(`/dashboard/stats?month=${month}&year=${year}`).then((res) => setStats(res.data));
  }, [month, year]);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  if (!stats) return <div className="flex items-center justify-center h-64 text-gray-500">Chargement...</div>;

  const cards = [
    { label: 'Résidents', value: stats.totalResidents, icon: Users, color: 'bg-blue-50 text-blue-600', bg: 'bg-blue-500' },
    { label: 'Payés', value: stats.paidCount, icon: CheckCircle, color: 'bg-green-50 text-green-600', bg: 'bg-green-500' },
    { label: 'En attente', value: stats.pendingCount, icon: Clock, color: 'bg-yellow-50 text-yellow-600', bg: 'bg-yellow-500' },
    { label: 'Impayés', value: stats.unpaidCount, icon: XCircle, color: 'bg-red-50 text-red-600', bg: 'bg-red-500' },
    { label: 'Encaissé', value: `${stats.totalCollected.toFixed(2)} €`, icon: Euro, color: 'bg-emerald-50 text-emerald-600', bg: 'bg-emerald-500' },
    { label: 'Charges', value: `${stats.totalCharges.toFixed(2)} €`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', bg: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Résumé financier - {monthNames[month - 1]} {year}</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-4 h-4" /></div>
              <span className="text-xs text-gray-500 font-medium">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Encaissements mensuels ({year})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={(m) => monthNames[m - 1].slice(0, 3)} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} labelFormatter={(m) => monthNames[Number(m) - 1]} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Progression par bâtiment</h2>
          <div className="space-y-4">
            {stats.buildingProgress.map((b: any) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{b.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{b.paid}/{b.total} ({b.rate}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${b.rate}%` }} />
                </div>
              </div>
            ))}
            {stats.buildingProgress.length === 0 && <p className="text-sm text-gray-400">Aucun bâtiment</p>}
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Solde net</p>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.balance.toFixed(2)} €
            </p>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Encaissé: {stats.totalCollected.toFixed(2)} €</span>
              <span>Charges: {stats.totalCharges.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
