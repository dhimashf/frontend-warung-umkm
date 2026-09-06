"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {FaStore, FaClipboardList, FaUser, } from 'react-icons/fa';
import { FaMapLocationDot } from "react-icons/fa6";

interface RentalData {
  nik: string;
  nama: string;
  noHp: string;
  status: string;
  durasi: number;
  lokasi: string;
  akhir_sewa: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [rentalData, setRentalData] = useState<RentalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRentalData = async () => {
      try {
        const biodata = localStorage.getItem('biodata');
        const token = localStorage.getItem('token');
        if (biodata) {
          const { nik, nama } = JSON.parse(biodata);
          console.log(nik, nama);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/nik/${nik}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRentalData({ ...response.data.data[0], nama });
          console.log(response.data.data[0]);
        } else {
          setRentalData(null);
        }
      } catch (error) {
        console.error('Error fetching rental data:', error);
        setRentalData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalData();
  }, []);

  const handleNavigateToApplication = () => {
    router.push('/biodata-baru/pengajuan-sewa');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3  gap-6 text-black">
        {/* Widget Biodata */}
        <Link href="/biodata" className="block">
          <div className="bg-white p-6 rounded-lg   shadow-md hover:shadow-lg transition-shadow">
            <FaUser className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Biodata</h2>
            <p className="text-gray-600">Lihat informasi pribadi Anda</p>
          </div>
        </Link>

        {/* Widget Pengajuan Sewa */}
        <Link href="/pelanggan/pengajuan-sewa" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <FaClipboardList className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pengajuan Sewa</h2>
            <p className="text-gray-600">Lihat data pengajuan sewa anda</p>
          </div>
        </Link>

        {/* Widget Booth Saya */}
        <Link href="/pelanggan/booth-saya" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <FaStore className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Booth Saya</h2>
            <p className="text-gray-600">Kelola booth yang sedang Anda sewa</p>
          </div>
        </Link>
      </div>

      {/* Ringkasan Informasi */}
<div className="mt-12 bg-white p-6 text-black rounded-lg shadow-md">
  <h2 className="text-2xl font-semibold mb-4">Ringkasan</h2>
  {rentalData ? (
    rentalData.status === 'MENUNGGU' ? (
      <div className="text-lg">
        <p className="mb-4">
          Pengajuan penyewaan kamu sedang dalam proses survey. Mohon bersabar ya...
        </p>
        <p>
          Kamu dapat melihat detailnya di laman{' '}
          <button
            className="text-primary font-medium underline focus:outline-none hover:text-primary-dark"
            onClick={() => router.push('/pelanggan/pengajuan-sewa')}
          >
            pengajuan sewa
          </button>.
        </p>
      </div>
    ) : (rentalData.status === 'DISETUJUI' || rentalData.status === 'DISEWA' || rentalData.status === 'INSPEKSI') ? (
      <div className="flex justify-between items-center">
        {/* Lokasi Booth */}
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm">Lokasi Booth</span>
          <a
            href={`https://www.google.co.id/maps/place/${encodeURIComponent(
              rentalData.lokasi
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg text-primary text-opacity-70 hover:text-opacity-95 underline"
          >
   
            <FaMapLocationDot />
              
            <span className='ml-1'>Klik untuk melihat lokasi</span>
          </a>
        </div>

        {/* Durasi */}
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm">Durasi</span>
          <span className="text-2xl font-bold">{rentalData.durasi} bulan</span>
        </div>

        {/* Sisa Durasi */}
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-sm">Sisa Durasi</span>
          <span className="text-2xl font-bold">
            {Math.max(
              0,
              Math.ceil(
                (new Date(rentalData.akhir_sewa).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            )}{' '}
            hari
          </span>
        </div>
      </div>
    ) : (
      <p className="text-lg text-red-500">Status penyewaan tidak diketahui.</p>
    )
  ) : (
    <div className="text-lg">
      <p className="mb-4">
        Hai <strong>{rentalData!.nama || "Pelanggan" }</strong>, kamu sedang tidak memiliki penyewaan booth nih.
      </p>
      <p>
        Jika kamu ingin melakukan penyewaan, maka{' '}
        <button
          className="text-primary font-medium underline focus:outline-none hover:text-primary-dark"
          onClick={handleNavigateToApplication}
        >
          ajukan disini
        </button>.
      </p>
    </div>
  )}
</div>


    </div>
  );
};

export default Dashboard;
