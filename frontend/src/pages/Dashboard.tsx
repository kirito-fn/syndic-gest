import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, Building2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const { t, currency } = useLang();
  const [stats, setStats] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get(`/dashboard/stats?month=${month}&year=${year}`).then((res) => setStats(res.data));
  }, [month, year]);

  const months = t('months');
  const monthNames = Array.isArray(months) ? months : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  if (!stats) return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">{t('common.loading')}</div>;

  const cards = [
    { label: t('dashboard.residents'), value: stats.totalResidents, icon: Users, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: t('dashboard.paid'), value: stats.paidCount, icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: t('dashboard.pending'), value: stats.pendingCount, icon: Clock, color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    { label: t('dashboard.unpaid'), value: stats.unpaidCount, icon: XCircle, color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    { label: t('dashboard.collected'), value: `${stats.totalCollected.toFixed(2)} ${currency}`, icon: DollarSign, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: t('dashboard.charges'), value: `${stats.totalCharges.toFixed(2)} ${currency}`, icon: TrendingUp, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.summary')} - {monthNames[month - 1]} {year}</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm">
            {monthNames.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="w-4 h-4" /></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('dashboard.monthlyTitle')} ({year})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="month" tickFormatter={(m) => monthNames[m - 1].slice(0, 3)} stroke={dark ? '#9CA3AF' : '#666'} />
              <YAxis stroke={dark ? '#9CA3AF' : '#666'} />
              <Tooltip
                contentStyle={{ backgroundColor: dark ? '#1F2937' : '#fff', border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`, color: dark ? '#fff' : '#000' }}
                formatter={(value: number) => `${value.toFixed(2)} ${currency}`} labelFormatter={(m) => monthNames[Number(m) - 1]} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('dashboard.buildingProgress')}</h2>
          <div className="space-y-4">
            {stats.buildingProgress.map((b: any) => (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{b.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{b.paid}/{b.total} ({b.rate}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${b.rate}%` }} />
                </div>
              </div>
            ))}
            {stats.buildingProgress.length === 0 && <p className="text-sm text-gray-400">{t('common.noBuilding')}</p>}
          </div>
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.balance')}</p>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stats.balance.toFixed(2)} {currency}
            </p>
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
              <span>{t('dashboard.collected')}: {stats.totalCollected.toFixed(2)} {currency}</span>
              <span>{t('dashboard.charges')}: {stats.totalCharges.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
