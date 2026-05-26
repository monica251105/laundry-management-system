import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { DollarSign, ClipboardList, Clock, TrendingUp, ChevronRight, Eye, X, CreditCard, Calendar, User, Phone, MapPin, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayment = async (id: number) => {
    try {
      await api.put(`/orders/${id}/pay`);
      setSelectedOrder((prev: any) => prev ? { ...prev, paymentStatus: 'PAID' } : null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center">Memuat dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Ringkasan Bisnis</h2>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
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
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center"
                          title="Detail Pesanan"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada pesanan terbaru.</td></tr>
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
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
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedExpense(exp)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center"
                          title="Detail Pengeluaran"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!stats.expensesTodayList || stats.expensesTodayList.length === 0) && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">Belum ada pengeluaran hari ini.</td></tr>
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

      {/* Modals */}
      <AnimatePresence>
        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full uppercase tracking-wider">Detail Pesanan</span>
                  <h3 className="text-xl font-mono font-bold text-slate-800 mt-2">{selectedOrder.invoiceCode}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
                {/* Pelanggan */}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Informasi Pelanggan
                  </h4>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{selectedOrder.user.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone size={12} /> {selectedOrder.user.phone || 'Tidak ada nomor telepon'}
                    </div>
                    {selectedOrder.user.address && (
                      <div className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                        <MapPin size={12} className="mt-0.5 shrink-0" /> 
                        <span>{selectedOrder.user.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Layanan & Biaya */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> Detail Layanan & Biaya
                  </h4>
                  <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Layanan</span>
                      <span className="font-semibold text-slate-800">{selectedOrder.service.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Berat</span>
                      <span className="font-semibold text-slate-800">{selectedOrder.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Harga per kg</span>
                      <span className="font-semibold text-slate-800">Rp {selectedOrder.service.pricePerKg.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-dashed border-slate-100 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Total Pembayaran</span>
                      <span className="text-lg font-extrabold text-primary-600">Rp {selectedOrder.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Catatan */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Catatan Tambahan</h4>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                    {selectedOrder.notes || 'Tidak ada catatan khusus.'}
                  </div>
                </div>

                {/* Status Bayar & Proses */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Pembayaran</h4>
                    <span className={`inline-block font-bold text-xs px-3 py-1.5 rounded-full uppercase ${selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedOrder.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Pengerjaan</h4>
                    <span className={`inline-block font-bold text-xs px-3 py-1.5 rounded-full uppercase ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">Aksi Cepat Admin:</h4>
                  <div className="flex flex-wrap gap-3">
                    {/* Status Dropdown */}
                    <div className="flex-1 min-w-[140px]">
                      <select
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      >
                        <option value="MENUNGGU">MENUNGGU</option>
                        <option value="DIPROSES">DIPROSES</option>
                        <option value="CUCI">CUCI</option>
                        <option value="SETRIKA">SETRIKA</option>
                        <option value="SELESAI">SELESAI</option>
                        <option value="DIAMBIL">DIAMBIL</option>
                        <option value="DIBATALKAN">DIBATALKAN</option>
                      </select>
                    </div>

                    {/* Payment Process Button */}
                    {selectedOrder.paymentStatus === 'UNPAID' && (
                      <button
                        onClick={() => handleProcessPayment(selectedOrder.id)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        <CreditCard size={14} />
                        Bayar Lunas
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Expense Detail Modal */}
        {selectedExpense && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">Detail Pengeluaran</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">{selectedExpense.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="py-6 space-y-4">
                <div className="text-center p-6 bg-red-50/50 rounded-2xl border border-red-100/50">
                  <span className="text-xs text-red-500 font-bold uppercase tracking-widest">Nominal</span>
                  <div className="text-3xl font-black text-red-600 mt-1">
                    Rp {selectedExpense.amount.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> Tanggal Transaksi
                  </span>
                  <div className="text-sm font-semibold text-slate-700">
                    {new Date(selectedExpense.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <FileText size={12} /> Deskripsi Keterangan
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 min-h-[60px]">
                    {selectedExpense.description || 'Tidak ada deskripsi tambahan.'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="btn-secondary py-2 px-5 text-xs rounded-xl font-semibold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    case 'DIPROSES': return 'bg-blue-100 text-blue-700';
    case 'CUCI': return 'bg-indigo-100 text-indigo-700';
    case 'SETRIKA': return 'bg-purple-100 text-purple-700';
    case 'SELESAI': return 'bg-green-100 text-green-700';
    case 'DIAMBIL': return 'bg-slate-100 text-slate-700';
    case 'DIBATALKAN': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default AdminDashboard;

