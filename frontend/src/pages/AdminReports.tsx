import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { DollarSign, FileText, Download, Filter, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({ 
    start: new Date().toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/revenue', { params: dates });
      setReportData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const tableColumn = ["No", "Invoice", "Tanggal Lunas", "Nominal"];
    const tableRows: any[] = [];

    reportData.report.forEach((order: any, index: number) => {
      const orderData = [
        index + 1,
        order.invoiceCode,
        new Date(order.paidAt).toLocaleDateString('id-ID'),
        `Rp ${order.totalPrice.toLocaleString()}`
      ];
      tableRows.push(orderData);
    });

    doc.setFontSize(18);
    doc.text("Laporan Pendapatan LaundryPro", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periode: ${dates.start || 'Awal'} s/d ${dates.end || 'Sekarang'}`, 14, 30);
    doc.text(`Total Pendapatan: Rp ${reportData.totalRevenue.toLocaleString()}`, 14, 37);

    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Laporan_Pendapatan_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Laporan Pendapatan</h2>
          <p className="text-slate-500 mt-1">Analisis keuangan dan riwayat transaksi lunas.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={!reportData || reportData.report.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={18} /> Ekspor PDF
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mulai Dari</label>
          <input 
            type="date" 
            className="input-field" 
            value={dates.start}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sampai Dengan</label>
          <input 
            type="date" 
            className="input-field" 
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
          />
        </div>
        <button 
          onClick={fetchReport}
          className="btn-secondary flex items-center gap-2 h-[42px]"
        >
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-600 p-8 rounded-3xl text-white shadow-xl shadow-primary-100 relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-primary-100 font-medium text-sm">Total Pendapatan</p>
            <h3 className="text-3xl font-bold mt-1">
              Rp {reportData?.totalRevenue.toLocaleString() || '0'}
            </h3>
          </div>
          <DollarSign size={80} className="absolute -right-4 -bottom-4 text-white/10" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-slate-500 font-medium text-sm">Total Pengeluaran</p>
            <h3 className="text-3xl font-bold text-red-600 mt-1">
              Rp {reportData?.totalExpenses?.toLocaleString() || '0'}
            </h3>
          </div>
          <ArrowUpRight size={80} className="absolute -right-4 -bottom-4 text-slate-50" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-slate-400 font-medium text-sm">Pendapatan Bersih</p>
            <h3 className={`text-3xl font-bold mt-1 ${reportData?.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Rp {reportData?.netIncome?.toLocaleString() || '0'}
            </h3>
          </div>
          <div className="absolute -right-4 -bottom-4 text-white/5 font-black text-6xl italic">PROFIT</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Detail Pendapatan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-400">Memuat...</td></tr>
                ) : reportData?.report.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-400">Tidak ada data.</td></tr>
                ) : (
                  reportData?.report.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold text-slate-700">{order.invoiceCode}</div>
                        <div className="text-[10px] text-slate-400">{new Date(order.paidAt).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        Rp {order.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Detail Pengeluaran</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Barang</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-400">Memuat...</td></tr>
                ) : reportData?.expenses.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-400">Tidak ada data.</td></tr>
                ) : (
                  reportData?.expenses.map((exp: any) => (
                    <tr key={exp.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 text-sm">{exp.title}</div>
                        <div className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-500">
                        - Rp {exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
