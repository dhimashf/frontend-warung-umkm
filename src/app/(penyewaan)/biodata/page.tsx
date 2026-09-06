"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import ConfirmationPopup from "@/components/ConfirmationPopUp";

interface User {
  nik: string;
  nama: string;
  alamat: string;
  jenis_kelamin: string;
  alamat_domisili: string;
  foto_ktp: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRented, setIsRented] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // State untuk pop-up
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("id_akun");

    if (!id) {
      setError("ID not found in local storage");
      setLoading(false);
      return;
    }

    const biodata = localStorage.getItem("biodata");

    if (!biodata) {
      router.push("/biodata-baru");
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/biodata/${id}`)
      .then((response) => {
        setUser(response.data.data);
        setLoading(false);
        console.log(response.data.data);

        const token = localStorage.getItem('token');
        axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}/api/penyewaan/nik/${response.data.data.nik}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((penyewaanResponse) => {
            console.log("Ada Ga",penyewaanResponse.data.data.length >0);

            if (penyewaanResponse.data.data.length >0) {
              setIsRented(true);
              console.log("Ada penyewaan");
            
            }
          })
          .catch(() => {
            console.log("No penyewaan record found");
          });
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  const handleDelete = async () => {
    const id = localStorage.getItem("id_akun");

    if (!id) {
      alert("ID not found in local storage");
      return;
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/biodata/${id}`);
      alert("Biodata berhasil dihapus");
      localStorage.removeItem("biodata");
      router.push("/");
    } catch (error) {
      console.error("Error deleting biodata:", error);
      alert("Gagal menghapus biodata. Silakan coba lagi.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-background shadow-lg pt-6 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col mx-auto max-w-4xl gap-2">
        <span className="text-gray-800 text-lg font-semibold">/Biodata</span>
        <button
          onClick={() => router.push("/pelanggan")}
          className="font-semibold text-left flex w-fit py-2 pl-2 hover:bg-opacity-70 pr-3 items-center rounded-full hover:ring-2 hover:ring-primary hover:ring-opacity-25  bg-primary text-white hover:underline mb-4"
        >
          <MdOutlineArrowBackIos className="mr-2  text-white" />
          <span>Kembali</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto bg-foreground rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Biodata Penyewa</h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Data Pribadi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 ">
                <InfoItem label="Nama" value={user.nama} />
                <InfoItem label="NIK" value={user.nik} />
                <InfoItem
                  label="Jenis Kelamin"
                  value={user.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Alamat</h2>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem label="Alamat KTP" value={user.alamat} />
                <InfoItem label="Alamat Domisili" value={user.alamat_domisili} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Foto KTP</h2>
              <div className="mt-2 border-2 flex items-center justify-center border-gray-300 border-dashed rounded-lg p-2">
                <img
                  src={user.foto_ktp}
                  alt="KTP"
                  width={300}
                  className="rounded-lg justify-center"
                />
              </div>
            </div>
          </div>

          {!isRented && (
            <div className="mt-8 border-t pt-6">
              <p className="text-lg text-gray-700 mb-4">
                Anda sudah tidak ingin menyewa lagi? Anda dapat menghapus biodata.
              </p>
              <button
                onClick={() => setShowConfirmation(true)} // Tampilkan pop-up
                className="flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-100"
              >
                <FaTrash />
                Hapus Biodata
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Render ConfirmationPopup */}
      {showConfirmation && (
        <ConfirmationPopup
          title="Hapus Biodata?"
          message="Apakah Anda yakin ingin menghapus biodata ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={() => {
            handleDelete();
            setShowConfirmation(false); // Tutup pop-up
          }}
          onCancel={() => setShowConfirmation(false)} // Tutup pop-up
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 px-4 py-3 rounded-lg">
      <label
        htmlFor="nama"
        className="block text-sm font-medium text-gray-700 capitalize"
      >
        {label}
      </label>
      <input
        type="text"
        id="nama"
        value={value}
        readOnly
        className="bg-gray-50 mt-1 block w-full text-xl rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50"
      />
    </div>
  );
}
