import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { User, Phone, Mail, MapPin, Calendar, ExternalLink, X, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form States for CRUD
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/users/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleShowDetail = async (id: number) => {
    setModalLoading(true);
    setIsModalOpen(true);
    try {
      const response = await api.get(`/users/customers/${id}`);
      setSelectedCustomer(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // Form Modal Handlers
  const handleCreateOpen = () => {
    setFormMode('CREATE');
    setFormData({ name: '', email: '', password: '', phone: '', address: '' });
    setEditingId(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleEditOpen = (customer: any) => {
    setFormMode('EDIT');
    setFormData({
      name: customer.name,
      email: customer.email,
      password: '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setEditingId(customer.id);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      if (formMode === 'CREATE') {
        await api.post('/users/customers', formData);
      } else {
        const submitData: any = { ...formData };
        if (!submitData.password) {
          delete submitData.password;
        }
        await api.put(`/users/customers/${editingId}`, submitData);
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        await api.delete(`/users/customers/${id}`);
        fetchCustomers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus pelanggan.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Daftar Pelanggan</h2>
          <p className="text-slate-500 mt-1">Kelola data pelanggan yang terdaftar di sistem.</p>
        </div>
        <button 
          onClick={handleCreateOpen}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Pelanggan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Memuat data pelanggan...</div>
        ) : customers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">Belum ada pelanggan terdaftar.</div>
        ) : (
          customers.map((customer) => (
            <motion.div
              key={customer.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary-50 p-3 rounded-2xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <User size={24} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-lg font-bold text-slate-800 truncate">{customer.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> Terdaftar {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-sm">{customer.phone || 'Tidak ada nomor'}</span>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                  <span className="text-sm line-clamp-2">{customer.address || 'Alamat belum diisi'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center gap-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{customer.id}</div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleShowDetail(customer.id)}
                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Detail"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditOpen(customer)}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {formMode === 'CREATE' ? 'Tambah Pelanggan Baru' : 'Edit Data Pelanggan'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Masukkan nama lengkap..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Masukkan alamat email..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password {formMode === 'EDIT' && <span className="text-xs text-slate-400 font-normal">(Biarkan kosong jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  required={formMode === 'CREATE'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder={formMode === 'CREATE' ? "Masukkan password (min 6 karakter)..." : "Masukkan password baru jika ingin mengubah..."}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Masukkan no. telepon..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field py-2.5"
                  placeholder="Masukkan alamat lengkap..."
                  rows={3}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary px-6"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary px-6 flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Detail Pelanggan</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {modalLoading ? (
                <div className="py-12 text-center text-slate-400">Memuat detail...</div>
              ) : selectedCustomer ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informasi Dasar</h4>
                      <div className="space-y-3">
                        <p className="text-slate-800"><strong>Nama:</strong> {selectedCustomer.name}</p>
                        <p className="text-slate-800"><strong>Email:</strong> {selectedCustomer.email}</p>
                        <p className="text-slate-800"><strong>Telepon:</strong> {selectedCustomer.phone || '-'}</p>
                        <p className="text-slate-800"><strong>Alamat:</strong> {selectedCustomer.address || '-'}</p>
                      </div>
                    </div>
                    <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                      <h4 className="text-sm font-bold text-primary-800 uppercase tracking-widest mb-4">Statistik</h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-xs text-primary-600 font-medium">Total Pesanan</p>
                          <p className="text-2xl font-bold text-primary-800">{selectedCustomer.orders.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-600 font-medium">Total Lunas</p>
                          <p className="text-2xl font-bold text-primary-800">
                            {selectedCustomer.orders.filter((o: any) => o.paymentStatus === 'PAID').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Riwayat Pesanan</h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Layanan</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {selectedCustomer.orders.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada pesanan.</td></tr>
                          ) : (
                            selectedCustomer.orders.map((order: any) => (
                              <tr key={order.id}>
                                <td className="px-4 py-3 font-mono font-bold text-slate-700">{order.invoiceCode}</td>
                                <td className="px-4 py-3 text-slate-600">{order.service.name}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-800">Rp {order.totalPrice.toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary px-8"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
