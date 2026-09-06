import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import NotificationPopup from './NotificationPopUp';
import { useModal } from './ModalContext';

interface Product {
    jenis_produk: string;
    ukuran: string;
    harga: number;
    jumlah: number;

}
interface MultiStepFormProps {
    onClose: () => void;
}

interface FormData {
    // Pembelian
    nama: string;
    alamat: string;
    no_hp: string;
    jenis_kelamin: string;
    // Produk Pembelian
    produk: Product[];
    // Bukti Bayar
    tanggal: string;
    bukti: File | null;
    id_pembelian?: number;

}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ onClose }) => {

    const [currentStep, setCurrentStep] = useState(1);
    const [notification, setNotification] = useState<{ isVisible: boolean; message: string }>({
        isVisible: false,
        message: '',
    });

    const { showError, showNotification } = useModal();

    const [formData, setFormData] = useState<FormData>({
        nama: '',
        alamat: '',
        no_hp: '',
        jenis_kelamin: '',
        produk: [],
        tanggal: new Date().toISOString().split('T')[0],
        bukti: null,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, index?: number) => {
        const { name, value } = e.target;


        if (index !== undefined) {
            const updatedProduk = [...formData.produk];
            updatedProduk[index] = {
                ...updatedProduk[index],
                [name]: name === 'harga' || name === 'jumlah' ? (value === '' ? value : +value) : value
            };
            setFormData(prevData => ({ ...prevData, produk: updatedProduk }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prevData => ({
                ...prevData,
                bukti: e.target.files![0]
            }));
        }
    };

    const addProduct = () => {
        setFormData(prevData => ({
            ...prevData,
            produk: [...prevData.produk, { jenis_produk: '', ukuran: '', harga: 0, jumlah: 0 }]
        }));
    };

    const calculateSubtotal = () => {
        return formData.produk.reduce((total, prod) => total + (prod.harga * prod.jumlah), 0);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (currentStep === 1) {
                const genderCode = formData.jenis_kelamin === 'Laki-Laki' ? 'L' : 'P';
                const formattedDate = new Date().toLocaleDateString('en-CA');
                const pembelianData = {
                    tanggal_transaksi: formattedDate,
                    jenis_pembayaran: 'CASH',
                    nama: formData.nama,
                    alamat: formData.alamat,
                    no_hp: formData.no_hp,
                    jenis_kelamin: genderCode,
                };

                const pembelianResponse = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/pembelian/CASH', pembelianData);

                const { id } = pembelianResponse.data;
                setFormData(prevData => ({ ...prevData, id_pembelian: id }));
                setCurrentStep(2);
            } else if (currentStep === 2) {
                const produkData = formData.produk.map(p => ({
                    id_pembelian: formData.id_pembelian,
                    jenis_produk: p.jenis_produk,
                    ukuran: p.ukuran,
                    harga: p.harga,
                    jumlah: p.jumlah,
                }));

                for (const produk of produkData) {
                    await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/produk', produk);
                }

                setCurrentStep(3);
            } else if (currentStep === 3) {
                const formDataToSend = new FormData();
                formDataToSend.append('id_pembelian', formData.id_pembelian!.toString());
                formDataToSend.append('tanggal', formData.tanggal);
                if (formData.bukti) {
                    formDataToSend.append('bukti', formData.bukti);
                }
                formDataToSend.append('jumlah', calculateSubtotal().toString());

                const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/bukti', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                setNotification({
                    isVisible: true,
                    message: response.data.message,
                });

                // Reset form after submission
                setTimeout(() => {
                    setCurrentStep(1);
                    setFormData({
                        nama: '',
                        alamat: '',
                        no_hp: '',
                        jenis_kelamin: '',
                        produk: [],
                        tanggal: new Date().toISOString().split('T')[0],
                        bukti: null,
                    });
                    onClose() // Tutup form setelah reset
                }, 2000);
                showNotification("Data pembelian ditambahkan");
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showError('Error ketika mensubmit data, coba lagi');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-primary">
                {currentStep === 1 ? 'Step 1: Pembelian' :
                    currentStep === 2 ? 'Step 2: Produk Pembelian' :
                        'Step 3: Bukti Bayar'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {currentStep === 1 && (
                    <>
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama</label>
                            <input
                                type="text"
                                id="nama"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                className="mt-1 text-black p-1 block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat</label>
                            <textarea
                                id="alamat"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="no_hp" className="block text-sm font-medium text-gray-700">No HP</label>
                            <input
                                type="text"
                                id="no_hp"
                                name="no_hp"
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.value = input.value.replace(/[^0-9]/g, '');
                                }}
                                value={formData.no_hp}
                                onChange={handleChange}
                                maxLength={13}
                                minLength={11}
                                className="mt-1 p-1 block text-black w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                            <select
                                id="jenis_kelamin"
                                name="jenis_kelamin"
                                value={formData.jenis_kelamin}
                                onChange={handleChange}
                                className="mt-1 p-1 block text-black w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                required
                            >
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="Laki-Laki">Laki-Laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                    </>
                )}
                {currentStep === 2 && (
                    <>
                        <div className="max-h-[300px] overflow-y-auto"> {/* Membatasi tinggi dan memungkinkan scroll */}
                            {formData.produk.map((produk, index) => (
                                <div key={index} className="space-y-4">
                                    <div>
                                        <label htmlFor={`jenis_produk_${index}`} className="block text-sm font-medium text-gray-700">Jenis Produk</label>
                                        <select
                                            id={`jenis_produk_${index}`}
                                            name="jenis_produk"
                                            value={produk.jenis_produk}
                                            onChange={(e) => handleChange(e, index)}
                                            className="mt-1 p-1 block w-full text-black rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                            required
                                        >
                                            <option value="">Pilih Jenis Produk</option>
                                            <option value="MEJA">MEJA</option>
                                            <option value="ETALASE">ETALASE</option>
                                            <option value="GEROBAK">GEROBAK</option>
                                            <option value="KURSI">KURSI</option>
                                            <option value="BOOTH">BOOTH</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`ukuran_${index}`} className="block text-sm font-medium text-gray-700">Ukuran</label>
                                        <input
                                            type="text"
                                            id={`ukuran_${index}`}
                                            name="ukuran"
                                            value={produk.ukuran}
                                            onChange={(e) => handleChange(e, index)}
                                            className="mt-1 p-1 block w-full text-black rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`harga_${index}`} className="block text-sm font-medium text-gray-700">Harga</label>
                                        <input
                                            type="number"
                                            id={`harga_${index}`}
                                            name="harga"
                                            value={produk.harga}
                                            onChange={(e) => handleChange(e, index)}
                                            className="mt-1 p-1 block w-full text-black rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`jumlah_${index}`} className="block text-sm font-medium text-gray-700">Jumlah</label>
                                        <input
                                            type="number"
                                            id={`jumlah_${index}`}
                                            name="jumlah"
                                            value={produk.jumlah}
                                            onChange={(e) => handleChange(e, index)}
                                            className="mt-1 p-1 block w-full text-black rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="font-bold text-lg text-gray-700 mt-4">
                            Total Jumlah: Rp {calculateSubtotal().toLocaleString()}
                        </div>
                        <button type="button" onClick={addProduct} className="text-primary font-medium">Tambah Produk</button>
                    </>
                )}
                {currentStep === 3 && (
                    <>
                        <div>
                            <label htmlFor="bukti" className="block text-sm font-medium text-gray-700">Bukti Pembayaran</label>
                            <input
                                type="file"
                                id="bukti"
                                name="bukti"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 p-1 block w-full text-black rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                required
                            />
                        </div>
                        <div className="font-bold text-lg text-gray-700 mt-4">
                            Total Jumlah: Rp {calculateSubtotal().toLocaleString()}
                        </div>
                    </>
                )}
                <div className="flex justify-between mt-6">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="text-white bg-primary px-4 py-2 rounded-md"
                        >
                            Kembali
                        </button>
                    )}
                    <button
                        type="submit"
                        className="text-white bg-primary px-4 py-2 rounded-md"
                    >
                        {currentStep === 3 ? 'Selesaikan' : 'Lanjutkan'}
                    </button>
                </div>
            </form>
            <NotificationPopup
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={() => setNotification({ isVisible: false, message: '' })}
            />

        </div>
    );
};

export default MultiStepForm;
