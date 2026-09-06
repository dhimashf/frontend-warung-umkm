// app/components/AddBayarSewaModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useModal } from "@/components/ModalContext";

interface AddBayarSewaModalProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Pembelian {
  booth_id_booth: null;
  biodata_nik: string;
  id_sewa: number;
  nama: string;
  nik: number;
  
}

interface BayarSewa {
  id_sewa: string;
  tanggal: string;
  jumlah: number | null;
  bukti: File | null;
}

const AddBayarSewaModal: React.FC<AddBayarSewaModalProps> = ({ isOpen, onClose }) => {
  const getFormattedDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
  };
  const { showError, showNotification } = useModal();
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [dropdownOptions, setDropdownOptions] = useState<{ id_sewa: number; nama: string;  }[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);



  useEffect(() => {
    const fetchPenyewaanData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/penyewaan', config);
        const pembelianData = response.data.data;
        // Filter penyewaan data to ensure booth_id_booth is not null
        const filteredData = pembelianData.filter((item: Pembelian) => item.booth_id_booth !== null);
  
        // Fetch nama for each ID Sewa
        const optionsWithNama = await Promise.all(
          filteredData.map(async (item: Pembelian) => {
            try {
              const biodataResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/biodata/nik/${item.biodata_nik}`, config);
              return {
                id_sewa: item.id_sewa,
                nama: biodataResponse.data.data.nama,
              };
            } catch (error) {
              console.error(`Error fetching nama for id_sewa ${item.id_sewa}:`, error);
              return { id_sewa: item.id_sewa, nama: item.nama }; // Fallback if error occurs
            }
          })
        );
  
        setDropdownOptions(optionsWithNama);
      } catch (error) {
        console.error('Error fetching pembelian data:', error);
      }
    };
  
    fetchPenyewaanData();
  }, []);
  

  

  const [formData, setFormData] = useState<BayarSewa>({
    id_sewa: '',
    tanggal: getFormattedDate(), // Tanggal hari ini
    jumlah: 0 || null,
    bukti: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'jumlah' ? Number(value) : value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, bukti: file });
  };

  const handleSubmit = async () => {
    if (!formData.id_sewa || formData.jumlah === null || formData.jumlah <= 0 || !formData.bukti) {

      showError('ID Sewa, Jumlah, dan Bukti harus diisi.');
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();
    form.append('id_sewa', formData.id_sewa);
    form.append('tanggal', formData.tanggal);
    form.append('jumlah', formData.jumlah.toString());
    form.append('bukti', formData.bukti);

    console.log('Data yang dikirim:', {
      id_sewa: formData.id_sewa,
      tanggal: formData.tanggal,
      jumlah: formData.jumlah,
      bukti: formData.bukti,
    });

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/api/sewa/add',
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Memeriksa status response dan success dari data yang diterima
      if (response.data.success) {
        showNotification('Data berhasil ditambahkan!');
        onClose();
      } else {
        // Jika 'success' di response data false atau tidak ada
        showError('Terjadi kesalahan: ' + (response.data.message || 'Coba lagi!'));
      }
    } catch (error) {
      console.error('Error adding bayar sewa:', error);
      showError('Terjadi kesalahan, coba lagi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center text-black justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Tambah Riwayat Bayar Sewa</h2>
        <div className="mb-4">
          <label htmlFor="id_sewa" className="block text-sm font-medium mb-1">
            ID Sewa
          </label>
          <select
                        name="id_sewa"
                        value={selectedId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedId(Number(value));
                          setFormData({ ...formData, id_sewa: value });
                        }}
                        
                        className="mt-1 p-1 text-black block w-full rounded-md border border-grey-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                        required
                    >
                        <option value="">Pilih ID</option>
                        {dropdownOptions.map((option, index) => (
                          <option key={`${option.id_sewa}-${index}`} value={option.id_sewa}>
                            {option.id_sewa} - {option.nama}
                          </option>
                        ))}
                    </select>

        </div>
        <div className="mb-4">
          <label htmlFor="tanggal" className="block text-sm font-medium mb-1">
            Tanggal
          </label>
          <input
            type="text"
            id="tanggal"
            name="tanggal"
            value={formData.tanggal}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="jumlah" className="block text-sm font-medium mb-1">
            Jumlah
          </label>
          <input
            type="number"
            id="jumlah"
            name="jumlah"
            value={formData.jumlah || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="mb-4">
  <label htmlFor="bukti" className="block text-sm font-medium mb-1">
    Bukti Pembayaran
  </label>
  <input
    type="file"
    id="bukti"
    name="bukti"
    accept="image/*"
    onChange={(e) => {
      handleFileChange(e);
      const file = e.target.files?.[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
      } else {
        setPreviewImage(null);
      }
    }}
    className="w-full border border-gray-300 rounded-lg p-2"
  />
</div>

    {previewImage && (
      <div className="mb-4">
        <p className="block text-sm font-medium mb-1">Preview Gambar</p>
        <img
          src={previewImage}
          alt="Preview Bukti Pembayaran"
          height={100}
          width={100}
          className=" rounded-lg border border-gray-300"
        />
      </div>
    )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBayarSewaModal;
