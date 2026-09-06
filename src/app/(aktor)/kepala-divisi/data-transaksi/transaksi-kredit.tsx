import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BsJournalPlus, BsTrash } from "react-icons/bs";
import MultiStepForm from "@/components/ModalKredit";
import ModalStep3 from "@/components/AngsuranKreditModal";
import axios from "axios";

interface Pembelian {
  id: number;
  tanggal_transaksi: string;
  nama: string;
  tenor: number;
  jenis_produk: string;
  jumlah_bukti: number;
  buktiError: boolean;
  produkError: boolean;
}

const TransaksiKredit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAngsuranModalOpen, setIsAngsuranModalOpen] = useState(false);
  const [transaksi, setTransaksi] = useState<Pembelian[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchTransaksi = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const pembelianResponse = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/api/pembelian/CREDIT", config
        );
        const pembelianData = pembelianResponse.data.data;

        const transaksiData = await Promise.all(
          pembelianData.map(async (item: Pembelian) => {
            let jumlah_bukti = 0;
            let jenis_produk = "N/A";
            let buktiError = false;
            let produkError = false;

            try {
              const buktiResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/bukti/${item.id}`, config
              );
              jumlah_bukti = buktiResponse.data.data.length - 1;
            } catch (error) {
              buktiError = true;
              console.error("Error fetching bukti data:", error);
            }

            try {
              const produkResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/produk/${item.id}`, config
              );
              if (produkResponse.data.data.length > 0) {
                jenis_produk = produkResponse.data.data[0]?.jenis_produk || "N/A";
              } else if (produkResponse.data.data.length === 0) {
                produkError = true;
              }
            } catch (error) {
              produkError = true;
              console.error("Error fetching produk data:", error);
            }
            
            return {
              id: item.id,
              tanggal_transaksi: item.tanggal_transaksi.split("T")[0],
              nama: item.nama,
              tenor: item.tenor,
              jenis_produk,
              jumlah_bukti,
              buktiError,
              produkError,
            };
          })
        );
        
        setTransaksi(transaksiData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTransaksi();
  }, []);

  const handleDelete = async (id: number, buktiError: boolean, produkError: boolean) => {
    try {
      console.log("Nilai buktiError:", buktiError);
      console.log("Nilai produkError:", produkError);
      console.log("ID yang akan dihapus:", id);
  
      if (buktiError && produkError) {
        console.log("Kondisi: buktiError && produkError");
        // Hapus pembelian langsung
        
        const deletePembelian = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/pembelian/${id}`);
        console.log("Pembelian berhasil dihapus:", deletePembelian.data);
      } else if (buktiError) {
        console.log("Kondisi: buktiError saja");
        // Hapus produk terlebih dahulu
        console.log("Menghapus produk terlebih dahulu...");
        const deleteProduk = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/produk/${id}`);
        console.log("Produk berhasil dihapus:", deleteProduk.data);
        // Hapus pembelian setelah produk berhasil dihapus
        const deletePembelian = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/pembelian/${id}`);
        console.log("Pembelian berhasil dihapus:", deletePembelian.data);

      } else {
        console.log("Tidak ada kondisi yang terpenuhi.");
      }
  
      // Refresh data setelah penghapusan
      window.location.reload();
      console.log("Data transaksi diperbarui.");
      
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        console.error("Error deleting data:", error.response?.data || error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };
  
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleOpenTransaksiModal = () => {
    setIsModalOpen(true);
    setDropdownOpen(false);
  };

  const handleOpenAngsuranModal = () => {
    setIsAngsuranModalOpen(true);
    setDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsAngsuranModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <div className="absolute right-1 -top-16">
        <button
          onClick={toggleDropdown}
          className="text-white bg-primary hover:bg-opacity-50 hover:text-black px-6 sm:px-4 py-2 rounded-lg flex items-center"
        >
          <BsJournalPlus className="sm:mr-2 mr-0 text-lg sm:text-xl" />
          <span className="hidden md:inline">Tambah Riwayat</span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
            <button
              onClick={handleOpenTransaksiModal}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Transaksi Kredit
            </button>
            <button
              onClick={handleOpenAngsuranModal}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Angsuran Kredit
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <MultiStepForm isOpen={isModalOpen} onClose={handleCloseModal}  />
      <ModalStep3 isOpen={isAngsuranModalOpen} onClose={handleCloseModal} />




      {/* Tabel Transaksi */}
      <div className="overflow-x-auto shadow-2xl shadow-primary rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th scope="col" className="px-6 py-3">Tanggal</th>
              <th scope="col" className="px-6 py-3">Nama Pembeli</th>
              <th scope="col" className="px-6 py-3">Nama Barang</th>
              <th scope="col" className="px-6 py-3">Proses Cicilan</th>
              <th scope="col" className="px-6 py-3">Status Cicilan</th>
              <th scope="col" className="px-6 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.tanggal_transaksi}
                </td>
                <td className="px-6 py-4">{item.nama}</td>
                <td className="px-6 py-4">{item.jenis_produk}</td>
                <td className="px-6 py-4">{item.jumlah_bukti} / {item.tenor}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${item.jumlah_bukti == item.tenor
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {item.jumlah_bukti == item.tenor ? "Lunas" : "Belum Lunas"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                {(item.buktiError || item.produkError) && (
                    <button
                      onClick={() => handleDelete(item.id, item.buktiError, item.produkError)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <BsTrash />
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`data-transaksi/kredit/${item.id}`)}
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

export default TransaksiKredit;
