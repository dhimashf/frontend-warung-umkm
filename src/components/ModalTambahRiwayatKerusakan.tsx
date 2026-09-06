interface ModalTambahRiwayatKerusakanBoothProps {
    isOpen: boolean;
    onClose: () => void;
    newRiwayat: { tanggal: string; deskripsi: string; bukti: File | null };
    setNewRiwayat: React.Dispatch<React.SetStateAction<{ tanggal: string; deskripsi: string; bukti: File | null }>>;
    onTambahRiwayat: () => void;
}

const ModalTambahRiwayatKerusakanBooth: React.FC<ModalTambahRiwayatKerusakanBoothProps> = ({
    isOpen,
    onClose,
    newRiwayat,
    setNewRiwayat,
    onTambahRiwayat
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="relative flex flex-col w-full max-w-md gap-3 p-6 bg-white animate-popup rounded-lg shadow-lg">
                    <button className="absolute right-3 top-3 text-black" onClick={onClose}>X</button>
                    <h2 className="text-xl font-semibold text-center text-black">Tambahkan Kerusakan</h2>
                    <input
                        type="date"
                        className="w-full p-2 text-black border border-gray-300 rounded-md"
                        value={newRiwayat.tanggal}
                        onChange={(e) => setNewRiwayat({ ...newRiwayat, tanggal: e.target.value })}
                    />
                    <textarea
                        className="w-full h-[150px] p-2 text-black border border-gray-300 rounded-md"
                        placeholder="Deskripsikan Kerusakan"
                        value={newRiwayat.deskripsi}
                        onChange={(e) => setNewRiwayat({ ...newRiwayat, deskripsi: e.target.value })}
                    />
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-full p-2 text-black border border-gray-300 rounded-md"
                        onChange={(e) => setNewRiwayat({ ...newRiwayat, bukti: e.target.files?.[0] || null })}
                    />
                    <button
                        className="bg-primary text-white w-full px-4 py-2 rounded-lg"
                        onClick={onTambahRiwayat} // Call onAddRiwayat to handle adding new data
                    >
                        Konfirmasi
                    </button>
                    <button
                        className="bg-white text-black w-full px-4 py-2 rounded-lg border border-abu2"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalTambahRiwayatKerusakanBooth;
