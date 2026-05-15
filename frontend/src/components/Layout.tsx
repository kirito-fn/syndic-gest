import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import { Building2, Users, CreditCard, Receipt, Bell, LayoutDashboard, Shield, LogOut, Menu, Sun, Moon, Languages } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { t, toggleLang, lang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/buildings', label: t('nav.buildings'), icon: Building2 },
    { to: '/residents', label: t('nav.residents'), icon: Users },
    { to: '/payments', label: t('nav.payments'), icon: CreditCard },
    { to: '/charges', label: t('nav.charges'), icon: Receipt },
    { to: '/notifications', label: t('nav.notifications'), icon: Bell },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: t('nav.admin'), icon: Shield }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${lang === 'ar' ? 'lg:right-0 lg:left-auto right-0 border-r-0 border-l' : ''}`}>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-lg text-gray-800 dark:text-white">{t('app.name')}</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.to) ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={toggleLang} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full mb-1 transition-colors">
            <Languages className="w-5 h-5" />
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
          <button onClick={toggle} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full mb-1 transition-colors">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {dark ? t('nav.lightMode') : t('nav.darkMode')}
          </button>
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">{user?.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role === 'ADMIN' ? t('nav.admin') : t('nav.buildings').slice(0, -1)}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full transition-colors">
            <LogOut className="w-5 h-5" /> {t('nav.logout')}
          </button>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2 select-none">{t('app.builtBy')}</p>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{t('app.name')}</span>
          <div className="flex gap-1">
            <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-800" />}
            </button>
          </div>
        </header>
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 overflow-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
