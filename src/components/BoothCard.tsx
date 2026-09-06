"use client";
import { useState, useEffect } from "react";
import { MdCheckCircle, MdWarning, MdError, MdAddCircle, MdCalendarToday, MdSearch } from "react-icons/md";
import ModalRiwayatKerusakanBooth from "@/components/ModalRiwayatKerusakanBooth";
import ModalTambahRiwayatKerusakanBooth from "@/components/ModalTambahRiwayatKerusakan";
import { useModal } from "./ModalContext";
import axios from "axios";

interface BoothCardProps {
    id: string; 
    boothName: string;
    initialPenyewa: string;
    initialKerusakan: number;
    initialStatus: string;
    riwayat: { tanggal: string; deskripsi: string }[];
    onAddRiwayat: (newRiwayat: { tanggal: string; deskripsi: string }) => void;
    refetchData: () => void;
}

export default function BoothCard({
    id, 
    boothName,
    initialPenyewa,
    initialStatus,
    refetchData,
}: BoothCardProps) {
    const [penyewa, setPenyewa] = useState<string | null>(initialPenyewa);
    const [status, setStatus] = useState(initialStatus.toLowerCase());
    const [newRiwayat, setNewRiwayat] = useState({ tanggal: "", deskripsi: "" });

    // Modals
    const [isModalInspeksi, setIsModalInspeksi] = useState(false);
    const [isModalSelesaiInspeksi, setIsModalSelesaiInspeksi] = useState(false);
    
    // Data for inspeksi
    const [activeSewaId, setActiveSewaId] = useState<number | null>(null);
    const [dendaTerhitung, setDendaTerhitung] = useState(0);
    const [inspeksiForm, setInspeksiForm] = useState({
        kondisi: "BAIK",
        potongan_deposit: 0,
        denda_final: 0
    });

    const { showError, showNotification } = useModal();
    const [riwayatKerusakan, setRiwayatKerusakan] = useState([]);
    const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);
    const [isModalRiwayatKerusakanOpen, setIsModalRiwayatKerusakanOpen] = useState(false);
    const [isModalTambahRiwayatKerusakanOpen, setIsModalTambahRiwayatKerusakanOpen] = useState(false);

    const openModalRiwayatKerusakan = async () => {
        setIsLoadingRiwayat(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kerusakan/${id}`);
            if (!response.ok) throw new Error("Gagal mengambil data riwayat kerusakan");
            const data = await response.json();
            if (data.success) {
                const riwayatKerusakan = data.data.map((item: any) => ({
                    id: item.id,
                    tanggal: item.tanggal_kerusakan.split("T")[0],
                    deskripsi: item.riwayat_kerusakan,
                }));
                setRiwayatKerusakan(riwayatKerusakan);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingRiwayat(false);
            setIsModalRiwayatKerusakanOpen(true);
        }
    };

    useEffect(() => {
        setStatus(initialStatus.toLowerCase());
    }, [initialStatus]);

    const handleTandaiRusak = async () => {
        await updateStatus("RUSAK");
    };

    const handleTandaiSudahDiperbaiki = async () => {
        await updateStatus("TIDAK DISEWA");
    };

    const updateStatus = async (newStatus: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/booth/status/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refetchData();
            showNotification(`Status booth berhasil diubah menjadi ${newStatus}`);
        } catch (error) {
            showError("Gagal memperbarui status booth");
        }
    };

    // Alur Baru: Mulai Inspeksi (DISEWA -> INSPEKSI)
    const handleMulaiInspeksi = async () => {
        try {
            const token = localStorage.getItem("token");
            // 1. Cari active sewa
            const resSewa = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/booth/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resSewa.data.success && resSewa.data.data.length > 0) {
                const active = resSewa.data.data.find((s: any) => s.status === 'DISEWA');
                if (active) {
                    // Panggil endpoint inspeksi
                    const resInsp = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/inspeksi/${active.id_sewa}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resInsp.data.success) {
                        showNotification("Booth masuk masa inspeksi. Denda keterlambatan (jika ada) telah dihitung.");
                        refetchData();
                    }
                } else {
                    showError("Tidak ada penyewaan aktif untuk booth ini.");
                }
            }
        } catch (error) {
            showError("Gagal memulai inspeksi.");
        }
        setIsModalInspeksi(false);
    };

    // Alur Baru: Selesaikan Inspeksi (INSPEKSI -> SELESAI & TIDAK DISEWA)
    const prepareSelesaikanInspeksi = async () => {
        try {
            const token = localStorage.getItem("token");
            const resSewa = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/booth/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resSewa.data.success && resSewa.data.data.length > 0) {
                const active = resSewa.data.data.find((s: any) => s.status === 'INSPEKSI');
                if (active) {
                    setActiveSewaId(active.id_sewa);
                    setDendaTerhitung(active.denda || 0);
                    setInspeksiForm({ kondisi: "BAIK", potongan_deposit: 0, denda_final: active.denda || 0 });
                    setIsModalSelesaiInspeksi(true);
                } else {
                    showError("Tidak ada penyewaan dalam status inspeksi.");
                }
            }
        } catch (error) {
            showError("Gagal mengambil data sewa.");
        }
    };

    const submitSelesaikanInspeksi = async () => {
        if (!activeSewaId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/selesai/${activeSewaId}`,
                inspeksiForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                showNotification("Inspeksi selesai. Booth kembali tersedia.");
                setIsModalSelesaiInspeksi(false);
                refetchData();
            }
        } catch (error) {
            showError("Gagal menyelesaikan inspeksi.");
        }
    };

    // UI Colors
    let cardColor = "border-gray-500";
    let divColor = "bg-gray-500";
    
    if (status === "tidak disewa") { cardColor = "border-primary"; divColor = "bg-primary"; }
    else if (status === "rusak") { cardColor = "border-yellow-500"; divColor = "bg-yellow-500"; }
    else if (status === "disewa") { cardColor = "border-red-500"; divColor = "bg-red-500"; }
    else if (status === "inspeksi") { cardColor = "border-purple-500"; divColor = "bg-purple-500"; }

    return (
        <div className={`rounded-lg shadow-md w-full border pb-3 bg-white ${cardColor}`}>
            <div className={`${divColor} rounded-t-lg w-full justify-between flex px-4 py-2`}>
                <h3 className="text-lg font-bold text-white">{boothName}</h3>
                <div className="rounded-lg px-2 items-center flex justify-center border border-white">
                    {status === "tidak disewa" && <MdCheckCircle size={24} color="white" />}
                    {status === "rusak" && <MdWarning size={24} color="white" />}
                    {status === "disewa" && <MdError size={24} color="white" />}
                    {status === "inspeksi" && <MdSearch size={24} color="white" />}
                </div>
            </div>
            
            <div className="gap-2 ml-4 mt-2">
                <p className="text-black font-semibold uppercase">Status: {status}</p>
                <p className="text-gray-600 text-sm">Riwayat Kerusakan: {riwayatKerusakan.length} kejadian</p>
            </div>
            
            <div className="mt-4 px-3 gap-2 w-full flex flex-col">
                <button
                    className="bg-white border flex flex-row w-full items-center justify-center border-gray-400 text-gray-700 py-1.5 px-3 rounded-lg hover:bg-gray-100"
                    onClick={openModalRiwayatKerusakan}
                >
                    <MdCalendarToday size={16} className="mr-2" />
                    Lihat / Tambah Riwayat Kerusakan
                </button>

                {(status === "tidak disewa" || status === "") && (
                    <button
                        className="bg-yellow-500 text-white w-full py-1.5 rounded-lg hover:bg-yellow-600 font-medium"
                        onClick={handleTandaiRusak}
                    >
                        Tandai Rusak
                    </button>
                )}
                
                {status === "rusak" && (
                    <button
                        className="bg-primary text-white w-full py-1.5 rounded-lg hover:opacity-80 font-medium"
                        onClick={handleTandaiSudahDiperbaiki}
                    >
                        Tandai Sudah Diperbaiki
                    </button>
                )}
                
                {status === "disewa" && (
                    <button
                        className="bg-purple-600 text-white w-full py-1.5 rounded-lg hover:bg-purple-700 font-medium"
                        onClick={() => setIsModalInspeksi(true)}
                    >
                        Booth Dikembalikan (Mulai Inspeksi)
                    </button>
                )}

                {status === "inspeksi" && (
                    <button
                        className="bg-green-600 text-white w-full py-1.5 rounded-lg hover:bg-green-700 font-medium"
                        onClick={prepareSelesaikanInspeksi}
                    >
                        Selesaikan Inspeksi
                    </button>
                )}
            </div>

            {/* Modal Konfirmasi Mulai Inspeksi */}
            {isModalInspeksi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-[90vw]">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pengembalian</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Tandai booth ini telah dikembalikan oleh penyewa dan masuk masa INSPEKSI?
                            Denda keterlambatan (jika ada) akan dihitung otomatis.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsModalInspeksi(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                            <button onClick={handleMulaiInspeksi} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Mulai Inspeksi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Selesai Inspeksi & Keputusan Deposit */}
            {isModalSelesaiInspeksi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[450px] max-w-[95vw]">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Selesaikan Inspeksi & Deposit</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Booth</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50"
                                    value={inspeksiForm.kondisi}
                                    onChange={(e) => setInspeksiForm({...inspeksiForm, kondisi: e.target.value})}
                                >
                                    <option value="BAIK">Kondisi Baik (Deposit Kembali Penuh)</option>
                                    <option value="RUSAK">Ada Kerusakan (Potong Deposit)</option>
                                </select>
                            </div>

                            {inspeksiForm.kondisi === "RUSAK" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Potongan Deposit (Rp)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="200000"
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        value={inspeksiForm.potongan_deposit}
                                        onChange={(e) => setInspeksiForm({...inspeksiForm, potongan_deposit: Number(e.target.value)})}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Maksimal Rp 200.000</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Denda Keterlambatan Final (Rp)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                                    value={inspeksiForm.denda_final}
                                    onChange={(e) => setInspeksiForm({...inspeksiForm, denda_final: Number(e.target.value)})}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Otomatis terhitung Rp {dendaTerhitung.toLocaleString("id-ID")}. Anda dapat menyesuaikannya jika diperlukan.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-6">
                            <button onClick={() => setIsModalSelesaiInspeksi(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">Batal</button>
                            <button onClick={submitSelesaikanInspeksi} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Selesai & Bebaskan Booth</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
