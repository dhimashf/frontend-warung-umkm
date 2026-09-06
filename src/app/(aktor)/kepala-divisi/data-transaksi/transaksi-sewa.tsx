"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BsJournalPlus } from "react-icons/bs";
import AddBayarSewaModal from "@/components/TambahPembayaranSewaModal"; // Impor komponen modal

interface PenyewaanData {
  biodata_nik: string;
  id_sewa: string;
  booth_id_booth: string;
  nama_penyewa: string;
  durasi: string;
}

const RiwayatPenyewaan = () => {
  const router = useRouter();
  const [dataPenyewaan, setDataPenyewaan] = useState<PenyewaanData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State untuk modal

  // Mengambil data penyewaan dan nama penyewa
  useEffect(() => {
    const fetchPenyewaanData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const penyewaanResponse = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/api/penyewaan", config
        );
        const penyewaanData = penyewaanResponse.data.data;
  
        // Filter data dengan booth_id_booth yang tidak kosong atau null
        const filteredData = penyewaanData.filter(
          (item: PenyewaanData) => item.booth_id_booth && item.booth_id_booth.trim() !== ""
        );
  
        const updatedData = await Promise.all(
          filteredData.map(async (item: PenyewaanData) => {
            const biodataResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/biodata/nik/${item.biodata_nik}`, config
            );
            const namaPenyewa = biodataResponse.data.data.nama;
            return {
              id_sewa: item.id_sewa.toString(),
              booth_id_booth: item.booth_id_booth,
              nama_penyewa: namaPenyewa,
              durasi: `${item.durasi} Bulan`,
            };
          })
        );
  
        setDataPenyewaan(updatedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
  
    fetchPenyewaanData();
  }, []);
  

  if (loading) {
    return <p className="text-primary">Loading...</p>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsModalOpen(true)} // Buka modal saat tombol diklik
        className="absolute right-1 -top-16 bg-primary hover:bg-opacity-50 text-black hover:text-black px-6 sm:px-4 py-2 rounded-lg flex items-center"
      >
        <BsJournalPlus className="sm:mr-2 mr-0 text-white text-lg sm:text-xl" />
        <span className="text-white hidden md:inline"> Pembayaran Sewa</span>
      </button>

      {/* Modal Pembayaran Sewa */}
      <AddBayarSewaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Tutup modal
      />

      <div className="overflow-x-auto shadow-2xl shadow-primary rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase border-b bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID Sewa</th>
              <th scope="col" className="px-6 py-3">ID Booth</th>
              <th scope="col" className="px-6 py-3">Nama Penyewa</th>
              <th scope="col" className="px-6 py-3">Durasi</th>
              <th scope="col" className="px-6 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {dataPenyewaan.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.id_sewa}
                </td>
                <td className="px-6 py-4">{item.booth_id_booth}</td>
                <td className="px-6 py-4">{item.nama_penyewa}</td>
                <td className="px-6 py-4">{item.durasi}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => router.push(`data-transaksi/sewa/${item.id_sewa}`)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiwayatPenyewaan;
