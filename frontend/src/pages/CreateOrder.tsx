import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { ShoppingCart, Scale, Info, Loader2, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateOrder: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, customersRes] = await Promise.all([
          api.get('/services'),
          api.get('/users/customers'),
        ]);
        setServices(servicesRes.data);
        setCustomers(customersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const calculateTotal = () => {
    if (!selectedService || !weight) return 0;
    const service = services.find(s => s.id === selectedService);
    return service ? service.pricePerKg * parseFloat(weight) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !weight || !selectedCustomer) return;
    setLoading(true);
    try {
      await api.post('/orders', {
        serviceId: selectedService,
        weight: parseFloat(weight),
        notes,
        userId: selectedCustomer,
      });
      navigate('/admin/orders');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-12 text-center">Memuat data...</div>;

  if (customers.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3">
          <User size={48} className="mx-auto text-amber-600 animate-pulse" />
          <h3 className="text-lg font-bold">Pelanggan Belum Terdaftar</h3>
          <p className="text-sm text-amber-700">
            Anda harus mendaftarkan pelanggan terlebih dahulu sebelum dapat membuat pesanan laundry baru.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/customers')}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Daftarkan Pelanggan Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Buat Pesanan Baru (Admin)</h2>
        <p className="text-slate-500 mt-1">Masukkan data pesanan atas nama pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            
            {/* Customer Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User size={18} className="text-primary-600" />
                Pilih Pelanggan
              </label>
              <select
                className="input-field py-2.5"
                value={selectedCustomer || ''}
                onChange={(e) => setSelectedCustomer(parseInt(e.target.value))}
                required
              >
                <option value="">-- Pilih Pelanggan --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <ShoppingCart size={18} className="text-primary-600" />
                Pilih Jenis Layanan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`cursor-pointer p-4 border rounded-xl transition-all ${
                      selectedService === service.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      className="hidden"
                      onChange={() => setSelectedService(service.id)}
                    />
                    <div className="font-bold text-slate-800">{service.name}</div>
                    <div className="text-sm text-slate-500 mt-1">Rp {service.pricePerKg.toLocaleString()} / kg</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Scale size={18} className="text-primary-600" />
                Berat Laundry (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input-field"
                placeholder="Contoh: 2.5"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Info size={18} className="text-primary-600" />
                Catatan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field py-2.5"
                placeholder="Tulis instruksi khusus jika ada..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedService || !weight || !selectedCustomer}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Konfirmasi Pesanan'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
              Ringkasan Pesanan
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Pelanggan</span>
                <span className="text-white font-medium truncate max-w-[120px]">
                  {customers.find(c => c.id === selectedCustomer)?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Layanan</span>
                <span className="text-white font-medium">
                  {services.find(s => s.id === selectedService)?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Berat</span>
                <span className="text-white font-medium">{weight ? `${weight} kg` : '-'}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Harga per kg</span>
                <span className="text-white font-medium">
                  Rp {services.find(s => s.id === selectedService)?.pricePerKg.toLocaleString() || '0'}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-lg font-bold">Total Biaya</span>
                <span className="text-2xl font-bold text-primary-400">
                  Rp {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-800 text-sm">
            <p className="flex items-start gap-2">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <span>Total biaya mungkin berubah setelah ditimbang ulang oleh admin di outlet.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;

