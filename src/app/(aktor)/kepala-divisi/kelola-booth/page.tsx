"use client";
import { useEffect, useState } from "react";
import BoothCard from "@/components/BoothCard";
import { FaPlus } from "react-icons/fa";
import TambahBoothModal from "@/components/TambahBooth";
import { useModal } from '@/components/ModalContext';

interface BoothData {
    id_booth: string;
    ukuran: string;
    status: string;
    harga_sewa: string;
    riwayat_kerusakan: { tanggal: string; deskripsi: string }[];
}

export default function Page() {
    const [booths, setBooths] = useState<BoothData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalTambahBoothOpen, setIsModalTambahBoothOpen] = useState(false);
    const { showNotification, showError } = useModal();

    // Fungsi untuk mengambil ulang data
    const refetchBooths = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/booth");
            const data = await response.json();

            if (data.success) {
                setBooths(data.data);
            } else {
                console.error("Error fetching booth data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching booth data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetchBooths(); // Fetch data saat pertama kali
    }, []);

    const handleTambahBooth = () => {
        setIsModalTambahBoothOpen(true);
    };

    const handleTambahBoothSubmit = async (data: BoothData) => {
        try {
            // Ambil hanya id_booth dan ukuran yang diperlukan
            const { id_booth, ukuran } = data;

            // Kirim data ke API dengan properti yang dibutuhkan
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/booth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_booth, // Hanya kirimkan id_booth
                    ukuran,   // Hanya kirimkan ukuran
                    status: "TIDAK DISEWA", // Status default
                    harga_sewa: "", // Harga sewa default
                    riwayat_kerusakan: [] // Riwayat kerusakan default
                }),
            });

            const result = await response.json();
            if (result.success) {
                refetchBooths();
                showNotification("Berhasil menambah booth");
            } else {
                console.error("Gagal menambah booth:", result.message);
                showError("Gagal menambah booth");
            }
        } catch (error) {
            console.error("Error menambah booth:", error);
            showError("Error menambah booth");
        }
    };



    const handleAddRiwayat = (boothIndex: number, newRiwayat: { tanggal: string; deskripsi: string }) => {
        const updatedBooths = [...booths];
        const booth = updatedBooths[boothIndex];

        // Logika untuk update riwayat di sisi client
        const existingRiwayat = Array.isArray(booth.riwayat_kerusakan)
            ? booth.riwayat_kerusakan
            : booth.riwayat_kerusakan !== "Tidak ada"
                ? [{ tanggal: "", deskripsi: booth.riwayat_kerusakan }]
                : [];

        booth.riwayat_kerusakan = [...existingRiwayat, newRiwayat];
        setBooths(updatedBooths);
    };

    return (
        <div className="p-4">
            <TambahBoothModal
                isOpen={isModalTambahBoothOpen}
                onClose={() => setIsModalTambahBoothOpen(false)}
                onSubmit={handleTambahBoothSubmit}
                existingBoothIds={booths.map(booth => booth.id_booth)} />
            <button
                onClick={handleTambahBooth}
                className="bg-primary shadow-xl border-primary w-full md: flex items-center justify-center font-semibold text-lg text-white px-4 py-3 rounded-lg mb-6 hover:bg-primary hover:bg-opacity-80 hover:scale-95 transition-all duration-200 ease-in-out"
            >
                <FaPlus />
                <span className="ml-2">Tambah Booth</span>
            </button>
            {isLoading ? (
                <div className="text-center">Memuat data booth...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {booths.map((booth, index) => (
                        <BoothCard
                            key={booth.id_booth}
                            id={booth.id_booth}
                            boothName={`Booth ${booth.id_booth}`}
                            initialPenyewa=""
                            initialKerusakan={0}
                            initialStatus={booth.status.toLowerCase()}
                            riwayat={
                                Array.isArray(booth.riwayat_kerusakan)
                                    ? booth.riwayat_kerusakan
                                    : booth.riwayat_kerusakan !== "Tidak ada"
                                        ? [{ tanggal: "", deskripsi: booth.riwayat_kerusakan }]
                                        : []
                            }
                            onAddRiwayat={(newRiwayat) => handleAddRiwayat(index, newRiwayat)}
                            refetchData={refetchBooths} // Pass refetch function
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
