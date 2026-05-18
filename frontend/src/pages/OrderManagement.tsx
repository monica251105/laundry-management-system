import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Search, Filter, MoreVertical, CreditCard, RefreshCw, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayment = async (id: number) => {
    try {
      await api.put(`/orders/${id}/pay`);
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Tidak ada pesanan ditemukan.</td></tr>
              ) : (
                filteredOrders.map((order) => (
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.paymentStatus === 'UNPAID' && (
                          <button
                            onClick={() => handleProcessPayment(order.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Bayar"
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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
