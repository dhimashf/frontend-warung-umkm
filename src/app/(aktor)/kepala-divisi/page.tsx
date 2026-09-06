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
          const activeRentals = resSewa.data.data.filter((b: Booth) => b.status === 'DISEWA' || b.status === 'INSPEKSI');
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
      
      <LocationPemantauan />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className='font-bold text-gray-800 text-lg'>Monitoring Aktif Penyewa Booth</h2>
        </div>
        
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
                <tr key={booth.id_sewa} className="hover:bg-gray-50">
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
                      onClick={() => handleDetailClick(booth)}
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
