import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Package, Calendar, Tag, CreditCard, ChevronRight, X, Clock, Droplets, Sparkles, CheckCircle, CheckSquare, FileText } from 'lucide-react';
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

const OrderHistory: React.FC = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Riwayat Pesanan</h2>
        <p className="text-slate-500 mt-1">Daftar semua pesanan laundry Anda dari awal.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat riwayat...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-slate-200">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Belum ada riwayat</h3>
            <p className="text-slate-500 mt-1">Anda belum pernah melakukan pemesanan.</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedOrder(order)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-full md:w-auto flex items-center gap-4 flex-1">
                <div className={`p-4 rounded-2xl ${getStatusBg(order.status)} group-hover:scale-110 transition-transform`}>
                  <Package size={24} className={getStatusText(order.status)} />
                </div>
                <div className="overflow-hidden">
                  <div className="font-mono text-sm font-bold text-slate-800">{order.invoiceCode}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{order.service.name} • {order.weight} kg</div>
                </div>
              </div>

              <div className="w-full md:w-auto grid grid-cols-2 md:flex items-center gap-8 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> Tanggal
                  </span>
                  <span className="font-bold text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <CreditCard size={12} /> Total
                  </span>
                  <span className="font-bold text-primary-600">
                    Rp {order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
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
              <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1 text-left">
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'MENUNGGU': return 'bg-yellow-100 text-yellow-700';
    case 'SELESAI': return 'bg-green-100 text-green-700';
    case 'DIBATALKAN': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'MENUNGGU': return 'bg-yellow-50';
    case 'SELESAI': return 'bg-green-50';
    case 'DIBATALKAN': return 'bg-red-50';
    default: return 'bg-blue-50';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'MENUNGGU': return 'text-yellow-600';
    case 'SELESAI': return 'text-green-600';
    case 'DIBATALKAN': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

export default OrderHistory;
