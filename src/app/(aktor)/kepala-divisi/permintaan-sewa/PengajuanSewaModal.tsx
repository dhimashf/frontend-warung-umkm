import React, { useState, useEffect } from "react";
import FormData from "@/components/FormData";
import ConfirmationPopup from "@/components/ConfirmationPopUp";
import { useModal } from '@/components/ModalContext';
import axios from "axios";

interface RentalRequest {
  id: number;
  nama: string;
  tanggalPermintaan: string;
  noHp: string;
  nik: string;
  jenisKelamin: string;
  alamatDomisili: string;
  alamatKTP: string;
  fotoKTP: string;
  durasiPenyewaan: number;
  status: string;
  lokasiBooth: string;
  idbooth: string | null;
  mulaiSewa: string | null;
  akhirSewa: string | null;
  buktiBayar?: string | null;
}

interface PengajuanSewaModalProps {
  request: RentalRequest | null;
  onClose: () => void;
  onSave: (id: number, selectedBooth: string) => void;
  onDelete: (id: number) => void;
}

const PengajuanSewaModal: React.FC<PengajuanSewaModalProps> = ({
  request,
  onClose,
  onDelete,
  onSave,
}) => {
  const [showBoothSelector, setShowBoothSelector] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; 
  });
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showBoothConfirmPopup, setShowBoothConfirmPopup] = useState(false);
  const [boothOptions, setBoothOptions] = useState<{ id_booth: string }[]>([]);
  const { showNotification, showError } = useModal();

  useEffect(() => {
    if (request?.idbooth) {
      setSelectedBooth(request.idbooth);
    } else {
      setSelectedBooth("");
    }
  }, [request]);

  useEffect(() => {
    const fetchBoothData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/booth/ready`
        );
        if (response.data.success) {
          setBoothOptions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching booth data:", error);
      }
    };

    if (showBoothSelector) {
      fetchBoothData();
    }
  }, [showBoothSelector]);

  if (!request) return null;

  const handleDelete = async () => {
    if (!request) return;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/tolak/${request.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification("Pengajuan berhasil ditolak.");
        onDelete(request.id);
        setShowDeletePopup(false);
        onClose();
      } else {
        showError("Terjadi kesalahan saat menolak pengajuan.");
      }
    } catch (error) {
      showError("Gagal menolak pengajuan. Silakan coba lagi.");
    }
  };

  const calculateEndDate = (startDate: string, duration: number) => {
    if (!startDate) return "";
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + duration); 
    return start.toISOString().split("T")[0];
  };

  const endDate = calculateEndDate(startDate, request.durasiPenyewaan);

  const handleBoothSelectionConfirm = async () => {
    if (!request || !selectedBooth) return;

    const payload = {
      mulai_sewa: startDate,
      akhir_sewa: endDate,
      booth_id_booth: selectedBooth,
    };
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/setujui/${request.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        showNotification("Pengajuan disetujui, Booth & Deposit Rp 200.000 ditetapkan!");
        onSave(request.id, selectedBooth);
        setShowBoothConfirmPopup(false);
        setShowBoothSelector(false);
        onClose();
      } else {
        showError("Terjadi kesalahan saat menyimpan data.");
      }
    } catch (error) {
      showError("Gagal menyetujui pengajuan. Silakan coba lagi.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed top-0 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-3xl w-full bg-white p-6 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Permintaan Sewa {request.nama}
        </h1>

        <div className="overflow-auto max-h-[calc(100vh-250px)]">
          <form className="space-y-4 overflow-auto">
            <FormData formData={request} />
          </form>

          {request.buktiBayar && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Bukti Pembayaran (Transfer/Tunai)</h3>
              <div className="border rounded p-2 bg-gray-50 flex justify-center">
                {request.buktiBayar.endsWith('.pdf') ? (
                  <a href={request.buktiBayar} target="_blank" rel="noreferrer" className="text-primary underline">Lihat PDF Bukti Bayar</a>
                ) : (
                  <img src={request.buktiBayar} alt="Bukti Pembayaran" className="max-h-64 object-contain" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {(request.status === "MENUNGGU" || request.status === "MENUNGGU VERIFIKASI") && (
            <>
              <button
                onClick={() => setShowDeletePopup(true)}
                className="w-full py-2 bg-red-600 text-white rounded-xl hover:bg-opacity-75 font-semibold"
              >
                Tolak Pengajuan
              </button>
              <button
                onClick={() => setShowBoothSelector(true)}
                className="w-full py-2 bg-primary text-white rounded-xl hover:bg-opacity-75 font-semibold"
              >
                Setujui & Pilih Booth
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-end border-t-2 pt-2">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>

      {showBoothSelector && (
        <div className="fixed top-0 inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative bg-white p-6 rounded-lg shadow-2xl w-[400px]">
            <h2 className="text-xl text-primary font-bold mb-4">Setujui & Pilih Booth</h2>

            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-200">
              <p>Menyetujui pengajuan ini akan otomatis:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Menetapkan status booth menjadi <strong>DISEWA</strong></li>
                <li>Menetapkan deposit wajib <strong>Rp 200.000</strong></li>
              </ul>
            </div>

            <label className="block text-gray-700 font-medium mb-2">Pilih Booth (Tersedia)</label>
            <select
              value={selectedBooth}
              onChange={(e) => setSelectedBooth(e.target.value)}
              className="w-full p-2 border text-gray-800 border-gray-300 rounded-lg mb-4"
            >
              <option value="">-- Pilih Booth --</option>
              {boothOptions.map((booth) => (
                <option key={booth.id_booth} value={booth.id_booth}>
                  {booth.id_booth}
                </option>
              ))}
            </select>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tanggal Awal Penyewaan
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border text-gray-800 border-gray-300 rounded-lg"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Akhir Penyewaan ({request.durasiPenyewaan} Bulan)
              </label>
              <input
                type="text"
                value={formatDate(endDate)}
                readOnly
                className="w-full p-2 mt-1 border text-gray-800 border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowBoothSelector(false)}
                className="py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => setShowBoothConfirmPopup(true)}
                className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-lime-800 font-semibold disabled:opacity-50"
                disabled={!selectedBooth || !startDate}
              >
                Konfirmasi Setuju
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <ConfirmationPopup
          title="Konfirmasi Penolakan"
          message="Apakah Anda yakin ingin menolak pengajuan ini?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeletePopup(false)}
        />
      )}

      {showBoothConfirmPopup && (
        <ConfirmationPopup
          title="Konfirmasi Persetujuan"
          message={`Setujui penyewaan untuk booth ${selectedBooth}?`}
          onConfirm={handleBoothSelectionConfirm}
          onCancel={() => setShowBoothConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default PengajuanSewaModal;
