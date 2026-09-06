import { useState, useEffect } from "react";
import { 
    MdPerson, MdPhone, MdLocationOn, MdBadge, 
    MdCalendarToday, MdWarning, MdReceipt, MdClose 
} from "react-icons/md";

interface PemantauanBoothProps {
    isOpen: boolean;
    onClose: () => void;
    boothData: {
        id: string;
        penyewa: string;
        lokasi: string; // Format: "latitude,longitude"
        status: string;
        ktpImage: string;
        no_hp: string;
        alamat_domisili: string;
        nik: string;
        jenis_kelamin: string;
        awal_penyewaan: string;
        akhir_penyewaan: string;
        riwayat_pembayaran: string | null;
        riwayat_kerusakan: string | null;
    };
}

export function PemantauanBooth({ isOpen, onClose, boothData }: PemantauanBoothProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [kecamatan, setKecamatan] = useState<string>("Memuat...");

    useEffect(() => {
        if (!isOpen || !boothData.lokasi) return;

        const fetchKecamatan = async () => {
            const [lat, lon] = boothData.lokasi.split(",");
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                const kecamatanName =
                    data.address?.suburb || data.address?.village || "Tidak ditemukan";
                setKecamatan(kecamatanName);
            } catch (error) {
                console.error("Gagal mengambil data kecamatan:", error);
                setKecamatan("Gagal memuat kecamatan");
            }
        };

        fetchKecamatan();
    }, [isOpen, boothData.lokasi]);

    if (!isOpen) return null;

    const paymentHistoryLinks = (boothData.riwayat_pembayaran || "").split(" | ").filter(item => item.trim() !== "").map((item, index) => {
        const parts = item.split(", ");
        const buktiLink = parts[2]?.split(": ")[1]; 
        return (
            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                    <p className="font-semibold text-gray-800">{parts[0]}</p>
                    <p className="text-sm text-gray-500">{parts[1]}</p>
                </div>
                {buktiLink && (
                    <button
                        onClick={() => setSelectedImage(buktiLink)}
                        className="text-sm bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        Lihat Bukti
                    </button>
                )}
            </div>
        );
    });

    const kerusakanItems = boothData.riwayat_kerusakan && boothData.riwayat_kerusakan.trim() !== ""
        ? boothData.riwayat_kerusakan.split(" | ").map((item, index) => (
            <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-700 flex gap-3 mb-2">
                <MdWarning className="text-xl flex-shrink-0 mt-0.5" />
                <p className="text-sm">{item}</p>
            </div>
        ))
        : <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">Tidak ada riwayat kerusakan</div>;

    const fmtDate = (d: string) => {
        if (!d) return "-";
        const date = new Date(d);
        return isNaN(date.getTime()) ? d : date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-4xl h-[90vh] bg-gray-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Detail Booth <span className="text-primary">{boothData.id}</span></h2>
                        <p className="text-sm text-gray-500">Informasi penyewa dan riwayat booth</p>
                    </div>
                    <button
                        className="w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-full flex items-center justify-center transition-colors"
                        onClick={onClose}
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column - Biodata & KTP */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Identitas Penyewa Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2">
                                        <MdPerson className="text-lg" /> Biodata Penyewa
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex gap-3 items-start">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><MdPerson className="text-xl" /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase">Nama Lengkap</p>
                                            <p className="font-semibold text-gray-800">{boothData.penyewa}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><MdBadge className="text-xl" /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase">NIK</p>
                                            <p className="font-semibold text-gray-800">{boothData.nik}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><MdPhone className="text-xl" /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase">No HP</p>
                                            <p className="font-semibold text-gray-800">{boothData.no_hp}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><MdLocationOn className="text-xl" /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase">Domisili</p>
                                            <p className="font-semibold text-gray-800">{boothData.alamat_domisili}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Sewa Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                                        <MdCalendarToday className="text-lg" /> Informasi Sewa
                                    </h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium uppercase mb-1">Lokasi Booth (Kecamatan)</p>
                                        <p className="font-bold text-gray-900">{kecamatan}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium uppercase mb-1">Status</p>
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            boothData.status === 'INSPEKSI' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {boothData.status}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium uppercase mb-1">Awal Sewa</p>
                                        <p className="font-bold text-gray-900">{fmtDate(boothData.awal_penyewaan)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium uppercase mb-1">Akhir Sewa</p>
                                        <p className="font-bold text-gray-900">{fmtDate(boothData.akhir_penyewaan)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Riwayat Pembayaran */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-2">
                                        <MdReceipt className="text-lg" /> Riwayat Pembayaran
                                    </h3>
                                </div>
                                <div className="p-5">
                                    {paymentHistoryLinks.length > 0 ? (
                                        <div className="space-y-3">
                                            {paymentHistoryLinks}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            Belum ada riwayat pembayaran
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Right Column - KTP & Kerusakan */}
                        <div className="space-y-6">
                            
                            {/* KTP Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-gray-800 text-white">
                                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                        <MdBadge className="text-lg" /> KTP Penyewa
                                    </h3>
                                </div>
                                <div className="p-4 bg-gray-50 flex justify-center">
                                    {boothData.ktpImage ? (
                                        <img
                                            src={boothData.ktpImage}
                                            alt="KTP Penyewa"
                                            className="rounded-xl border border-gray-200 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                            onClick={() => setSelectedImage(boothData.ktpImage)}
                                        />
                                    ) : (
                                        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                                            Tidak ada foto KTP
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Riwayat Kerusakan */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-800 flex items-center gap-2">
                                        <MdWarning className="text-lg" /> Riwayat Kerusakan
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {kerusakanItems}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Image Viewer */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="relative max-w-3xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                            <MdClose className="text-2xl" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Bukti"
                            className="w-full h-auto rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
