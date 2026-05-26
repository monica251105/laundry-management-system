import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, Package, Plus, ChevronRight, Eye, X, FileText, Droplets, Sparkles, CheckSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['MENUNGGU', 'DIPROSES', 'CUCI', 'SETRIKA', 'SELESAI', 'DIAMBIL'];

const STEP_ICONS: Record<string, React.ComponentType<any>> = {
  MENUNGGU: Clock,
  DIPROSES: Package,
  CUCI: Droplets,
  SETRIKA: Sparkles,
  SELESAI: CheckCircle,
  DIAMBIL: CheckSquare
};

const STEP_LABELS: Record<string, string> = {
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Diproses',
  CUCI: 'Dicuci',
  SETRIKA: 'Disetrika',
  SELESAI: 'Selesai',
  DIAMBIL: 'Diambil'
};

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        setOrders(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  const activeOrders = orders.filter(o => !['DIAMBIL', 'DIBATALKAN'].includes(o.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Halo, {user?.name}! 👋</h2>
          <p className="text-slate-500 mt-1">Lihat status laundry Anda hari ini.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingBag className="text-blue-600" />} label="Total Pesanan" value={orders.length} />
        <StatCard icon={<Clock className="text-yellow-600" />} label="Sedang Diproses" value={activeOrders.length} />
        <StatCard icon={<CheckCircle className="text-green-600" />} label="Selesai" value={orders.filter(o => o.status === 'SELESAI').length} />
        <StatCard icon={<Package className="text-indigo-600" />} label="Sudah Diambil" value={orders.filter(o => o.status === 'DIAMBIL').length} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Pesanan Terbaru</h3>
          <Link to="/orders/history" className="text-primary-600 text-sm font-semibold hover:underline">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Memuat data...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Belum ada pesanan.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Layanan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Berat</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-slate-700">{order.invoiceCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.weight} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">Rp {order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
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
              <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
                {/* Stepper */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Laundry Anda</h4>
                  {selectedOrder.status === 'DIBATALKAN' ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                      <X className="shrink-0 bg-red-100 p-1.5 rounded-full" size={32} />
                      <div>
                        <div className="text-sm font-bold">Pesanan Dibatalkan</div>
                        <div className="text-xs text-red-500">Pesanan ini telah dibatalkan oleh admin atau pelanggan.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Horizontal progress bar for md and up */}
                      <div className="hidden md:flex justify-between items-center relative z-0 px-2">
                        {/* Background Line */}
                        <div className="absolute top-5 left-10 right-10 h-1 bg-slate-100 -z-10 rounded-full"></div>
                        {/* Active Line */}
                        <div 
                          className="absolute top-5 left-10 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-500"
                          style={{ 
                            width: `calc(${(Math.max(0, STEPS.indexOf(selectedOrder.status)) / (STEPS.length - 1)) * 100}% - ${(Math.max(0, STEPS.indexOf(selectedOrder.status)) / (STEPS.length - 1)) * 40}px)` 
                          }}
                        ></div>

                        {STEPS.map((step, idx) => {
                          const isActive = STEPS.indexOf(selectedOrder.status) >= idx;
                          const StepIcon = STEP_ICONS[step];
                          return (
                            <div key={step} className="flex flex-col items-center flex-1">
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                                  isActive 
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 scale-110' 
                                    : 'bg-white border-2 border-slate-200 text-slate-400'
                                }`}
                              >
                                <StepIcon size={18} />
                              </div>
                              <span className={`text-[10px] font-bold mt-2 text-center ${isActive ? 'text-primary-600 font-extrabold' : 'text-slate-400'}`}>
                                {STEP_LABELS[step]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Vertical progress bar for mobile */}
                      <div className="flex md:hidden flex-col gap-6 relative pl-10 z-0">
                        {/* Vertical line */}
                        <div className="absolute top-4 bottom-4 left-4 w-1 bg-slate-100 -z-10 rounded-full"></div>
                        <div 
                          className="absolute top-4 left-4 w-1 bg-primary-500 -z-10 rounded-full transition-all duration-500"
                          style={{ 
                            height: `${(Math.max(0, STEPS.indexOf(selectedOrder.status)) / (STEPS.length - 1)) * 100}%` 
                          }}
                        ></div>

                        {STEPS.map((step, idx) => {
                          const isActive = STEPS.indexOf(selectedOrder.status) >= idx;
                          const StepIcon = STEP_ICONS[step];
                          return (
                            <div key={step} className="flex items-center gap-3 relative min-h-[32px]">
                              <div 
                                className={`absolute -left-9 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                                    : 'bg-white border-2 border-slate-200 text-slate-400'
                                }`}
                              >
                                <StepIcon size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isActive ? 'text-primary-600 font-extrabold' : 'text-slate-400'}`}>
                                  {STEP_LABELS[step]}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detail Biaya */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> Rincian Transaksi
                  </h4>
                  <div className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Layanan</span>
                      <span className="font-semibold text-slate-800">{selectedOrder.service.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Berat Cucian</span>
                      <span className="font-semibold text-slate-800">{selectedOrder.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Harga per kg</span>
                      <span className="font-semibold text-slate-800">Rp {selectedOrder.service.pricePerKg.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Total Biaya</span>
                      <span className="text-lg font-extrabold text-primary-600">Rp {selectedOrder.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Pembayaran & Catatan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Pembayaran</h4>
                    <div className="border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-bold uppercase ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>
                          {selectedOrder.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </div>
                      {selectedOrder.paymentStatus === 'PAID' && selectedOrder.paidAt && (
                        <div className="flex justify-between text-xs border-t border-slate-50 pt-2">
                          <span className="text-slate-500">Tanggal Bayar</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(selectedOrder.paidAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Catatan dari Outlet</h4>
                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 italic min-h-[68px]">
                      {selectedOrder.notes || 'Tidak ada catatan khusus.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary py-2 px-6 text-xs rounded-xl font-semibold"
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

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    </div>
  </div>
);

export default CustomerDashboard;

