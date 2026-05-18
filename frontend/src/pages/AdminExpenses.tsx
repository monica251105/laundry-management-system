import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { DollarSign, Plus, Trash2, Calendar, Tag, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setIsAdding(false);
      setFormData({ title: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus catatan pengeluaran ini?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const quickTitles = ['Sabun', 'Pewangi', 'Listrik', 'Air', 'Plastik'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Manajemen Pengeluaran</h2>
          <p className="text-slate-500 mt-1">Catat semua biaya operasional laundry Anda.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Catat Pengeluaran
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-primary-100 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Pengeluaran Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Barang / Judul</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Beli Sabun Cair"
                  />
                  <div className="flex flex-wrap gap-2">
                    {quickTitles.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, title: t })}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-primary-100 hover:text-primary-600 rounded-full font-bold text-slate-500 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Beli di Toko Jaya"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary"
              >
                Batal
              </button>
              <button type="submit" className="btn-primary px-8">
                Simpan
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Barang / Judul</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nominal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Belum ada catatan pengeluaran.</td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <Tag size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{expense.title}</div>
                          {expense.description && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Info size={12} /> {expense.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-red-600">
                        - Rp {expense.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(expense.date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {!loading && expenses.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 min-w-[250px]">
            <p className="text-xs text-red-600 font-bold uppercase tracking-widest">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-red-700 mt-1">
              Rp {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExpenses;
