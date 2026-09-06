"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsJournalPlus, BsTrash } from "react-icons/bs";
import { useRouter } from "next/navigation";
import MultiStepForm from "@/components/ModalCash";

interface Product {
  jumlah: number;
  subtotal: number;
}
interface FormData {
  id: string;
  tanggal_transaksi: string;
  nama: string;
  jumlah_produk: number;
  totalTransaksi: number;
}

const TransaksiCash: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<Record<string, { buktiError: boolean; produkError: boolean }>>({});


  useEffect(() => {
    const fetchTransaksiData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const transaksiResponse = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/pembelian/CASH", config);
        const transaksiData = transaksiResponse.data.data;

        const updatedData = await Promise.all(
          transaksiData.map(async (transaksi: FormData) => {
            let buktiError = false;
            let produkError = false;

            try {
              const productResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/produk/${transaksi.id}`, config);
              const productData = productResponse.data.data;

              if (productData.length === 0) {
                produkError = true;
              }

              const jumlahProduk = productData.reduce((total: number, item: Product) => total + item.jumlah, 0);
              const totalTransaksi = productData.reduce((total: number, item: Product) => total + item.subtotal, 0);

              try {
                const buktiResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bukti/${transaksi.id}`, config);
                if (!buktiResponse.data.data.length) {
                  buktiError = true;
                }
              } catch (error) {
                buktiError = true;
                console.error("Error fetching bukti data:", error);
              }

              // Update state for errors
              setErrorStatus((prev) => ({
                ...prev,
                [transaksi.id]: { buktiError, produkError },
              }));

              return {
                id: transaksi.id.toString(),
                tanggal_transaksi: transaksi.tanggal_transaksi.split("T")[0],
                nama: transaksi.nama,
                jumlah_produk: jumlahProduk,
                totalTransaksi: totalTransaksi,
              };
            } catch (error: unknown) {
              console.warn(`Error fetching data for transaksi ID ${transaksi.id}:`, error);
              return null;
            }
          })
        );

        setData(updatedData.filter((item) => item !== null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchTransaksiData();
  }, []);
  if (loading) {
    return <p className="text-primary">Loading...</p>;
  }

  // Fungsi untuk membuka modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

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
  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="absolute right-1 -top-16 text-white bg-primary hover:bg-opacity-50 hover:text-black px-6 sm:px-4 py-2 rounded-lg flex items-center"
      >
        <BsJournalPlus className="sm:mr-2 mr-0 text-white text-lg sm:text-xl" />
        <span className="text-white hidden md:inline">Transaksi Cash</span>
      </button>

      {/* Modal untuk MultiStepForm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <button
              onClick={closeModal}
              className="text-red-500 absolute top-3 right-3 hover:text-red-700"
            >
              ✕
            </button>
            <MultiStepForm onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Wrapper to enable horizontal scroll only for the table */}
      <div className="overflow-x-auto shadow-2xl shadow-primary rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase border-b bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Tanggal</th>
              <th scope="col" className="px-6 py-3 text-center">Nama</th>
              <th scope="col" className="px-6 py-3 text-center">Jumlah Produk</th>
              <th scope="col" className="px-6 py-3 text-center">Total Transaksi</th>
              <th scope="col" className="px-6 py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const { buktiError, produkError } = errorStatus[item.id] || {};
              return (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.tanggal_transaksi}</td>
                  <td className="px-6 py-4 text-center">{item.nama}</td>
                  <td className="px-6 py-4 text-center">{item.jumlah_produk}</td>
                  <td className="px-6 py-4 text-center">{item.totalTransaksi}</td>
                  <td className="px-6 py-4 text-right">
                    <div className=" flex flex-row items-center justify-end">
                      {(buktiError || produkError) && (
                        <div className="bg-red-700 p-2 mr-10 rounded-md">
                          <button
                            onClick={() => handleDelete(parseInt(item.id), buktiError, produkError)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <BsTrash className="text-white" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => router.push(`data-transaksi/cash/${item.id}`)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Detail
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransaksiCash;
