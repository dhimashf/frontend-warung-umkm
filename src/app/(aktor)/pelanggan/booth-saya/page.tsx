"use client";

import ImageModal from "@/components/ImageModal";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdAccessTime, MdCancel, MdCheckCircle, MdShield, MdWarning } from "react-icons/md";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface PaymentHistory {
  id: number;
  id_sewa: number;
  tanggal: string;
  bukti: string;
  jumlah: number;
  status_pembayaran?: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  catatan_penolakan?: string;
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
  const [customer, setCustomer] = useState({ nama: "-", nik: "-" });
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [jumlahPembayaran, setJumlahPembayaran] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPerpanjangModalOpen, setIsPerpanjangModalOpen] = useState(false);
  const [perpanjangBulan, setPerpanjangBulan] = useState(1);
  const [isPerpanjangLoading, setIsPerpanjangLoading] = useState(false);
  const router = useRouter();

  const handleUploadBukti = async () => {
    if (!uploadFile || !data) return;
    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("bukti_bayar", uploadFile);
    
    const totalTerbayar = paymentHistory
      .filter((payment) => payment.status_pembayaran === "DISETUJUI")
      .reduce((sum, p) => sum + Number(p.jumlah), 0);
    // Sewa = durasi * 300000. Total = Sewa + Deposit
    const durasi = Number.isSafeInteger(Number(data.durasi)) && Number(data.durasi) > 0
      ? Number(data.durasi)
      : 0;
    const deposit = Number.isFinite(Number(data.deposit)) && Number(data.deposit) >= 0
      ? Number(data.deposit)
      : 200000;
    const totalTagihan = (durasi * 300000) + deposit;
    const sisaTagihan = Math.max(0, totalTagihan - totalTerbayar);
    
    const jumlahBayar = Number(jumlahPembayaran);
    if (!Number.isFinite(jumlahBayar) || jumlahBayar <= 0 || jumlahBayar > sisaTagihan) {
      alert(`Nominal harus lebih besar dari Rp 0 dan maksimal Rp ${sisaTagihan.toLocaleString("id-ID")}.`);
      setIsUploading(false);
      return;
    }
    formData.append("jumlah", jumlahBayar.toString());

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

  const handlePerpanjang = async () => {
    if (!data) return;
    setIsPerpanjangLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/perpanjang/${data.id_sewa}`,
        { tambahan_durasi_bulan: perpanjangBulan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Berhasil memperpanjang sewa! Silakan lunasi tagihan tambahan Anda.");
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error perpanjang sewa:", error);
      alert(error.response?.data?.message || "Gagal memperpanjang sewa.");
    } finally {
      setIsPerpanjangLoading(false);
      setIsPerpanjangModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const biodata = localStorage.getItem("biodata");
      const token = localStorage.getItem("token");
      if (!biodata) return;

      setIsLoading(true);
      try {
        const biodataInfo = JSON.parse(biodata);
        const { nik } = biodataInfo;
        setCustomer({ nama: biodataInfo.nama || "-", nik: nik || "-" });
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

  const totalTerbayarDisetujui = paymentHistory
    .filter((payment) => payment.status_pembayaran === "DISETUJUI")
    .reduce((sum, p) => sum + Number(p.jumlah), 0);
  const durasi = data && Number.isSafeInteger(Number(data.durasi)) && Number(data.durasi) > 0
    ? Number(data.durasi)
    : 0;
  const deposit = data && Number.isFinite(Number(data.deposit)) && Number(data.deposit) >= 0
    ? Number(data.deposit)
    : 200000;
  const totalTagihan = data ? (durasi * 300000) + deposit : 0;
  const sisaTagihan = Math.max(0, totalTagihan - totalTerbayarDisetujui);

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal yang dibayar</label>
              <input
                type="number"
                min="1"
                max={totalTagihan}
                value={jumlahPembayaran}
                onChange={(e) => setJumlahPembayaran(e.target.value)}
                placeholder="Masukkan nominal sesuai bukti transfer"
                className="w-full border p-2 rounded mb-3 text-sm bg-white"
              />
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
              <div className="flex gap-2">
                {data.status === 'DISEWA' && (
                  <button 
                    onClick={() => setIsPerpanjangModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 font-semibold"
                  >
                    Perpanjang Sewa
                  </button>
                )}
                <button 
                  onClick={() => window.print()}
                  className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  🖨️ Cetak Invoice
                </button>
              </div>
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

        {/* Form Pelunasan (Jika ada Sisa Tagihan) */}
        {(sisaTagihan > 0 && (data.status === 'DISEWA' || data.status === 'INSPEKSI' || data.status === 'SELESAI')) && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">Tagihan Belum Lunas: Rp {sisaTagihan.toLocaleString("id-ID")}</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Anda memiliki sisa tagihan (misalnya dari perpanjangan sewa) yang harus dilunasi. 
              Silakan unggah bukti transfer sebesar <strong>Rp {sisaTagihan.toLocaleString("id-ID")}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                min="1"
                max={sisaTagihan}
                value={jumlahPembayaran}
                onChange={(e) => setJumlahPembayaran(e.target.value)}
                placeholder="Nominal pembayaran"
                className="sm:w-52 border p-2 rounded text-sm bg-white"
              />
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                className="flex-1 border p-2 rounded text-sm bg-white"
              />
              <button
                onClick={handleUploadBukti}
                disabled={!uploadFile || isUploading}
                className={`py-2 px-4 rounded-lg text-white font-medium whitespace-nowrap ${!uploadFile || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-80'}`}
              >
                {isUploading ? 'Mengunggah...' : 'Unggah Bukti Pelunasan'}
              </button>
            </div>
          </div>
        )}

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
                  <th className="border border-gray-300 px-4 py-2 text-sm">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-sm">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={`${payment.id}-${payment.tanggal}-${payment.jumlah}-${index}`} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {new Date(payment.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                      Rp {payment.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {payment.status_pembayaran === "DISETUJUI" ? "Disetujui" : payment.status_pembayaran === "DITOLAK" ? "Ditolak" : "Menunggu verifikasi"}
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

      <section className="print-invoice" aria-label="Invoice Warung UMKM">
        <div className="invoice-header">
          <div>
            <p className="invoice-brand">WARUNG UMKM</p>
            <p className="invoice-subtitle">Riau</p>
          </div>
          <div className="invoice-meta">
            <p className="invoice-title">INVOICE SEWA</p>
            <p>No. Invoice: INV-{data.id_sewa}</p>
            <p>Tanggal cetak: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="invoice-parties">
          <div>
            <p className="invoice-label">DITERBITKAN UNTUK</p>
            <p className="invoice-value">{customer.nama}</p>
            <p>NIK: {customer.nik}</p>
          </div>
          <div>
            <p className="invoice-label">STATUS TRANSAKSI</p>
            <p className="invoice-status">{statusInfo.label}</p>
            <p>Persetujuan pembayaran tercatat</p>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr><th>Deskripsi</th><th>Detail</th><th>Jumlah</th></tr>
          </thead>
          <tbody>
            <tr><td>Sewa booth</td><td>{durasi} bulan x Rp 300.000</td><td>{`Rp ${(durasi * 300000).toLocaleString("id-ID")}`}</td></tr>
            <tr><td>Deposit jaminan</td><td>{depositInfo.label}</td><td>{`Rp ${deposit.toLocaleString("id-ID")}`}</td></tr>
            {dendaDisplay > 0 && <tr><td>Denda keterlambatan</td><td>Biaya tambahan</td><td>{`Rp ${Number(dendaDisplay).toLocaleString("id-ID")}`}</td></tr>}
          </tbody>
          <tfoot>
            <tr><td colSpan={2}>TOTAL TAGIHAN</td><td>{`Rp ${totalTagihan.toLocaleString("id-ID")}`}</td></tr>
            <tr><td colSpan={2}>TOTAL DIBAYAR (DISETUJUI)</td><td>{`Rp ${totalTerbayarDisetujui.toLocaleString("id-ID")}`}</td></tr>
            <tr className="invoice-total"><td colSpan={2}>SISA TAGIHAN</td><td>{`Rp ${sisaTagihan.toLocaleString("id-ID")}`}</td></tr>
          </tfoot>
        </table>

        <div className="invoice-details">
          <div><span>Periode sewa</span><strong>{data.mulai_sewa ? new Date(data.mulai_sewa).toLocaleDateString("id-ID") : "-"} - {data.akhir_sewa ? new Date(data.akhir_sewa).toLocaleDateString("id-ID") : "-"}</strong></div>
          <div><span>ID Booth</span><strong>{data.booth_id_booth || "-"}</strong></div>
          <div><span>Lokasi</span><strong>{data.lokasi || "-"}</strong></div>
        </div>
        <p className="invoice-note">Invoice ini dicetak sebagai bukti transaksi sewa Warung UMKM.</p>
      </section>

      {/* Modal Perpanjang Sewa */}
      {isPerpanjangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Perpanjang Sewa</h2>
            <p className="text-sm text-gray-600 mb-4">
              Biaya perpanjangan adalah <strong>Rp 300.000 / bulan</strong>.
              Tanggal berakhir sewa Anda saat ini adalah <strong>{new Date(data.akhir_sewa).toLocaleDateString("id-ID")}</strong>.
            </p>
            
            <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi Tambahan (Bulan)</label>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setPerpanjangBulan(Math.max(1, perpanjangBulan - 1))}
                className="bg-gray-200 w-10 h-10 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300"
              >-</button>
              <span className="text-xl font-bold w-8 text-center">{perpanjangBulan}</span>
              <button 
                onClick={() => setPerpanjangBulan(Math.min(12, perpanjangBulan + 1))}
                className="bg-gray-200 w-10 h-10 rounded-lg flex items-center justify-center font-bold hover:bg-gray-300"
              >+</button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-6">
              <p className="text-sm text-blue-800">Total Tagihan Tambahan:</p>
              <p className="text-lg font-bold text-blue-900">Rp {(perpanjangBulan * 300000).toLocaleString("id-ID")}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsPerpanjangModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handlePerpanjang}
                disabled={isPerpanjangLoading}
                className="px-4 py-2 bg-primary text-white hover:opacity-90 rounded-lg font-medium transition disabled:bg-gray-400"
              >
                {isPerpanjangLoading ? 'Memproses...' : 'Konfirmasi Perpanjang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoothSaya;
