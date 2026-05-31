import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, ClipboardList, Settings, Users, PieChart, Menu, X as CloseIcon, DollarSign } from 'lucide-react';
import NotificationToast from './NotificationToast';
import logo from '../assets/logo.png';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'ADMIN' ? [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/orders', icon: <ClipboardList size={20} />, label: 'Semua Pesanan' },
    { to: '/admin/services', icon: <Settings size={20} />, label: 'Kelola Layanan' },
    { to: '/admin/customers', icon: <Users size={20} />, label: 'Pelanggan' },
    { to: '/admin/reports', icon: <PieChart size={20} />, label: 'Laporan' },
    { to: '/admin/expenses', icon: <DollarSign size={20} />, label: 'Pengeluaran' },
  ] : [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/orders/history', icon: <ClipboardList size={20} />, label: 'Riwayat' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      {user && (
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Novita Laundry Logo" className="h-10 w-10 object-contain rounded-xl" />
              <div>
                <h1 className="text-lg font-black text-slate-800 leading-none">Novita</h1>
                <span className="text-[11px] text-primary-600 font-black tracking-wider uppercase">Laundry</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={location.pathname === item.to} 
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="bg-primary-100 p-2 rounded-full text-primary-600 flex-shrink-0">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              Keluar
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      {user && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Novita Laundry Logo" className="h-8 w-8 object-contain rounded-lg" />
                <div>
                  <h1 className="text-sm font-black text-slate-800 leading-none">Novita</h1>
                  <span className="text-[9px] text-primary-600 font-black tracking-wider uppercase">Laundry</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500">
                <CloseIcon size={24} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {menuItems.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  icon={item.icon} 
                  label={item.label} 
                  active={location.pathname === item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
            <div className="p-6 border-t border-slate-100">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full text-red-600 font-bold">
                <LogOut size={20} /> Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-2">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Novita Laundry Logo" className="h-8 w-8 object-contain rounded-lg" />
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-none">Novita</h1>
              <span className="text-[9px] text-primary-600 font-black tracking-wider uppercase">Laundry</span>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      <NotificationToast />
    </div>
  );
};

const NavLink = ({ to, icon, label, active, onClick }: { to: string; icon: React.ReactNode; label: string, active?: boolean, onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
        : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'
    }`}
  >
    <span className={`${active ? '' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </Link>
);

export default Layout;
