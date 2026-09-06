"use client";

import { useState, useEffect } from "react";
import ImageModal from "@/components/ImageModal";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdShield, MdWarning, MdCheckCircle, MdAccessTime, MdCancel } from "react-icons/md";

interface PaymentHistory {
  id: number;
  id_sewa: number;
  tanggal: string;
  bukti: string;
  jumlah: number;
}

interface BoothData {
  id_sewa: number;
  mulai_sewa: string;
  akhir_sewa: string;
  lokasi: string;
  booth_id_booth: string;
  durasi: number;
  status: string;
  deposit: number;
  deposit_status: string;
  denda: number;
  denda_berjalan: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  MENUNGGU: { label: "Menunggu Pembayaran / Upload Bukti", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-300", icon: MdAccessTime },
  "MENUNGGU VERIFIKASI": { label: "Menunggu Verifikasi Admin", color: "text-indigo-700", bg: "bg-indigo-100 border-indigo-300", icon: MdAccessTime },
  DISETUJUI: { label: "Disetujui", color: "text-blue-700", bg: "bg-blue-100 border-blue-300", icon: MdCheckCircle },
  DITOLAK: { label: "Ditolak", color: "text-red-700", bg: "bg-red-100 border-red-300", icon: MdCancel },
  DISEWA: { label: "Sedang Disewa", color: "text-green-700", bg: "bg-green-100 border-green-300", icon: MdCheckCircle },
  INSPEKSI: { label: "Dalam Proses Inspeksi", color: "text-purple-700", bg: "bg-purple-100 border-purple-300", icon: MdAccessTime },
  SELESAI: { label: "Selesai", color: "text-gray-700", bg: "bg-gray-100 border-gray-300", icon: MdCheckCircle },
};

const DEPOSIT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  "BELUM DIBAYAR": { label: "Belum Dibayar", color: "text-yellow-600" },
  "DIBAYAR": { label: "Telah Dibayar", color: "text-green-600" },
  "DIKEMBALIKAN": { label: "Dikembalikan", color: "text-blue-600" },
  "DIPOTONG": { label: "Dipotong (Kerusakan)", color: "text-red-600" },
};

