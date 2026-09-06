"use client";

import React, { useState, useEffect } from "react";
import ProgressBar from "@/components/ProgressBar";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import NotificationPopup from "@/components/NotificationPopUp";
import { MdOutlineDashboard, MdShield, MdWarning } from "react-icons/md";

const DEPOSIT_AMOUNT = 200000;
const HARGA_PER_BULAN = 300000;

const PengajuanSewa: React.FC = () => {
  const [formData, setFormData] = useState<{
    durasi: string;
    harga: number;
    lokasi: string;
    coordinates: { lat: number; lng: number };
  }>({
    durasi: "",
    harga: 0,
    lokasi: "",
    coordinates: { lat: 0.5206, lng: 101.4472 },
  });

  const [syaratSetuju, setSyaratSetuju] = useState(false);
  const [showSyarat, setShowSyarat] = useState(false);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const Map = dynamic(() => import("@/components/MapMarker"), {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />,
  });

  const steps = [
    { name: "Login", status: "completed" as const },
    { name: "Data Diri", status: "completed" as const },
    { name: "Pengajuan", status: "current" as const },
    { name: "Proses Review", status: "upcoming" as const },
    { name: "Pembayaran", status: "upcoming" as const },
  ];

  useEffect(() => {
    const checkRentalRequest = async () => {
      const biodata = localStorage.getItem("biodata");
      if (!biodata) return;
      const parsedBiodata = JSON.parse(biodata);
      const { nik } = parsedBiodata;
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/nik/${nik}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const activeRentals = result.data.filter((r: any) =>
            ['MENUNGGU', 'DISETUJUI', 'DISEWA', 'INSPEKSI'].includes(r.status)
          );
          if (activeRentals.length > 0) {
            setPopupVisible(true);
            setTimeout(() => {
              setPopupVisible(false);
              router.replace("/pelanggan");
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Error checking rental request:", error);
      }
    };
    checkRentalRequest();
  }, [router]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      harga: prev.durasi ? Number(prev.durasi) * HARGA_PER_BULAN : 0,
    }));
  }, [formData.durasi]);

  const validateForm = () => {
    const emptyFields: string[] = [];
    if (!formData.durasi) emptyFields.push("durasi");
    if (!formData.lokasi) emptyFields.push("lokasi");
    if (!syaratSetuju) emptyFields.push("syarat");
    setErrorFields(emptyFields);
    return emptyFields.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const biodata = localStorage.getItem("biodata");
    if (!biodata) {
      router.push("/biodata-baru");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      setIsSubmitting(true);
      const parsedBiodata = JSON.parse(biodata);
      const { nik } = parsedBiodata;
      if (!nik) { setIsSubmitting(false); return; }

      const today = new Date();
      const akhirSewa = new Date(today);
      akhirSewa.setMonth(akhirSewa.getMonth() + Number(formData.durasi));

      const data = {
        biodata_nik: nik,
        durasi: Number(formData.durasi),
        lokasi: formData.lokasi,
        mulai_sewa: today.toISOString().split("T")[0],
        akhir_sewa: akhirSewa.toISOString().split("T")[0],
        syarat_setuju: true,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/pelanggan/pengajuan-sewa");
      } else {
        const err = await response.json();
        console.error("Gagal mengajukan:", err.message);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBiaya = formData.durasi
    ? Number(formData.durasi) * HARGA_PER_BULAN + DEPOSIT_AMOUNT
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col mx-auto max-w-4xl gap-2">
        <nav className="text-lg text-black" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="text-primary">/ Pengajuan Sewa</li>
          </ol>
        </nav>
        <button
          onClick={() => router.push("/pelanggan")}
          className="font-semibold text-left flex w-fit py-2 px-3 hover:bg-opacity-70 items-center rounded-full hover:ring-2 hover:ring-primary hover:ring-opacity-25 bg-primary text-white mb-4"
        >
          <MdOutlineDashboard className="mr-2 text-white" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="max-w-4xl p-4 md:p-0 mx-auto justify-center items-center">
        <ProgressBar steps={steps} />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 mt-4">
        {/* Info Deposit */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <MdShield className="text-blue-500 text-2xl flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 text-sm">Informasi Deposit/Jaminan</h3>
            <p className="text-blue-700 text-sm mt-1">
              Setiap pengajuan sewa dikenakan <strong>deposit sebesar Rp 200.000</strong> sebagai jaminan kondisi booth.
              Deposit akan <strong>dikembalikan penuh</strong> jika booth dikembalikan dalam kondisi baik, atau
              <strong> dipotong</strong> jika ada kerusakan.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="h-fit bg-white shadow-lg rounded-lg text-black p-6">
          <h1 className="text-2xl font-bold text-primary text-center mb-6">Pengajuan Sewa Booth</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Lokasi */}
            <div>
              <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">
                Lokasi Penempatan Booth <span className="text-red-500">*</span>
              </label>
              <Map
                coordinates={formData.coordinates}
                onLocationSelect={(lat, lng) =>
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: { lat, lng },
                    lokasi: `${lat}, ${lng}`,
                  }))
                }
              />
              <input
                type="text"
                id="lokasi"
                readOnly
                value={formData.lokasi}
                placeholder="Klik pada map untuk mengisi lokasi"
                className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${
                  errorFields.includes("lokasi") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errorFields.includes("lokasi") && (
                <p className="text-red-500 text-xs mt-1">Lokasi harus dipilih di peta!</p>
              )}
            </div>

            {/* Durasi & Harga */}
            <div className="flex justify-between gap-4">
              <div className="w-1/2">
                <label htmlFor="durasi" className="block text-sm font-medium text-gray-700">
                  Durasi Sewa (bulan) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="durasi"
                    min="1"
                    placeholder="Contoh: 3"
                    value={formData.durasi}
                    onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                    className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${
                      errorFields.includes("durasi") ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <p className="text-gray-600 whitespace-nowrap">Bulan</p>
                </div>
                {errorFields.includes("durasi") && (
                  <p className="text-red-500 text-xs mt-1">Durasi harus diisi!</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Estimasi Harga Sewa</label>
                <input
                  type="text"
                  value={`Rp ${formData.harga.toLocaleString("id-ID")}`}
                  readOnly
                  className="bg-gray-200 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black border-gray-300"
                />
              </div>
            </div>

            {/* Ringkasan Biaya */}
            {formData.durasi && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-800 text-sm">Ringkasan Biaya</h4>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Biaya Sewa ({formData.durasi} bulan × Rp 300.000)</span>
                  <span>Rp {formData.harga.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Deposit Jaminan</span>
                  <span>Rp {DEPOSIT_AMOUNT.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>Rp {totalBiaya.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}

            {/* Syarat & Ketentuan */}
            <div className={`border rounded-lg p-4 ${errorFields.includes("syarat") ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="syarat"
                  checked={syaratSetuju}
                  onChange={(e) => setSyaratSetuju(e.target.checked)}
                  className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                />
                <label htmlFor="syarat" className="text-sm text-gray-700 cursor-pointer">
                  Saya menyetujui{" "}
                  <button
                    type="button"
                    onClick={() => setShowSyarat(!showSyarat)}
                    className="text-primary underline font-medium"
                  >
                    Syarat & Ketentuan
                  </button>{" "}
                  penyewaan, termasuk ketentuan deposit Rp 200.000 dan denda keterlambatan Rp 10.000/hari.
                </label>
              </div>
              {showSyarat && (
                <div className="mt-3 ml-7 text-xs text-gray-600 space-y-1 bg-gray-100 p-3 rounded">
                  <p className="font-semibold">Syarat & Ketentuan Penyewaan Booth:</p>
                  <p>1. Deposit sebesar <strong>Rp 200.000</strong> wajib dibayarkan dan akan dikembalikan jika booth dikembalikan dalam kondisi baik.</p>
                  <p>2. Jika terjadi kerusakan pada booth, deposit akan dipotong senilai biaya perbaikan.</p>
                  <p>3. Keterlambatan pengembalian booth dikenakan denda <strong>Rp 10.000 per hari</strong>.</p>
                  <p>4. Booth wajib dikembalikan sesuai tanggal yang disepakati.</p>
                  <p>5. Penyewa bertanggung jawab penuh atas kehilangan atau kerusakan booth selama masa sewa.</p>
                </div>
              )}
              {errorFields.includes("syarat") && (
                <p className="text-red-500 text-xs mt-2 ml-7 flex items-center gap-1">
                  <MdWarning /> Anda harus menyetujui syarat & ketentuan terlebih dahulu.
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:opacity-80"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Mengajukan...</span>
                </div>
              ) : (
                "Ajukan Sewa Booth"
              )}
            </button>
          </form>
        </div>
      </div>

      <NotificationPopup
        message="Anda sudah memiliki pengajuan sewa yang aktif."
        isVisible={isPopupVisible}
        onClose={() => setPopupVisible(false)}
      />
    </div>
  );
};

export default PengajuanSewa;
