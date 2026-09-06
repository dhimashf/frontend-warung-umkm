import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useModal } from './ModalContext';

interface Pembelian {
    id: number;
    nama: string;
    tenor: number;
}

const ModalStep3: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [selectedId, setSelectedId] = useState<number | "">("");
    const [dropdownOptions, setDropdownOptions] = useState<Pembelian[]>([]);
    const [isLunas, setIsLunas] = useState(false);
    const {showNotification, showError} = useModal();
    const [formData, setFormData] = useState({
        bukti: null as File | null,
        tanggal: new Date().toISOString().split('T')[0],
        jumlah: 0,
    });

    useEffect(() => {
        const fetchPembelianData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/pembelian/CREDIT', config);
                const pembelianData = response.data.data;
                setDropdownOptions(pembelianData.map((item: Pembelian) => ({
                    id: item.id,
                    nama: item.nama,
                    tenor: item.tenor,
                })));
            } catch (error) {
                console.error('Error fetching pembelian data:', error);
            }
        };

        fetchPembelianData();
    }, []);

    useEffect(() => {
        const fetchBuktiData = async () => {
            if (!selectedId) return;

            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bukti/${selectedId}`, config);
                const buktiCount = response.data.data.length;
                const selectedOption = dropdownOptions.find(option => option.id === selectedId);

                if (selectedOption) {
                    setIsLunas(buktiCount === selectedOption.tenor);
                }
            } catch (error) {
                console.error('Error fetching bukti data:', error);
            }
        };

        fetchBuktiData();
    }, [selectedId, dropdownOptions]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: name === 'jumlah' ? parseInt(value, 10) : value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prevData => ({ ...prevData, bukti: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedId || !formData.bukti) {
            showError('Silahkan Pilih ID terlebih dahulu!');
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('id_pembelian', selectedId.toString());
            formDataToSend.append('tanggal', formData.tanggal);
            formDataToSend.append('jumlah', formData.jumlah.toString());
            formDataToSend.append('bukti', formData.bukti);

            await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/bukti', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            showNotification('Angsuran berhasil ditambahkan');
            onClose();
        } catch (error) {
            console.error('Error submitting bukti:', error);
            showError('Terjadi kesalahan saat menambahkan angsuran.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-primary">Bayar Angsuran Kredit</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Pilih ID Pembelian:</label>
                    <select
                        name="id_pembelian"
                        value={selectedId}
                        onChange={(e) => setSelectedId(Number(e.target.value))}
                        className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                        required
                    >
                        <option value="">Pilih ID</option>
                        {dropdownOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.id} - {option.nama} ({isLunas ? 'LUNAS' : 'BELUM LUNAS'})
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm font-medium text-gray-700">Bukti Bayar:</label>
                    <input
                        type="file"
                        name="bukti"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                    />

                    <label className="block text-sm font-medium text-gray-700">Jumlah:</label>
                    <input
                        type="number"
                        name="jumlah"
                        value={formData.jumlah}
                        onChange={handleChange}
                        required
                        className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                    />

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalStep3;