const BoothSaya = () => {
  const [data, setData] = useState<BoothData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUploadBukti = async () => {
    if (!uploadFile || !data) return;
    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("bukti_bayar", uploadFile);
    // Sewa = durasi * 300000. Total = Sewa + Deposit
    const totalSewa = (data.durasi * 300000) + (data.deposit || 200000);
    formData.append("jumlah", totalSewa.toString());

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/bayar/${data.id_sewa}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        alert("Bukti pembayaran berhasil diunggah.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error upload bukti:", error);
      alert("Gagal mengunggah bukti pembayaran.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const biodata = localStorage.getItem("biodata");
      const token = localStorage.getItem("token");
      if (!biodata) return;

      setIsLoading(true);
      try {
        const { nik } = JSON.parse(biodata);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/nik/${nik}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success && response.data.data.length > 0) {
          // Ambil penyewaan yang paling aktif (prioritas status DISEWA > INSPEKSI > MENUNGGU VERIFIKASI > DISETUJUI > MENUNGGU)
          const priority = ['DISEWA', 'INSPEKSI', 'MENUNGGU VERIFIKASI', 'DISETUJUI', 'MENUNGGU', 'DITOLAK', 'SELESAI'];
          const sorted = response.data.data.sort((a: BoothData, b: BoothData) => {
            return priority.indexOf(a.status) - priority.indexOf(b.status);
          });
          setData(sorted[0]);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!data || !data.id_sewa) return;
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sewa/${data.id_sewa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) setPaymentHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
    };
    fetchPaymentHistory();
  }, [data]);

  useEffect(() => {
    if (data?.lokasi && data.mulai_sewa) {
      const mapContainer = document.getElementById("map");
      if (!mapContainer) return;
      const [lat, lng] = data.lokasi.split(",").map(Number);
      const map = L.map("map").setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup("<b>Booth Anda</b>").openPopup();
      return () => { map.remove(); };
    }
  }, [data]);

  const isOverdue = data?.status === 'DISEWA' && data?.akhir_sewa
    ? new Date() > new Date(data.akhir_sewa) : false;

  const dendaDisplay = data?.denda_berjalan || data?.denda || 0;

  if (isLoading) {
    return (
      <div className="fixed mt-12 ml-64 inset-0 z-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Memuat data...</h1>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl sm:mx-auto mx-3 mt-8 bg-white p-6 rounded-lg shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">Anda belum mengajukan penyewaan</h1>
        <button
          onClick={() => router.push("/biodata-baru/pengajuan-sewa")}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-70"
        >
          Ajukan Penyewaan Sekarang
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[data.status] || STATUS_CONFIG["MENUNGGU"];
  const StatusIcon = statusInfo.icon;
  const depositInfo = DEPOSIT_STATUS_CONFIG[data.deposit_status] || DEPOSIT_STATUS_CONFIG["BELUM DIBAYAR"];

  // Tampilan untuk status MENUNGGU atau MENUNGGU VERIFIKASI (belum ada booth/tanggal)
  if (data.status === 'MENUNGGU' || data.status === 'MENUNGGU VERIFIKASI' || data.status === 'DITOLAK') {
    return (
      <div className="p-6">
        <div className={`mx-auto max-w-2xl px-6 py-6 border rounded-lg shadow-xl ${statusInfo.bg}`}>
          <div className={`flex items-center gap-2 font-semibold text-lg ${statusInfo.color}`}>
            <StatusIcon className="text-2xl" />
            <span>{statusInfo.label}</span>
          </div>
          {data.status === 'MENUNGGU' && (
            <div className="mt-4 border-t pt-4 border-yellow-200">
              <p className="text-gray-700 text-sm mb-4">
                Pengajuan sewa Anda telah dicatat. Silakan lakukan pembayaran (Biaya Sewa + Deposit) dan unggah bukti transfer agar Kepala Divisi dapat menyetujui pengajuan Anda.
              </p>
              <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                <p className="font-semibold text-gray-800">Total Tagihan:</p>
                <p className="text-xl font-bold text-primary">Rp {((data.durasi * 300000) + (data.deposit || 200000)).toLocaleString("id-ID")}</p>
                <p className="text-xs text-gray-500 mt-1">(Sewa {data.durasi} bulan + Deposit Jaminan)</p>
              </div>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                className="w-full border p-2 rounded mb-3 text-sm bg-white"
              />
              <button
                onClick={handleUploadBukti}
                disabled={!uploadFile || isUploading}
                className={`w-full py-2 rounded-lg text-white font-medium ${!uploadFile || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-80'}`}
              >
                {isUploading ? 'Mengunggah...' : 'Unggah Bukti Pembayaran'}
              </button>
            </div>
          )}
          {data.status === 'MENUNGGU VERIFIKASI' && (
            <p className="mt-2 text-indigo-700 text-sm">
              Bukti pembayaran Anda sedang diverifikasi oleh Kepala Divisi. Booth Anda akan segera disiapkan!
            </p>
          )}
          {data.status === 'DITOLAK' && (
            <div className="mt-2">
              <p className="text-red-600 text-sm">Pengajuan sewa Anda ditolak. Silakan hubungi Kepala Divisi atau ajukan kembali.</p>
              <button
                onClick={() => router.push("/biodata-baru/pengajuan-sewa")}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-80"
              >
                Ajukan Ulang
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Banner Keterlambatan */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-400 rounded-lg p-4 flex items-start gap-3">
          <MdWarning className="text-red-500 text-2xl flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Perhatian: Masa Sewa Telah Berakhir!</h3>
            <p className="text-red-700 text-sm mt-1">
              Masa sewa Anda telah berakhir. Denda keterlambatan sebesar{" "}
              <strong>Rp {dendaDisplay.toLocaleString("id-ID")}</strong> sedang berjalan (Rp 10.000/hari).
              Segera kembalikan booth untuk menghentikan akumulasi denda.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-primary">Informasi Booth Saya</h1>
          <div className="flex gap-2 items-center">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon />
              <span>{statusInfo.label}</span>
            </div>
            {(data.status === 'DISEWA' || data.status === 'INSPEKSI' || data.status === 'SELESAI') && (
              <button 
                onClick={() => window.print()}
                className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2"
              >
                🖨️ Cetak Invoice
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "ID Sewa", value: `#${data.id_sewa}` },
            { label: "ID Booth", value: data.booth_id_booth || "Menunggu penugasan" },
            { label: "Mulai Sewa", value: data.mulai_sewa ? new Date(data.mulai_sewa).toLocaleDateString("id-ID") : "-" },
            { label: "Akhir Sewa", value: data.akhir_sewa ? new Date(data.akhir_sewa).toLocaleDateString("id-ID") : "-" },
            { label: "Durasi", value: `${data.durasi} Bulan` },
            { label: "Biaya Sewa", value: `Rp ${(data.durasi * 300000).toLocaleString("id-ID")}` },
          ].map((item, i) => (
            <div key={i} className="flex flex-col border p-4 rounded-lg">
              <label className="font-semibold text-gray-700 text-sm">{item.label}</label>
              <p className="text-gray-600 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Deposit & Denda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Deposit */}
          <div className="border p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MdShield className="text-blue-500 text-xl" />
              <label className="font-semibold text-gray-700 text-sm">Deposit/Jaminan</label>
            </div>
            <p className="text-lg font-bold text-gray-800">Rp {(data.deposit || 200000).toLocaleString("id-ID")}</p>
            <p className={`text-sm font-medium mt-1 ${depositInfo.color}`}>{depositInfo.label}</p>
          </div>
          {/* Denda */}
          <div className={`border p-4 rounded-lg ${isOverdue ? "border-red-300 bg-red-50" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <MdWarning className={`text-xl ${isOverdue ? "text-red-500" : "text-gray-400"}`} />
              <label className="font-semibold text-gray-700 text-sm">Denda Keterlambatan</label>
            </div>
            <p className={`text-lg font-bold ${isOverdue ? "text-red-600" : "text-gray-800"}`}>
              Rp {dendaDisplay.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isOverdue ? "Terus bertambah Rp 10.000/hari" : "Belum ada denda"}
            </p>
          </div>
        </div>

        {/* Status INSPEKSI Info */}
        {data.status === 'INSPEKSI' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 text-sm">Booth Dalam Proses Inspeksi</h3>
            <p className="text-purple-700 text-sm mt-1">
              Booth Anda sedang diperiksa oleh Kepala Divisi. Keputusan mengenai deposit dan denda akan segera diinformasikan.
            </p>
          </div>
        )}

        {/* Peta Lokasi */}
        {data.lokasi && (
          <div className="w-full mb-6">
            <div className="flex flex-col border p-4 rounded-lg">
              <label className="font-semibold text-gray-700 mb-2">Lokasi Booth</label>
              <p className="text-gray-500 text-sm mb-2">{data.lokasi}</p>
              <div id="map" className="w-full z-0 h-64 sm:h-96 rounded-lg" />
            </div>
          </div>
        )}

        {/* Riwayat Pembayaran */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Riwayat Pembayaran Sewa</h2>
          {paymentHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada riwayat pembayaran.</p>
          ) : (
            <table className="table-auto w-full border-collapse border text-black border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-sm">Tanggal</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Jumlah</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {new Date(payment.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                      Rp {payment.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <button
                        onClick={() => { setSelectedImage(payment.bukti); setIsModalOpen(true); }}
                        className="text-primary underline hover:opacity-70"
                      >
                        Lihat Bukti
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ImageModal isOpen={isModalOpen} imageSrc={selectedImage} onClose={() => { setIsModalOpen(false); setSelectedImage(""); }} />
    </div>
  );
};

export default BoothSaya;
