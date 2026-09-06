"use client";
import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import ProgressBar from "@/components/ProgressBar";
import { useRouter } from 'next/navigation';
import { MdOutlineArrowBackIos } from "react-icons/md";

const Biodata: React.FC = () => {
  type FormData = {
    nik: string;
    noHp: string;
    nama: string;
    jenisKelamin: string;
    alamat_domisili: string;
    alamat_ktp: string;
    fotoKTP: File | null;

  };

  const [formData, setFormData] = useState<FormData>({
    nik: "",
    noHp: "",
    nama: "",
    jenisKelamin: "",
    alamat_domisili: "",
    alamat_ktp: "",
    fotoKTP: null,

  });


  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const steps = [
    { name: 'Login', status: 'completed' as const },
    { name: 'Data Diri', status: 'current' as const },
    { name: 'Pengajuan', status: 'upcoming' as const },
    { name: 'Proses Survey', status: 'upcoming' as const },
    { name: 'Pembayaran', status: 'upcoming' as const },
  ];

  useEffect(() => {
      const biodata = localStorage.getItem("biodata");
      if (biodata) {
        // Redirect to the specific page if biodata exists
        router.replace("/biodata-baru/pengajuan-sewa");
      }

      const noHpFromStorage = localStorage.getItem("no_hp");
    if (noHpFromStorage) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        noHp: noHpFromStorage,
      }));
    }
  }, [router]);



  // Validation function
  const validateForm = () => {
    const emptyFields: string[] = [];
    for (const key in formData) {
      if (formData[key as keyof typeof formData] === "" && key !== "fotoKTP") {
        emptyFields.push(key);
      }
    }

    if (!formData.fotoKTP) {
      emptyFields.push("fotoKTP");
    }

    setErrorFields(emptyFields); // Make sure to update the errorFields state
    return emptyFields.length === 0;
  };

  if (uploadError) {
    console.error(uploadError);
    // or display an error message to the user
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/png", "image/jpeg"];
      const maxSize = 2 * 1024 * 1024; // 2MB
  
      // Validasi tipe file
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Hanya file JPG atau PNG yang diperbolehkan.");
        return;
      }
  
      // Validasi ukuran file
      if (file.size > maxSize) {
        setUploadError("Ukuran file tidak boleh lebih dari 2MB.");
        return;
      }
  
      // Reset pesan error dan simpan file
      setUploadError(null);
      setFormData({
        ...formData,
        fotoKTP: file, // Simpan file yang dipilih ke state
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      console.log("Form is invalid!");
      return;
    }
    setIsLoading(true);
  
    const id_akun = localStorage.getItem("id_akun");
  
    if (!id_akun) {
      console.error("ID Akun tidak ada");
      return;
    }
  
    // Membuat FormData untuk mengirim file
    const formDataToSend = new FormData();
    
    formDataToSend.append("nik", formData.nik);
    formDataToSend.append("nama", formData.nama);
    formDataToSend.append("alamat", formData.alamat_ktp);
    formDataToSend.append("jenis_kelamin", formData.jenisKelamin === "Laki-Laki" ? "L" : "P");
    formDataToSend.append("alamat_domisili", formData.alamat_domisili);
    if (formData.fotoKTP) {
      formDataToSend.append("foto_ktp", formData.fotoKTP);
    }
    formDataToSend.append("akun_id_akun", id_akun as string);
    
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/biodata",
        {
          method: "POST",
          body: formDataToSend,
        }
      );
  
      const responseData = await response.json();
  
      if (response.ok) {
        console.log("Form submitted successfully:", responseData);
  
        // Ambil biodata dari API GET setelah POST berhasil
        const biodataResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/biodata/${id_akun}`
        );
  
        if (biodataResponse.ok) {
          const biodataData = await biodataResponse.json();
          console.log("Biodata retrieved successfully:", biodataData);
  
          // Simpan biodata ke localStorage
          localStorage.setItem("biodata", JSON.stringify(biodataData.data));
  
          // Redirect ke halaman berikutnya
          router.push("/biodata-baru/pengajuan-sewa");
        } else {
          console.error("Error retrieving biodata:", await biodataResponse.text());
        }
      } else {
        console.log("Error:", responseData.message);
      }
    } catch (error) {
      console.log("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col mx-auto max-w-4xl gap-2">
        {/* Breadcrumb */}
        <nav className="text-lg text-black" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="text-primary">/ Data Penyewa</li>
          </ol>
        </nav>
        <button
          onClick={() => router.push('/layanan#sewa')}
          className="font-semibold text-left flex w-fit py-2 pl-2 hover:bg-opacity-70 pr-3 items-center rounded-full hover:ring-2 hover:ring-primary hover:ring-opacity-25  bg-primary text-white hover:underline mb-4"
          >
          <MdOutlineArrowBackIos className="mr-2  text-white" />
          <span>Kembali</span>
        </button>
      </div>


      {/* Step Progress */}
      <div className="max-w-4xl p-4 md:p-0 mx-auto justify-center items-center">
        <ProgressBar steps={steps}/>
      </div>

      <div className="max-w-4xl h-fit mx-auto bg-white shadow-lg rounded-lg text-black p-6">
        <h1 className="text-2xl font-bold text-primary text-center mb-4">Data Diri Calon Penyewa</h1>
        <form className="space-y-4 h-full" onSubmit={handleSubmit}>
          <div className="flex flex-row overflow-auto gap-4 ">
            {/* NIK */}
            <div className="w-full">
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700 capitalize">NIK <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="nik"
                value={formData.nik}
                placeholder="Masukkan 16 karakter NIK"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData({ ...formData, nik: value });
                  }
                }}
                maxLength={16}
                className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${errorFields.includes('nik') ? 'border-red-500' : 'border-gray-300'}`}
              />
              <div className="flex flex-row justify-between">
                <p className="text-gray-500 text-xs mt-1">{formData.nik.length}/16 karakter</p>
                {errorFields.includes('nik') && <p className="text-red-500 text-xs mt-1">Field ini harus diisi!</p>}
              </div>
            </div>

            {/* No HP */}
            <div className="w-full">
              <label htmlFor="noHp" className="block text-sm font-medium text-gray-700 capitalize">No HP <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="noHp"
                value={formData.noHp}
                placeholder="Masukkan No HP Anda"
                readOnly
                
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData({ ...formData, noHp: value });
                  }
                }}
                maxLength={13}
                className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${errorFields.includes('noHp') ? 'border-red-500' : 'border-gray-300'}`}
              />
              <div className="flex flex-row justify-between">
                <p className="text-gray-500 text-xs mt-1">{formData.noHp.length}/13 karakter</p>
                {errorFields.includes('noHp') && <p className="text-red-500 text-xs mt-1">Field ini harus diisi!</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-4">
            {/* Nama */}
            <div className="w-full">
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 capitalize">Nama <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="nama"
                value={formData.nama}
                placeholder="Masukkan nama anda"
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                maxLength={40}
                className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${errorFields.includes('nama') ? 'border-red-500' : 'border-gray-300'}`}
              />
              <div className="flex flex-row justify-between">
                <p className="text-gray-500 text-xs mt-1">{formData.nama.length}/40 karakter</p>
                {errorFields.includes('nama') && <p className="text-red-500 text-xs mt-1">Field ini harus diisi!</p>}
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div className="w-full">
              <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700 capitalize">Jenis Kelamin <span className="text-red-500">*</span></label>
              <select
                id="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${errorFields.includes('jenisKelamin') ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="" disabled>Pilih jenis kelamin</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <div className="flex flex-row justify-end">
                {errorFields.includes('jenisKelamin') && <p className="text-red-500 text-xs mt-1">Field ini harus diisi!</p>}
              </div> 
             </div>
          </div>

          {/* Alamat Domisili */}
          <div>
            <label htmlFor="alamat_domisili" className="block text-sm font-medium text-gray-700 capitalize">Alamat Domisili <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="alamat_domisili"
              value={formData.alamat_domisili}
              placeholder="Masukkan alamat tempat tinggal anda saat ini"
              maxLength={40}
              onChange={(e) => setFormData({ ...formData, alamat_domisili: e.target.value })}
              className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${errorFields.includes('alamat_domisili') ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="flex flex-row justify-between">
              <p className="text-gray-500 text-xs mt-1">{formData.alamat_domisili.length}/40 karakter</p>
              {errorFields.includes('alamat_domisili') && <p className="text-red-500 text-xs mt-1">Field ini harus diisi!</p>}
            </div>
          </div>

          {/* Alamat KTP */}
          <div>
            <label htmlFor="alamat_ktp" className="block text-sm font-medium text-gray-700 capitalize">Alamat Sesuai KTP <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="alamat_ktp"
              value={formData.alamat_ktp}
              placeholder="Masukkan alamat yang tertera pada KTP"
              maxLength={40}
              onChange={(e) => setFormData({ ...formData, alamat_ktp: e.target.value })}
              className={`bg-gray-50 mt-1 block w-full rounded-md border shadow-inner px-3 py-2 text-black focus:ring focus:ring-primary-200 focus:ring-opacity-50 ${errorFields.includes('alamat_ktp') ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="flex flex-row justify-between">
              <p className="text-gray-500 text-xs mt-1">{formData.alamat_ktp.length}/40 karakter</p>
              {errorFields.includes('alamat_ktp') && <p className="text-red-500 text-xs mt-1">Field ini harus diisi!</p>}
            </div>
          </div>

          {/* Foto KTP */}
          <div>
            <label htmlFor="fileKTP" className="block text-sm font-medium text-gray-700">
              Foto KTP <span className="text-red-500">*</span>
            </label>
            <div
              className={`bg-gray-50 mt-2 w-full h-52 border-2 ${
                errorFields.includes('fotoKTP') ? 'border-red-500' : 'border-dashed border-primary-300'
              } rounded-md flex items-center justify-center overflow-hidden shadow-inner cursor-pointer`}
              onClick={() => document.getElementById('fileKTP')?.click()}
            >
              {formData.fotoKTP ? (
                <img
                src={URL.createObjectURL(formData.fotoKTP)}
                alt="Foto KTP"
                className="object-contain w-full h-full"
              />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="text-4xl text-gray-400" />
                  <p className="text-gray-500 mt-2 text-sm">Klik untuk upload foto KTP</p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="fileKTP"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {errorFields.includes('fotoKTP') && (
              <p className="text-red-500 text-xs mt-2">Field ini harus diisi!</p>
            )}
          </div>



          {/* Submit Button */}
          <div className="text-center mt-6 w-full">
            <button
              type="submit"

              className="px-4 py-2 bg-primary text-white w-full font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-opacity-50"
            >
              {isLoading ? "Memuat..." : "Selanjutnya"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Biodata;
