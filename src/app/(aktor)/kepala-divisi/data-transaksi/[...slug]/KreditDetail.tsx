"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdOutlineArrowBackIos } from "react-icons/md";
import ImageModal from "@/components/ImageModal";
import axios from "axios";

interface Produk {
  jenis_produk: string;
  ukuran: string;
  harga: number;
  jumlah: number;
  
}

interface Pembayaran{
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
  foto_ktp: string;
  nik : string;
  alamat_domisili: string;

  produk: Produk[];
  totalTransaksi: number;
  dp: number;
  tenor: number;

  bukti: Pembayaran[];
}

// Data transaksi diletakkan di luar fungsi KreditDetail

const KreditDetail: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string[]; // Ambil array slug
  const id = slug[slug.length - 1]; // Ambil ID dari bagian terakhir slug
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
    const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

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

        // Fetch data produk
        const produkRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/produk/${id}`, config
        );

        // Fetch data bukti
        const buktiRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bukti/${id}`, config
        );

        // Ambil dan filter data
        const pembelian = pembelianRes.data.data[0];
        const produk = produkRes.data.data;
        const bukti = buktiRes.data.data;
        const dp = buktiRes.data.data[0].jumlah;
        
        console.log(bukti);
        console.log(pembelian);
        console.log(produk);
        console.log(dp);
        
        const totalTransaksi = produkRes.data.totalTransaksi;
        // Buat objek transaksi tanpa properti null
        setTransaksi({
          id: id,
          tanggal_transaksi: pembelian.tanggal_transaksi.split("T")[0],
          nama: pembelian.nama,
          alamat: pembelian.alamat,
          no_hp: pembelian.no_hp,
          foto_ktp: pembelian.foto_ktp,
          nik: pembelian.nik,
          alamat_domisili: pembelian.alamat_domisili,

          dp: dp,
          tenor: pembelian.tenor,
          produk,
          bukti,
          totalTransaksi,
        });
        console.log("Produk:", produk)
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
          <span className="text-gray-900 font-semibold">Detail Transaksi Kredit</span>
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
          Detail Transaksi Kredit
        </h1>

        {/* Data Transaksi */}
        <div className="mb-6">
          <div className="grid mb-4 grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "ID Transaksi", value: transaksi?.id },
              { label: "Tanggal Transaksi", value: transaksi?.tanggal_transaksi },
            ].map((item, index) => (
              <div key={index} className="flex flex-col border p-4 rounded-lg">
                <label className="font-semibold text-gray-700">{item.label}</label>
                <p className="text-gray-600">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Identitas Pembeli */}
          <h3 className="font-semibold text-lg text-black mb-2">Pembeli</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Nama Pembeli", value: transaksi?.nama },
              { label: "No. HP", value: transaksi?.no_hp },
              { label: "Alamat", value: transaksi?.alamat },
            ].map((item, index) => (
              <div key={index} className="flex flex-col border p-4 rounded-lg">
                <label className="font-semibold text-gray-700">{item.label}</label>
                <p className="text-gray-600">{item.value}</p>
              </div>
            ))}

            {/* Foto KTP */}
            <div className="flex flex-col border p-4 rounded-lg">
              <label className="font-semibold text-gray-700">Foto KTP</label>
              <button
                onClick={() => openModal(transaksi?.foto_ktp ?? "")}
                className="text-primary text-left underline hover:text-primary-dark"
              >
                Lihat Foto KTP
              </button>
            </div>
          </div>

          {/* Produk */}
<div className="mb-4">
  <h3 className="font-semibold text-lg text-black mb-2">Produk</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[ 
      { label: "Nama Barang", value: transaksi?.produk?.[0]?.jenis_produk }, // Access product at index 0
      { label: "Ukuran", value: transaksi?.produk?.[0]?.ukuran }, // Access product at index 0
      { label: "Harga", value: transaksi?.produk?.[0]?.harga ? `Rp ${transaksi.produk[0].harga.toLocaleString()}` : "Rp 0" } // Access price at index 0
    ].map((item, index) => (
      <div key={index} className="flex flex-col border p-4 rounded-lg">
        <label className="font-semibold text-gray-700">{item.label}</label>
        <p className="text-gray-600">{item.value}</p>
      </div>
    ))}
  </div>
</div>


          {/* Cicilan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { label: "Total Pembelian", value: transaksi?.totalTransaksi ? `Rp ${transaksi.totalTransaksi.toLocaleString()}` : "Rp 0" },
              { label: "DP", value: transaksi?.dp ? `Rp ${transaksi.dp.toLocaleString()}` : "Rp 0" },
              { label: "Tenor (Bulan)", value: transaksi?.tenor },
              { label: "Cicilan Per Bulan", value: transaksi && transaksi.totalTransaksi && transaksi.tenor
                  ? `Rp ${(transaksi.totalTransaksi - transaksi.dp) / transaksi.tenor}` : "Rp 0" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col border p-4 rounded-lg">
                <label className="font-semibold text-gray-700">{item.label}</label>
                <p className="text-gray-600">{item.value}</p>
              </div>
            ))}
          </div>

</div>
    {/* Riwayat Pembayaran */}
<div>
  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Riwayat Pembayaran</h2>
  <div className="flex flex-row-fit border py-2 px-4 rounded-lg mb-6">
    <label className="font-semibold mr-2 text-gray-700">Proses Cicilan : </label>
    <p className="text-gray-600">Proses Cicilan</p>
  </div>
  
  {transaksi?.bukti && transaksi.bukti.length > 0 ?  (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-left">
            <th className="py-3 px-4 border-b">Tanggal</th>
            <th className="py-3 px-4 border-b">Pembayaran Ke</th>
            <th className="py-3 px-4 border-b">Jumlah</th>
            <th className="py-3 px-4 border-b">Bukti Pembayaran</th>
          </tr>
        </thead>
        <tbody>
  {transaksi?.bukti.map((pay, index) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="py-3 px-4 border-b text-gray-700">{pay.tanggal}</td>
      <td className="py-3 px-4 border-b text-gray-700">{index}</td>
      <td className="py-3 px-4 border-b text-gray-700">
        Rp {pay.jumlah ? pay.jumlah.toLocaleString() : '0'}
      </td>
      <td className="py-3 px-4 border-b">
        <button
          onClick={() => openModal(pay.bukti)}
          className="text-primary underline hover:text-primary-dark"
        >
          Lihat Bukti
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  ) : (
    <p className="text-gray-500">Belum ada pembayaran.</p>
  )}
</div>

  </div>

  {/* Modal Gambar */}
  <ImageModal isOpen={isModalOpen} imageSrc={selectedImage} onClose={closeModal} />
</div>

  );
};

export default KreditDetail;
