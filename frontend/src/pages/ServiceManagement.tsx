import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', pricePerKg: 0, isActive: true });

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/all');
      setServices(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/services/${editingId}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({ name: '', pricePerKg: 0, isActive: true });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      pricePerKg: service.pricePerKg,
      isActive: service.isActive,
    });
    setEditingId(service.id);
    setIsEditing(true);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus layanan ini?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchServices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Kelola Layanan</h2>
          <p className="text-slate-500 mt-1">Atur jenis layanan dan harga per kilogram.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setIsEditing(false);
            setFormData({ name: '', pricePerKg: 0, isActive: true });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Layanan
        </button>
      </div>

      {(isAdding || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-primary-100 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {isEditing ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Layanan</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Cuci Kering"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Harga per Kg</label>
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) })}
                  placeholder="10000"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                className="w-4 h-4 text-primary-600 rounded"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Layanan Aktif</label>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="btn-secondary"
              >
                Batal
              </button>
              <button type="submit" className="btn-primary px-8">
                {isEditing ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">Memuat layanan...</div>
        ) : (
          services.map((service) => (
            <motion.div
              key={service.id}
              layout
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{service.name}</h4>
                  <p className="text-primary-600 font-bold mt-1">
                    Rp {service.pricePerKg.toLocaleString()} / kg
                  </p>
                </div>
                <div className={`p-1.5 rounded-full ${service.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {service.isActive ? <Check size={16} /> : <X size={16} />}
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
