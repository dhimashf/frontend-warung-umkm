"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdOutlineArrowBackIos } from "react-icons/md";
import ImageModal from "@/components/ImageModal";
import axios from "axios";

interface Produk {
  ukuran: string;
  harga: number;
  jumlah: number;
  subtotal: number;
  jenis_produk: string;
}

interface Pembayaran {
  id: string;
  tanggal: string;
  bukti: string;
  jumlah: number;
}

interface Transaksi {
  id: string;
  tanggal_transaksi: string;
  nama: string;
  alamat: string;
  no_hp: string;
  jenis_kelamin: string;
  produk: Produk[];
  totalTransaksi: number;
  pembayaran: Pembayaran[];
}

// Data transaksi diletakkan di luar fungsi CashDetail


const CashDetail: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string[]; // Ambil array slug
  const id = slug[slug.length - 1]; // Ambil ID dari bagian terakhir slug
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
    
        // Fetch data pembelian
        const pembelianRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pembelian/id/${id}`, config
        );
    
        // Default values in case of error
        let produk = [];
        let pembayaran = [];
    
        try {
          // Fetch data produk
          const produkRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/produk/${id}`, config
          );
          produk = produkRes.data.data;
        } catch (produkError) {
          console.error('Error fetching produk:', produkError);
        }
    
        try {
          // Fetch data bukti
          const buktiRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/bukti/${id}`, config
          );
          pembayaran = buktiRes.data.data;
        } catch (buktiError) {
          console.error('Error fetching bukti:', buktiError);
        }
    
        const pembelian = pembelianRes.data.data[0];
        const totalTransaksi = produk.reduce((total: number, item : Produk) => total + item.subtotal, 0);
    
        // Set transaksi state with the fetched data
        setTransaksi({
          id: pembelian.id,
          tanggal_transaksi: pembelian.tanggal_transaksi.split("T")[0],
          nama: pembelian.nama,
          alamat: pembelian.alamat,
          no_hp: pembelian.no_hp,
          jenis_kelamin: pembelian.jenis_kelamin,
          produk,
          pembayaran,
          totalTransaksi,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Terjadi kesalahan saat memuat data.");
        } else {
          setError("Terjadi kesalahan yang tidak diketahui.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  const handleBack = () => {
    router.push("../"); // Navigasi kembali ke halaman sebelumnya
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-4">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => router.push("../")}
          >
            Data Transaksi
          </span>{" "}
          /{" "}
          <span className="text-primary font-semibold">Detail Transaksi Cash</span>
        </nav>

        {/* Tombol Kembali */}
        <button
          onClick={handleBack}
          className="flex items-center text-primary hover:underline mb-4"
        >
          <MdOutlineArrowBackIos className="mr-2" />
          Kembali
        </button>
      </div>

      <div className="mx-auto p-6 bg-foreground rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Detail Transaksi Cash
        </h1>

        {/* Data Transaksi */}
        <div className="mb-6">
          <div className="grid mb-4 grid-cols-1 md:grid-cols-2 gap-4">
            {[{ label: "ID Transaksi", value: transaksi?.id }, { label: "Tanggal Transaksi", value: transaksi?.tanggal_transaksi }].map(
              (item, index) => (
                <div key={index} className="flex flex-col border p-4 rounded-lg">
                  <label className="font-semibold text-gray-700">{item.label}</label>
                  <p className="text-gray-600">{item.value}</p>
                </div>
              )
            )}
          </div>
          {/* Identitas Pembeli */}
          <h3 className="font-semibold text-lg text-black mb-2">Pembeli</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[{ label: "Nama Pembeli", value: transaksi?.nama }, { label: "No. HP", value: transaksi?.no_hp }, { label: "Alamat", value: transaksi?.alamat }].map(
              (item, index) => (
                <div key={index} className="flex flex-col border p-4 rounded-lg">
                  <label className="font-semibold text-gray-700">{item.label}</label>
                  <p className="text-gray-600">{item.value}</p>
                </div>
              )
            )}

            {/* Foto Bukti Pembayaran */}
            <div className="flex flex-col border p-4 rounded-lg">
              <label className="font-semibold text-gray-700">Bukti Pembayaran</label>
              {transaksi?.pembayaran[0]?.bukti ? (
              <button
                onClick={() => openModal( transaksi?.pembayaran[0]?.bukti)}
                className="text-primary text-left underline hover:text-primary-dark"
              >
                Lihat Bukti Pembayaran
              </button>
            ) : (
              <p className="text-gray-500">Tidak ada bukti pembayaran</p>
            )}
            </div>
          </div>

          {/* Tabel Produk */}
          <div className="mb-4 text-black">
            <h3 className="font-semibold text-lg  mb-2">Produk</h3>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">Nama Produk</th>
                  <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">Ukuran</th>
                  <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">Harga</th>
                  <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">Jumlah</th>
                  <th className="px-4 py-2 border border-gray-300 text-left bg-gray-100">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaksi?.produk.map((produk, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border border-gray-300">{produk.jenis_produk}</td>
                    <td className="px-4 py-2 border border-gray-300">{produk.ukuran}</td>
                    <td className="px-4 py-2 border border-gray-300">Rp {produk.harga.toLocaleString()}</td>
                    <td className="px-4 py-2 border border-gray-300">{produk.jumlah}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      Rp {(produk.harga * produk.jumlah).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Transaksi */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-black mb-2">Total Transaksi</h3>
            <div className="flex flex-col border p-4 rounded-lg">
              <label className="font-semibold text-gray-700">Total</label>
              <p className="text-gray-600">Rp {transaksi?.totalTransaksi.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Gambar */}
      <ImageModal isOpen={isModalOpen} imageSrc={selectedImage} onClose={closeModal} />
    </div>
  );
};

export default CashDetail;
