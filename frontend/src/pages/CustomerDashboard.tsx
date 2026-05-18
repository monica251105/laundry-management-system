import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, Package, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
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
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Layanan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Berat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <motion.tr key={order.id} whileHover={{ backgroundColor: '#f8fafc' }}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-slate-700">{order.invoiceCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.weight} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">Rp {order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link to={`/orders/${order.id}`} className="text-primary-600 hover:text-primary-800">
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
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
