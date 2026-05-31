import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Search, Filter, MoreVertical, CreditCard, RefreshCw, Plus, Eye, Trash, X, Calendar, User, Phone, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/all');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayment = async (id: number) => {
    try {
      await api.put(`/orders/${id}/pay`);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev: any) => prev ? { ...prev, paymentStatus: 'PAID' } : null);
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await api.delete(`/orders/${id}`);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.invoiceCode.toLowerCase().includes(filter.toLowerCase()) || 
                          order.user.name.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Manajemen Pesanan</h2>
          <p className="text-slate-500 mt-1">Kelola status proses dan pembayaran pelanggan.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/orders/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Buat Pesanan
          </Link>
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari invoice atau nama..."
            className="input-field pl-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            className="input-field pl-10 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU">MENUNGGU</option>
            <option value="DIPROSES">DIPROSES</option>
            <option value="CUCI">CUCI</option>
            <option value="SETRIKA">SETRIKA</option>
            <option value="SELESAI">SELESAI</option>
            <option value="DIAMBIL">DIAMBIL</option>
            <option value="DIBATALKAN">DIBATALKAN</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pembayaran</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Tidak ada pesanan ditemukan.</td></tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-slate-800">{order.invoiceCode}</div>
                      <div className="text-xs text-slate-500 mt-1">{order.service.name} • {order.weight} kg</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-700">{order.user.name}</div>
                      <div className="text-xs text-slate-500">{order.user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">Rp {order.totalPrice.toLocaleString()}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`text-xs font-bold px-2 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(order.status)}`}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <option value="MENUNGGU">MENUNGGU</option>
                        <option value="DIPROSES">DIPROSES</option>
                        <option value="CUCI">CUCI</option>
                        <option value="SETRIKA">SETRIKA</option>
                        <option value="SELESAI">SELESAI</option>
                        <option value="DIAMBIL">DIAMBIL</option>
                        <option value="DIBATALKAN">DIBATALKAN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 relative">
                        {order.paymentStatus === 'UNPAID' && (
                          <button
                            onClick={() => handleProcessPayment(order.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Bayar Lunas"
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                        <div className="inline-block text-left">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === order.id ? null : order.id);
                            }}
                            className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeMenuId === order.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                              <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 text-left ${
                                index >= filteredOrders.length - 2
                                  ? 'bottom-full mb-2'
                                  : 'mt-2'
                              }`}>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <Eye size={14} /> Lihat Detail
                                </button>
                                {order.paymentStatus === 'UNPAID' && (
                                  <button
                                    onClick={() => {
                                      handleProcessPayment(order.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-green-600 hover:bg-green-50 flex items-center gap-2 font-medium"
                                  >
                                    <CreditCard size={14} /> Bayar Lunas
                                  </button>
                                )}
                                {order.status !== 'DIBATALKAN' && order.status !== 'DIAMBIL' && (
                                  <button
                                    onClick={() => {
                                      handleUpdateStatus(order.id, 'DIBATALKAN');
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-2 font-medium"
                                  >
                                    <X size={14} /> Batalkan Pesanan
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen?')) {
                                      handleDeleteOrder(order.id);
                                    }
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold border-t border-slate-100"
                                >
                                  <Trash size={14} /> Hapus Pesanan
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};

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

export default OrderManagement;
