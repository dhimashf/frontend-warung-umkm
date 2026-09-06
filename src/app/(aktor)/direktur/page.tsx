'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import LocationPemantauan from '@/components/LocationPemantauan'
import { MdTrendingUp, MdStore, MdWarning, MdAttachMoney, MdSearch } from 'react-icons/md'

export default function DashboardDirektur() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pemantauan-bisnis/dashboard-direktur`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard direktur:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center font-bold text-gray-500">Memuat Analytics Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="flex h-screen items-center justify-center font-bold text-red-500">Gagal memuat data dashboard.</div>;
  }

  const {
    total_pendapatan_bulan_ini,
    pertumbuhan_pendapatan_persen,
    utilisasi_booth,
    total_denda_aktif,
    booth_sering_rusak,
    rekap_12_bulan
  } = dashboardData;

  const isGrowthPositive = pertumbuhan_pendapatan_persen >= 0;

  return (
    <div className="mx-auto p-6 space-y-6 bg-gray-50 min-h-screen pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Advanced Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">Ringkasan performa bisnis dan utilisasi aset secara real-time</p>
        </div>
      </div>

      {/* Top Kpi Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pendapatan Bulan Ini</h2>
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><MdAttachMoney size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">Rp {Number(total_pendapatan_bulan_ini).toLocaleString('id-ID')}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
            <MdTrendingUp className={!isGrowthPositive ? 'rotate-180' : ''} />
            <span>{isGrowthPositive ? '+' : ''}{pertumbuhan_pendapatan_persen}% dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Denda Aktif</h2>
            <div className="bg-red-100 p-2 rounded-lg text-red-600"><MdWarning size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">Rp {Number(total_denda_aktif).toLocaleString('id-ID')}</p>
          <p className="text-gray-500 text-sm mt-2">Denda berjalan dari keterlambatan sewa</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Booth Disewa</h2>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><MdStore size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{utilisasi_booth.disewa} <span className="text-lg text-gray-500 font-medium">/ {utilisasi_booth.total}</span></p>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${utilisasi_booth.total > 0 ? (utilisasi_booth.disewa / utilisasi_booth.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Booth Diinspeksi</h2>
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><MdSearch size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{utilisasi_booth.inspeksi}</p>
          <p className="text-gray-500 text-sm mt-2">Menunggu konfirmasi deposit & kondisi</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Rekap Pendapatan List */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Tren Pendapatan 12 Bulan Terakhir</h2>
          <div className="h-64 flex flex-col justify-end gap-2 border-b border-l border-gray-200 p-4">
             {/* Simple Bar Chart representation */}
             <div className="flex justify-between h-full items-end gap-2">
                {rekap_12_bulan.map((rek: any, idx: number) => {
                  const max = Math.max(...rekap_12_bulan.map((r: any) => Number(r.total_pendapatan)), 1);
                  const height = (Number(rek.total_pendapatan) / max) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                       <div className="relative w-full h-full flex flex-col justify-end items-center">
                          <div 
                            className="w-full bg-primary bg-opacity-80 rounded-t-sm group-hover:bg-opacity-100 transition-all relative"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          >
                             <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                                Rp {Number(rek.total_pendapatan).toLocaleString('id-ID')}
                             </div>
                          </div>
                       </div>
                       <span className="text-[10px] text-gray-500 mt-2">{rek.bulan.substring(0,3)}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Booth Sering Rusak */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
             <MdWarning className="text-yellow-500" />
             Top Booth Sering Rusak
          </h2>
          <div className="space-y-4">
            {booth_sering_rusak.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada data kerusakan booth.</p>
            ) : (
              booth_sering_rusak.map((booth: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{booth.id_booth}</p>
                      <p className="text-xs text-gray-500">Ukuran: {booth.ukuran}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-sm font-bold">
                    {booth.jumlah_kerusakan}x
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LocationPemantauan />
    </div>
  )
}
