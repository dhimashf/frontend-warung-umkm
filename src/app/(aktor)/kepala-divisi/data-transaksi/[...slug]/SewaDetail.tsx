"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdOutlineArrowBackIos, MdCheckCircle, MdAccessTime, MdCancel,
  MdShield, MdWarning, MdLocationOn, MdPrint, MdReceipt,
  MdPerson, MdHome, MdPhone, MdBadge
} from "react-icons/md";
import { FaStore } from "react-icons/fa";
import ImageModal from "@/components/ImageModal";
import axios from "axios";

interface Pembayaran {
  tanggal: string;
  jumlah: number;
  bukti: string;
}

interface PenyewaanDetail {
  id_sewa: string;
  id_booth: string;
  nama_penyewa: string;
  no_hp: string;
  nik: string;
  lokasi: string;
  durasi: number;
  harga: number;
  mulai_sewa: string;
  akhir_sewa: string;
  status: string;
  deposit: number;
  deposit_status: string;
  denda: number;
  denda_berjalan: number;
  pembayaran: Pembayaran[] | null;
  jumlah_dibayar: number;
  sisa: number;
  bukti_bayar?: string;
}

const STATUS_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; borderColor: string; barColor: string; icon: any }> = {
  MENUNGGU:              { label: "Menunggu Pembayaran",  textColor: "text-amber-700",   bgColor: "bg-amber-50",   borderColor: "border-amber-300",  barColor: "bg-amber-400",   icon: MdAccessTime },
  "MENUNGGU VERIFIKASI": { label: "Menunggu Verifikasi",  textColor: "text-indigo-700",  bgColor: "bg-indigo-50",  borderColor: "border-indigo-300", barColor: "bg-indigo-400",  icon: MdAccessTime },
  DISETUJUI:             { label: "Disetujui",            textColor: "text-blue-700",    bgColor: "bg-blue-50",    borderColor: "border-blue-300",   barColor: "bg-blue-500",    icon: MdCheckCircle },
  DITOLAK:               { label: "Ditolak",              textColor: "text-red-700",     bgColor: "bg-red-50",     borderColor: "border-red-300",    barColor: "bg-red-500",     icon: MdCancel },
  DISEWA:                { label: "Sedang Disewa",        textColor: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-300",barColor: "bg-emerald-500", icon: MdCheckCircle },
  INSPEKSI:              { label: "Dalam Inspeksi",       textColor: "text-purple-700",  bgColor: "bg-purple-50",  borderColor: "border-purple-300", barColor: "bg-purple-500",  icon: MdAccessTime },
  SELESAI:               { label: "Selesai",              textColor: "text-gray-600",    bgColor: "bg-gray-100",   borderColor: "border-gray-300",   barColor: "bg-gray-400",    icon: MdCheckCircle },
};

const DEPOSIT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "BELUM DIBAYAR": { label: "Belum Dibayar",       color: "text-amber-700", bg: "bg-amber-50" },
  "DIBAYAR":       { label: "Sudah Dibayar",        color: "text-green-700", bg: "bg-green-50" },
  "DIKEMBALIKAN":  { label: "Dikembalikan",         color: "text-blue-700",  bg: "bg-blue-50" },
  "DIPOTONG":      { label: "Dipotong (Kerusakan)", color: "text-red-700",   bg: "bg-red-50" },
};

