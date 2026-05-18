import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Package, Calendar, Tag, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all group"
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
