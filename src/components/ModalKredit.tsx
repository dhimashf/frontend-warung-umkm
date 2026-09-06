import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useModal } from './ModalContext';

interface FormData {
    nama: string;
    alamat: string;
    no_hp: string;
    jenis_kelamin: string;
    alamat_domisili?: string;
    nik?: string;
    tenor?: string;
    foto_ktp?: File | null;
    jenis_produk: string;
    ukuran: string;
    harga: number;
    jumlah: number;
    tanggal: string;
    bukti: File | null;
    id_pembelian?: number;
    subtotal: number;
    jumlahBayar: number;
}

interface MultiStepFormProps {
    isOpen: boolean;
    onClose: () => void;

}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ isOpen, onClose }) => {
    const { showNotification } = useModal();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        nama: '',
        alamat: '',
        no_hp: '',
        jenis_kelamin: '',
        jenis_produk: '',
        ukuran: '',
        harga: 0,
        jumlah: 0,
        tanggal: new Date().toISOString().split('T')[0],
        bukti: null,
        alamat_domisili: '',
        nik: '',
        tenor: '',
        foto_ktp: null,
        subtotal: 0,
        jumlahBayar: 0,
    });
    if (!isOpen) return null;

    const handleChange1 = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: name === 'jumlahBayar' ? parseFloat(value) || 0 : value, // Pastikan jumlahBayar berupa angka
        }));
    };
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => {
            const updatedData = { ...prevData, [name]: value };
            if (name === 'harga' || name === 'jumlah') {
                updatedData.subtotal = updatedData.harga * updatedData.jumlah;
            }
            return updatedData;
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prevData => ({
                ...prevData,
                [e.target.name]: e.target.files![0],
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log('Form submitted, current step:', currentStep); // Tambahkan log ini
        try {
            if (currentStep === 1) {
                const genderCode = formData.jenis_kelamin === 'Laki-Laki' ? 'L' : 'P';
                const formattedDate = new Date().toLocaleDateString('en-CA');
                const pembelianData = {
                    tanggal_transaksi: formattedDate,
                    jenis_pembayaran: 'CREDIT',
                    nama: formData.nama,
                    alamat: formData.alamat,
                    no_hp: formData.no_hp,
                    jenis_kelamin: genderCode,
                    alamat_domisili: formData.alamat_domisili,
                    nik: formData.nik,
                    tenor: formData.tenor,
                    foto_ktp: formData.foto_ktp,
                };

                console.log('Data yang akan dikirim ke endpoint tahap 1:', pembelianData);
                const pembelianResponse = await axios.post(
                    process.env.NEXT_PUBLIC_API_URL + '/api/pembelian/credit',
                    pembelianData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
                );

                // Mengambil 'id' dari respons yang diterima
                const { id } = pembelianResponse.data.data;  // Akses data.id untuk mendapatkan id pembelian

                console.log('ID Pembelian:', id); // Menampilkan id yang diterima

                setFormData(prevData => ({ ...prevData, id_pembelian: id })); // Menyimpan id_pembelian di formData
                setCurrentStep(2); // Melanjutkan ke langkah 2
            } else if (currentStep === 2) {
                const produkData = {
                    id_pembelian: formData.id_pembelian, // Menggunakan id_pembelian dari tahap 1
                    jenis_produk: formData.jenis_produk,
                    ukuran: formData.ukuran,
                    harga: formData.harga,
                    jumlah: formData.jumlah,
                };

                console.log('Data yang akan dikirim ke endpoint tahap 2:', produkData);
                await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/produk', produkData, {

                });
                setCurrentStep(3); // Melanjutkan ke langkah 3
            } else if (currentStep === 3) {
                const formDataToSend = new FormData();
                formDataToSend.append('id_pembelian', formData.id_pembelian!.toString());
                formDataToSend.append('tanggal', formData.tanggal);
                if (formData.bukti) {
                    formDataToSend.append('bukti', formData.bukti);
                }
                formDataToSend.append('jumlah', formData.jumlahBayar.toString());

                await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/bukti', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                showNotification('Pembayaran berhasil disimpan');
                onClose();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Gagal menyimpan, coba lagi!');
        }
    };



    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-primary">
                    {currentStep === 1 ? 'Step 1: Pembelian' :
                        currentStep === 2 ? 'Step 2: Produk Pembelian' :
                            'Step 3: Bukti Bayar'}
                </h2>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {currentStep === 1 && (
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            <label className="block text-sm font-medium text-gray-700">Nama:</label>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                required
                                className="p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">Alamat:</label>
                            <input
                                type="text"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">No HP:</label>
                            <input
                                type="tel"
                                name="no_hp"
                                value={formData.no_hp}
                                onChange={handleChange}
                                pattern="[0-9]*"
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.value = input.value.replace(/[^0-9]/g, '');
                                }}
                                maxLength={13}
                                minLength={11}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin:</label>
                            <select
                                name="jenis_kelamin"
                                value={formData.jenis_kelamin}
                                onChange={handleChange}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            >
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="Laki-Laki">Laki-Laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                            <label className="block text-sm font-medium text-gray-700">Alamat Domisili:</label>
                            <input
                                type="text"
                                name="alamat_domisili"
                                value={formData.alamat_domisili}
                                onChange={handleChange}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">NIK:</label>
                            <input
                                type="text"
                                name="nik"
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.value = input.value.replace(/[^0-9]/g, '');
                                }}
                                value={formData.nik}
                                onChange={handleChange}
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">Tenor:</label>
                            <input
                                type="text"
                                name="tenor"
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.value = input.value.replace(/[^0-9]/g, '');
                                }}
                                maxLength={2}
                                value={formData.tenor}
                                onChange={handleChange}
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">Foto KTP:</label>
                            <input
                                type="file"
                                name="foto_ktp"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                required
                            />
                        </div>
                    )}

                    {/* Form Step 2 */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Jenis Produk:</label>
                            <select
                                id="jenis_produk"
                                name="jenis_produk"
                                value={formData.jenis_produk}
                                onChange={handleChange}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            >
                                <option value="">Pilih Jenis Produk</option>
                                <option value="MEJA">MEJA</option>
                                <option value="ETALASE">ETALASE</option>
                                <option value="GEROBAK">GEROBAK</option>
                                <option value="KURSI">KURSI</option>
                                <option value="BOOTH">BOOTH</option>
                            </select>
                            <label className="block text-sm font-medium text-gray-700">Ukuran:</label>
                            <input
                                type="text"
                                name="ukuran"
                                value={formData.ukuran}
                                onChange={handleChange}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">Harga:</label>
                            <input
                                type="number"
                                name="harga"
                                value={formData.harga}
                                onChange={handleChange}
                                required
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
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
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Subtotal: {formData.subtotal}</label>
                            </div>
                        </div>
                    )}

                    {/* Form Step 3 */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Bukti Bayar:</label>
                            <input
                                type="file"
                                name="bukti"
                                onChange={handleFileChange}
                                required
                                className=" p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                            <label className="block text-sm font-medium text-gray-700">DP:</label>
                            <input
                                type="number"
                                name="jumlahBayar"
                                value={formData.jumlahBayar || ''}
                                onChange={handleChange1}
                                required
                                className="p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                            />
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                            >
                                Kembali
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`px-4 py-2 ${currentStep === 3 ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-md`}
                        >
                            {currentStep === 3 ? 'Selesaikan' : 'Selanjutnya'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MultiStepForm;