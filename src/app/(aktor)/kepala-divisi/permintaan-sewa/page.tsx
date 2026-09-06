"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

import RentalRequestCard from "@/components/RentalRequestCard";
import PengajuanSewaModal from "./PengajuanSewaModal";
import { useModal } from '@/components/ModalContext';

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

interface APIRentalRequest {
  id_sewa: number;
  nama: string;
  permintaan_dibuat: string;
  noHp: string;
  biodata_nik: string;
  jenisKelamin: string;
  alamatDomisili: string;
  alamatKTP: string;
  fotoKTP: string;
  durasi: number;
  status: string;
  lokasi: string;
  booth_id_booth: string | null;
  mulai_sewa: string | null;
  akhir_sewa: string | null;
  bukti_bayar?: string | null;
}

export default function PermintaanSewa() {
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const { showNotification } = useModal();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const rentalResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (rentalResponse.data.success) {
          const rentalData = rentalResponse.data.data;

          const requests = rentalData.map((rental: any) => {
            return {
              id: rental.id_sewa,
              nama: rental.nama, // Asal dari JOIN biodata
              tanggalPermintaan: formatDate(rental.permintaan_dibuat),
              noHp: rental.no_hp || "-", // Asal dari JOIN akun
              nik: rental.nik, // Asal dari JOIN biodata
              jenisKelamin: formatGender(rental.jenis_kelamin),
              alamatDomisili: rental.alamat_domisili,
              alamatKTP: rental.alamat_ktp,
              fotoKTP: rental.foto_ktp,
              durasiPenyewaan: rental.durasi,
              status: rental.status,
              lokasiBooth: rental.lokasi,
              idbooth: rental.booth_id_booth,
              mulaiSewa: rental.mulai_sewa,
              akhirSewa: rental.akhir_sewa,
              buktiBayar: rental.bukti_bayar,
            };
          });

          const validRequests = requests.filter((request) => request !== null) as RentalRequest[];
          
          // Sort so MENUNGGU and MENUNGGU VERIFIKASI are at the top
          validRequests.sort((a, b) => {
            const isAPending = a.status === 'MENUNGGU' || a.status === 'MENUNGGU VERIFIKASI';
            const isBPending = b.status === 'MENUNGGU' || b.status === 'MENUNGGU VERIFIKASI';
            
            if (isAPending && !isBPending) return -1;
            if (!isAPending && isBPending) return 1;
            return 0;
          });

          setRentalRequests(validRequests);
        }
      } catch (error) {
        console.error("Error fetching rental requests:", error);
      }
    };

    fetchData();
  }, []);

  const formatGender = (gender: string) => {
    return gender === 'L' ? 'Laki-Laki' : gender === 'P' ? 'Perempuan' : 'Tidak Diketahui';
  };
  
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDetailClick = (request: RentalRequest) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const handleSave = (id: number, selectedBooth: string) => {
    setRentalRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'DISETUJUI', idbooth: selectedBooth } : req
    ));
    closeModal();
  };

  const handleDeleteRequest = (id: number) => {
    setRentalRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'DITOLAK' } : req
    ));
    closeModal();
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-6">Kelola Permintaan Sewa</h1>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {rentalRequests.length === 0 ? (
          <p className="text-gray-500 col-span-full">Tidak ada pengajuan sewa saat ini.</p>
        ) : (
          rentalRequests.map((request) => (
            <RentalRequestCard
              key={request.id}
              name={request.nama}
              tanggalPermintaan={request.tanggalPermintaan}
              noHp={request.noHp}
              status={request.status}
              onDetailClick={() => handleDetailClick(request)}
            />
          ))
        )}
      </div>

      <PengajuanSewaModal
        request={selectedRequest}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
}
