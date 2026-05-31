import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { User, Mail, Lock, Phone, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg p-8 rounded-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="Novita Laundry Logo" className="h-16 w-16 object-contain rounded-2xl shadow-md mb-4 bg-white p-2" />
          <h1 className="text-3xl font-bold text-slate-800">Daftar Akun</h1>
          <p className="text-slate-600 mt-2">Bergabung dengan Novita Laundry hari ini</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field pl-10"
                placeholder="Nama Anda"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field pl-10"
                placeholder="email@contoh.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">No. Telepon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field pl-10"
                placeholder="0812xxxx"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field pl-10 py-2.5"
                placeholder="Alamat lengkap Anda"
                rows={2}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary md:col-span-2 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
