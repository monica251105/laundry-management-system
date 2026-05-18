import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { DollarSign, ClipboardList, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const [statsRes, ordersRes] = await Promise.all([
          api.get(`/dashboard/stats?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`),
          api.get('/orders/all'),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-12 text-center">Memuat dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Ringkasan Bisnis 📊</h2>
        <p className="text-slate-500 mt-1">Pantau performa laundry Anda hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ClipboardList className="text-blue-600" />}
          label="Pesanan Hari Ini"
          value={stats.totalOrdersToday}
        />
        <StatCard
          icon={<DollarSign className="text-green-600" />}
          label="Pendapatan (Bruto)"
          value={`Rp ${stats.revenueToday.toLocaleString()}`}
        />
        <StatCard
          icon={<DollarSign className="text-red-600" />}
          label="Pengeluaran"
          value={`Rp ${stats.expensesToday.toLocaleString()}`}
        />
        <StatCard
          icon={<TrendingUp className="text-primary-600" />}
          label="Pendapatan Bersih"
          value={`Rp ${stats.netIncomeToday.toLocaleString()}`}
        />
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Antrean Pesanan Terbaru</h3>
              <Link to="/admin/orders" className="text-primary-600 text-sm font-semibold hover:underline">Kelola Semua</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pelanggan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Layanan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{order.user.name}</div>
                        <div className="text-xs text-slate-500">{order.invoiceCode}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.service.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada pesanan terbaru.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Expenses List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Pengeluaran Hari Ini</h3>
              <Link to="/admin/expenses" className="text-primary-600 text-sm font-semibold hover:underline">Kelola Pengeluaran</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Barang</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.expensesTodayList?.map((exp: any) => (
                    <tr key={exp.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{exp.title}</div>
                        <div className="text-[10px] text-slate-500">{exp.description || 'Tanpa keterangan'}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                        - Rp {exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats.expensesTodayList || stats.expensesTodayList.length === 0) && (
                    <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400 text-sm">Belum ada pengeluaran hari ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Menu */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-2">Menu Cepat</h3>
          <QuickActionLink to="/admin/orders" label="Proses Pesanan" description="Update status & pembayaran" color="bg-blue-500" />
          <QuickActionLink to="/admin/services" label="Update Harga" description="Kelola layanan & harga per kg" color="bg-indigo-500" />
          <QuickActionLink to="/admin/reports" label="Laporan Keuangan" description="Lihat detail pendapatan harian" color="bg-green-500" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string | number, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    </div>
    <div className="absolute -right-2 -bottom-2 text-slate-50 opacity-5 group-hover:scale-125 transition-transform duration-500">
      {icon}
    </div>
  </div>
);

const QuickActionLink = ({ to, label, description, color }: { to: string, label: string, description: string, color: string }) => (
  <Link to={to} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
    <div className={`w-2 h-12 rounded-full ${color}`}></div>
    <div>
      <h4 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{label}</h4>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </Link>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'MENUNGGU': return 'bg-yellow-100 text-yellow-700';
    case 'SELESAI': return 'bg-green-100 text-green-700';
    case 'DIBATALKAN': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

export default AdminDashboard;