const SewaDetail = () => {
  const params = useParams();
  const slug = params.slug as string[];
  const id = slug[slug.length - 1];
  const [detail, setDetail] = useState<PenyewaanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const resPenyewaan = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/penyewaan", config);
        const penyewaanData = resPenyewaan.data.data.find((item: any) => item.id_sewa.toString() === id);

        if (!penyewaanData) { setLoading(false); return; }

        let pembayaranData: Pembayaran[] | null = null;
        try {
          const resPembayaran = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sewa/${penyewaanData.id_sewa}`, config);
          if (resPembayaran.data.success && resPembayaran.data.data.length > 0) {
            pembayaranData = resPembayaran.data.data.map((pay: any) => ({
              tanggal: new Date(pay.tanggal).toLocaleDateString("id-ID"),
              jumlah: pay.jumlah,
              bukti: pay.bukti,
            }));
          }
        } catch { pembayaranData = null; }

        const jumlahDibayar = pembayaranData ? pembayaranData.reduce((a, c) => a + c.jumlah, 0) : 0;
        const harga = penyewaanData.durasi * 300000;

        setDetail({
          id_sewa: penyewaanData.id_sewa.toString(),
          id_booth: penyewaanData.booth_id_booth || "-",
          nama_penyewa: penyewaanData.nama || "-",
          no_hp: penyewaanData.no_hp || "-",
          nik: penyewaanData.nik || penyewaanData.biodata_nik || "-",
          lokasi: penyewaanData.lokasi || "-",
          durasi: penyewaanData.durasi,
          harga,
          mulai_sewa: penyewaanData.mulai_sewa,
          akhir_sewa: penyewaanData.akhir_sewa,
          status: penyewaanData.status,
          deposit: penyewaanData.deposit || 200000,
          deposit_status: penyewaanData.deposit_status || "BELUM DIBAYAR",
          denda: penyewaanData.denda || 0,
          denda_berjalan: penyewaanData.denda_berjalan || 0,
          pembayaran: pembayaranData,
          jumlah_dibayar: jumlahDibayar,
          sisa: harga - jumlahDibayar,
          bukti_bayar: penyewaanData.bukti_bayar,
        });
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memuat detail penyewaan...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <MdCancel className="text-red-500 text-4xl" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Data Tidak Ditemukan</h1>
        <button onClick={() => router.push("../")} className="text-primary hover:underline text-sm">← Kembali</button>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[detail.status] || STATUS_CONFIG["MENUNGGU"];
  const StatusIcon = statusInfo.icon;
  const depositInfo = DEPOSIT_STATUS_CONFIG[detail.deposit_status] || DEPOSIT_STATUS_CONFIG["BELUM DIBAYAR"];
  const isOverdue = detail.status === "DISEWA" && detail.akhir_sewa ? new Date() > new Date(detail.akhir_sewa) : false;
  const dendaDisplay = detail.denda_berjalan || detail.denda || 0;
  const pct = detail.harga > 0 ? Math.min((detail.jumlah_dibayar / detail.harga) * 100, 100) : 0;

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-";
  const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  return (
    <div className="p-6 pb-16 space-y-6 bg-gray-50 min-h-screen">

      {/* ── TOP BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button onClick={() => router.push("../")} className="flex items-center gap-1 text-gray-500 hover:text-primary text-sm mb-2 transition-colors">
            <MdOutlineArrowBackIos size={14} /> Kembali ke Data Transaksi
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Penyewaan <span className="text-primary">#{detail.id_sewa}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}>
            <StatusIcon size={16} /> {statusInfo.label}
          </span>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-700 transition-colors">
            <MdPrint /> Cetak
          </button>
        </div>
      </div>

      {/* ── OVERDUE BANNER ── */}
      {isOverdue && (
        <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MdWarning className="text-red-600 text-xl" />
          </div>
          <div>
            <p className="font-semibold text-red-800">Masa Sewa Telah Berakhir!</p>
            <p className="text-red-700 text-sm mt-0.5">
              Denda keterlambatan berjalan: <strong>{fmtRp(dendaDisplay)}</strong> (Rp 10.000/hari)
            </p>
          </div>
        </div>
      )}

      {/* ── RINGKASAN ── */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {[
            { label: "Total Sewa",    value: fmtRp(detail.harga),          sub: `${detail.durasi} bulan` },
            { label: "Sudah Dibayar", value: fmtRp(detail.jumlah_dibayar), sub: `${pct.toFixed(0)}% terbayar` },
            { label: "Sisa Tagihan",  value: fmtRp(detail.sisa),           sub: detail.sisa > 0 ? "Belum lunas" : "Lunas", danger: detail.sisa > 0 },
            { label: "Denda",         value: fmtRp(dendaDisplay),          sub: isOverdue ? "Masih berjalan" : "Tidak ada denda", danger: isOverdue },
          ].map((kpi, i) => (
            <div key={i} className="p-5">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className={`text-2xl font-semibold mt-1.5 tabular-nums ${kpi.danger ? "text-red-600" : "text-gray-900"}`}>
                {kpi.value}
              </p>
              <p className="text-sm text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROGRESS PELUNASAN ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-sm text-gray-500">Progress pelunasan</p>
          <p className="text-sm font-semibold text-gray-900 tabular-nums">{pct.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gray-900 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 tabular-nums">
          <span>Rp 0</span>
          <span>{fmtRp(detail.harga)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Penyewa Identity Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`px-6 py-3 ${statusInfo.bgColor} border-b ${statusInfo.borderColor}`}>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${statusInfo.textColor}`}>👤 Identitas Penyewa</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: MdPerson,     label: "Nama Lengkap",   value: detail.nama_penyewa },
                { icon: MdBadge,      label: "NIK",            value: detail.nik },
                { icon: MdPhone,      label: "No. HP",         value: detail.no_hp },
                { icon: MdLocationOn, label: "Koordinat Booth",value: detail.lokasi },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <row.icon className="text-gray-500 text-lg" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{row.label}</p>
                    <p className="text-gray-800 font-semibold mt-0.5">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booth Info Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-primary bg-opacity-5 border-b border-primary border-opacity-20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">🏪 Informasi Booth & Sewa</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "ID Sewa",    value: `#${detail.id_sewa}` },
                  { label: "ID Booth",   value: detail.id_booth },
                  { label: "Durasi",     value: `${detail.durasi} Bulan` },
                  { label: "Harga/bln",  value: fmtRp(300000) },
                  { label: "Mulai Sewa", value: fmt(detail.mulai_sewa) },
                  { label: "Akhir Sewa", value: fmt(detail.akhir_sewa) },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                    <p className="text-gray-900 font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bukti Transfer dari Pelanggan */}
          {detail.bukti_bayar && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700">🧾 Bukti Transfer dari Pelanggan</h2>
              </div>
              <div className="p-6 flex justify-center bg-gray-50">
                {detail.bukti_bayar.endsWith(".pdf") ? (
                  <a href={detail.bukti_bayar} target="_blank" rel="noreferrer" className="text-primary underline font-medium">
                    📄 Lihat PDF Bukti Transfer
                  </a>
                ) : (
                  <img
                    src={detail.bukti_bayar}
                    alt="Bukti Transfer"
                    className="max-h-64 object-contain rounded-xl border cursor-pointer hover:opacity-80 shadow-sm transition-opacity"
                    onClick={() => { setSelectedImage(detail.bukti_bayar!); setIsModalOpen(true); }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Riwayat Pembayaran Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                <MdReceipt /> Riwayat Pembayaran Sewa
              </h2>
              {detail.pembayaran && (
                <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full">
                  {detail.pembayaran.length} transaksi
                </span>
              )}
            </div>
            {detail.pembayaran && detail.pembayaran.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No</th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {detail.pembayaran.map((pay, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="w-6 h-6 rounded-full bg-primary bg-opacity-10 text-primary text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 text-sm">{pay.tanggal}</td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900 text-sm">{fmtRp(pay.jumlah)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => { setSelectedImage(pay.bukti); setIsModalOpen(true); }}
                            className="text-xs bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Lihat Bukti
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td colSpan={2} className="py-3 px-6 text-sm font-bold text-gray-600">Total Terbayar</td>
                      <td colSpan={2} className="py-3 px-6 text-sm font-bold text-emerald-700">{fmtRp(detail.jumlah_dibayar)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <MdReceipt className="text-5xl mb-2 opacity-30" />
                <p className="text-sm">Belum ada riwayat pembayaran</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">

          {/* Tagihan Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-800 text-white">
              <h2 className="text-sm font-bold uppercase tracking-wider">💳 Ringkasan Tagihan</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Total Sewa</span>
                <span className="font-bold text-gray-900">{fmtRp(detail.harga)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Sudah Dibayar</span>
                <span className="font-bold text-emerald-600">{fmtRp(detail.jumlah_dibayar)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 font-semibold text-sm">Sisa Tagihan</span>
                <span className={`font-bold text-lg ${detail.sisa > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {fmtRp(detail.sisa)}
                </span>
              </div>
              {detail.sisa <= 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 text-center">
                  <p className="text-emerald-700 text-xs font-semibold">✅ Pembayaran Sewa Lunas</p>
                </div>
              )}
            </div>
          </div>

          {/* Deposit Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-blue-600 text-white flex items-center gap-2">
              <MdShield />
              <h2 className="text-sm font-bold uppercase tracking-wider">Deposit / Jaminan</h2>
            </div>
            <div className="p-5">
              <p className="text-3xl font-bold text-gray-900">{fmtRp(detail.deposit)}</p>
              <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${depositInfo.bg} ${depositInfo.color}`}>
                {depositInfo.label}
              </div>
            </div>
          </div>

          {/* Denda Card */}
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isOverdue ? "ring-2 ring-red-300" : ""}`}>
            <div className={`px-5 py-3 flex items-center gap-2 ${isOverdue ? "bg-red-600" : "bg-gray-600"} text-white`}>
              <MdWarning />
              <h2 className="text-sm font-bold uppercase tracking-wider">Denda Keterlambatan</h2>
            </div>
            <div className="p-5">
              <p className={`text-3xl font-bold ${isOverdue ? "text-red-600" : "text-gray-400"}`}>
                {fmtRp(dendaDisplay)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {isOverdue ? "⚠️ Bertambah Rp 10.000 setiap hari" : "Tidak ada denda saat ini"}
              </p>
            </div>
          </div>

          {/* Booth Info */}
          <div className="bg-primary rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <FaStore className="text-xl" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Booth</h2>
            </div>
            <p className="text-3xl font-black tracking-tight">{detail.id_booth}</p>
            <p className="text-green-200 text-xs mt-1">ID Booth yang disewa</p>
          </div>

        </div>
      </div>

      <ImageModal isOpen={isModalOpen} imageSrc={selectedImage} onClose={() => { setIsModalOpen(false); setSelectedImage(""); }} />
    </div>
  );
};

export default SewaDetail;
