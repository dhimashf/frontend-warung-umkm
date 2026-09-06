'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { PemantauanBooth } from '@/components/PemantauanBooth'
import { PemantauanBoothCard } from '@/components/PemantauanBoothCard'
import LocationPemantauan from '@/components/LocationPemantauan'
import TabModalPendapatan from '@/components/TabModalPendapatan'

type Booth = {
  id_sewa: string
  mulai_sewa: string | null
  akhir_sewa: string | null
  permintaan_dibuat: string
  lokasi: string
  status: string
  booth_id_booth: string | null
  biodata_nik: string
  durasi: number
  penyewa_nama?: string
  kecamatan?: string
  denda?: number
}

export default function DashboardKepalaDivisi() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBooth, setSelectedBooth] = useState<any | null>(null)
  const [boothData, setBoothData] = useState<Booth[]>([])
  const [rentedBoothCount, setRentedBoothCount] = useState(0)
  const [inspeksiBoothCount, setInspeksiBoothCount] = useState(0)
  const [totalPendapatan, setTotalPendapatan] = useState(0)
  const [dendaAktif, setDendaAktif] = useState(0)
  const [isTabModalPendapatanOpen, setIsTabModalPendapatanOpen] = useState(false);
  const [focusBoothId, setFocusBoothId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'arsip'>('monitoring');
  const [archiveData, setArchiveData] = useState<Booth[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  const fetchBiodataName = async (biodata_nik: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/biodata/nik/${biodata_nik}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success ? response.data.data.nama : null
    } catch (error) {
      return null
    }
  }

  const fetchKecamatanFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      )
      const address = response.data?.address || {}
      return address.district || address.city_district || address.municipality || address.administrative_area_level_2 || 'Unknown District'
    } catch (error) {
      return 'Unknown District'
    }
  }

  const openTabModal = () => setIsTabModalPendapatanOpen(true);
  const closeTabModal = () => setIsTabModalPendapatanOpen(false);

  const fetchArchiveData = async () => {
    if (archiveData.length > 0) return; // Don't refetch if already loaded
    setIsLoadingArchive(true);
    try {
      const token = localStorage.getItem("token");
      const resSewa = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan`, { headers: { Authorization: `Bearer ${token}` } });
      if (resSewa.data.success && resSewa.data.data) {
        const archived = resSewa.data.data.filter((b: Booth) => b.status === 'SELESAI' || b.status === 'DITOLAK');
        const withNames = await Promise.all(
          archived.map(async (booth: Booth) => {
            const name = await fetchBiodataName(booth.biodata_nik);
            return { ...booth, penyewa_nama: name || booth.biodata_nik };
          })
        );
        setArchiveData(withNames);
      }
    } catch (error) {
      console.error('Error fetching archive data:', error);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleTabChange = (tab: 'monitoring' | 'arsip') => {
    setActiveTab(tab);
    if (tab === 'arsip') fetchArchiveData();
  };

  const handleDetailClick = async (booth: Booth) => {
    setSelectedBooth(null);
    setIsModalOpen(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pemantauan-bisnis/all/${booth.booth_id_booth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.data.length > 0) {
        const detail = response.data.data[0];
        const formattedBooth = {
          id_sewa: booth.id_sewa,
          mulai_sewa: booth.mulai_sewa,
          akhir_sewa: booth.akhir_sewa,
          permintaan_dibuat: booth.permintaan_dibuat,
          lokasi: detail.lokasi || 'Unknown',
          status: booth.status || 'Unknown',
          booth_id_booth: booth.booth_id_booth,
          biodata_nik: booth.biodata_nik,
          durasi: booth.durasi,
          penyewa_nama: detail.nama || 'Unknown',
          kecamatan: booth.kecamatan,
          id: booth.booth_id_booth || 'Unknown',
          penyewa: detail.nama || 'Unknown',
          ktpImage: detail.foto_ktp || '/placeholder.svg?height=200&width=320',
          no_hp: detail.no_hp || 'Unknown',
          alamat_domisili: detail.alamat_domisili || 'Unknown',
          nik: detail.nik || 'Unknown',
          jenis_kelamin: detail.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          awal_penyewaan: new Date(detail.awal_penyewaan).toLocaleDateString() || 'Unknown',
          akhir_penyewaan: new Date(detail.akhir_penyewaan).toLocaleDateString() || 'Unknown',
          riwayat_pembayaran: detail.riwayat_pembayaran || 'Unknown',
          riwayat_kerusakan: detail.riwayat_kerusakan || 'Unknown',
        };
        setSelectedBooth(formattedBooth);
      }
    } catch (error) {
      console.error("Error fetching booth details:", error);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch Pendapatan
        const resPendapatan = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pemantauan-bisnis/pendapatan`, { headers: { Authorization: `Bearer ${token}` } });
        if (resPendapatan.data.success) setTotalPendapatan(resPendapatan.data.totalPendapatan || 0);

        // Fetch Denda Aktif
        const resDenda = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pemantauan-bisnis/denda-aktif`, { headers: { Authorization: `Bearer ${token}` } });
        if (resDenda.data.success) setDendaAktif(resDenda.data.data.total_denda_aktif || 0);

        // Fetch Utilisasi (Inspeksi)
        const resUtil = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pemantauan-bisnis/utilisasi-aset`, { headers: { Authorization: `Bearer ${token}` } });
        if (resUtil.data.success) setInspeksiBoothCount(resUtil.data.data.inspeksi || 0);

        // Fetch Booth Disewa
        const resSewa = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan`, { headers: { Authorization: `Bearer ${token}` } });
        if (resSewa.data.success && resSewa.data.data) {
          const activeRentals = Array.from(
            new Map(
              resSewa.data.data
                .filter((b: Booth) => b.status === 'DISEWA' || b.status === 'INSPEKSI')
                .map((booth: Booth) => [booth.id_sewa, booth])
            ).values()
          );
          const boothsWithDetails = await Promise.all(
            activeRentals.map(async (booth: Booth) => {
              const name = await fetchBiodataName(booth.biodata_nik);
              let kecamatan = 'Unknown';
              if (booth.lokasi) {
                const [lat, lng] = booth.lokasi.split(',').map(coord => parseFloat(coord));
                if (!isNaN(lat) && !isNaN(lng)) {
                  kecamatan = await fetchKecamatanFromCoordinates(lat, lng);
                }
              }
              return { ...booth, penyewa_nama: name || 'Unknown', kecamatan };
            })
          );
          setBoothData(boothsWithDetails);
          setRentedBoothCount(boothsWithDetails.filter(b => b.status === 'DISEWA').length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [])

  return (
    <div className="mx-auto p-4 space-y-4 bg-gray-100 min-h-screen pb-32">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button className="bg-white p-4 flex flex-col rounded-lg shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition" onClick={openTabModal}>
          <h2 className="text-xs font-bold text-gray-500 uppercase">Total Pendapatan</h2>
          <p className="text-2xl font-bold text-primary mt-1">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
        </button>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase">Booth Disewakan</h2>
          <p className="text-2xl font-bold text-blue-600 mt-1">{rentedBoothCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase">Booth Dalam Inspeksi</h2>
          <p className="text-2xl font-bold text-purple-600 mt-1">{inspeksiBoothCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase">Denda Aktif</h2>
          <p className="text-2xl font-bold text-red-600 mt-1">Rp {Number(dendaAktif).toLocaleString('id-ID')}</p>
        </div>
      </div>

      <TabModalPendapatan
        isOpen={isTabModalPendapatanOpen}
        onClose={closeTabModal} />
      
      <LocationPemantauan focusBoothId={focusBoothId} />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className='font-bold text-gray-800 text-lg'>Data Penyewaan Booth</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('monitoring')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'monitoring'
                  ? 'bg-primary text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monitoring Aktif
            </button>
            <button
              onClick={() => handleTabChange('arsip')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'arsip'
                  ? 'bg-gray-700 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🗄️ Arsip Penyewaan
            </button>
          </div>
        </div>

        {/* Tab: Monitoring Aktif */}
        {activeTab === 'monitoring' && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">ID Booth</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Status</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Penyewa</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Lokasi</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {boothData.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-500">Tidak ada booth aktif.</td></tr>
                  ) : boothData.map((booth) => (
                    <tr 
                      key={booth.id_sewa} 
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${focusBoothId === booth.booth_id_booth ? 'bg-blue-50 border-l-4 border-primary' : ''}`}
                      onClick={() => setFocusBoothId(booth.booth_id_booth)}
                    >
                      <td className="px-4 py-3 border-b font-medium text-gray-800">{booth.booth_id_booth}</td>
                      <td className="px-4 py-3 border-b">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${booth.status === 'INSPEKSI' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {booth.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-700">{booth.penyewa_nama || booth.biodata_nik}</td>
                      <td className="px-4 py-3 border-b text-gray-700">{booth.kecamatan || 'Unknown'}</td>
                      <td className="px-4 py-3 border-b text-center">
                        <button
                          className="font-semibold text-primary bg-primary bg-opacity-10 py-1.5 px-3 rounded hover:bg-opacity-20 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetailClick(booth);
                          }}
                        >
                          Detail Sewa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {boothData.map((booth) => (
                <PemantauanBoothCard
                  key={booth.id_sewa}
                  booth={{
                    id: booth.booth_id_booth || 'Unknown',
                    penyewa: booth.penyewa_nama || 'Unknown',
                    lokasi: booth.kecamatan || 'Unknown',
                  }}
                  onDetailClick={() => handleDetailClick(booth)}
                />
              ))}
            </div>
          </>
        )}

        {/* Tab: Arsip Penyewaan */}
        {activeTab === 'arsip' && (
          <div className="overflow-x-auto">
            {isLoadingArchive ? (
              <div className="py-10 text-center text-gray-500">Memuat arsip...</div>
            ) : (
              <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">ID Sewa</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">ID Booth</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Status</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Penyewa (NIK)</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Mulai Sewa</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Akhir Sewa</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Durasi</th>
                    <th className="px-4 py-3 border-b text-gray-600 font-semibold">Denda</th>
                  </tr>
                </thead>
                <tbody>
                  {archiveData.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Belum ada arsip penyewaan.</td></tr>
                  ) : archiveData.map((booth) => (
                    <tr key={booth.id_sewa} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b text-gray-700">#{booth.id_sewa}</td>
                      <td className="px-4 py-3 border-b font-medium text-gray-800">{booth.booth_id_booth || '-'}</td>
                      <td className="px-4 py-3 border-b">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                          booth.status === 'SELESAI'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {booth.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-700">
                        <div>{booth.penyewa_nama || '-'}</div>
                        <div className="text-xs text-gray-400">{booth.biodata_nik}</div>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-600">
                        {booth.mulai_sewa ? new Date(booth.mulai_sewa).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-600">
                        {booth.akhir_sewa ? new Date(booth.akhir_sewa).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-600">{booth.durasi} bln</td>
                      <td className="px-4 py-3 border-b">
                        <span className={booth.denda && booth.denda > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                          {booth.denda && booth.denda > 0 ? `Rp ${Number(booth.denda).toLocaleString('id-ID')}` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {selectedBooth && (
        <PemantauanBooth
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          boothData={selectedBooth} 
        />
      )}
    </div>
  )
}
