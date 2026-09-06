"use client";
import React, { useState } from "react";
import TabLayout2 from "@/components/TabLayout2";
import dynamic from "next/dynamic";
// import { FaPlus } from "react-icons/fa";
// import { BsJournalPlus } from "react-icons/bs";

const RiwayatPenyewaan = dynamic(() => import("./transaksi-sewa"));
const TransaksiCash = dynamic(() => import("./transaksi-cash"));
const TransaksiKredit = dynamic(() => import("./transaksi-kredit"));

const DataTransaksi: React.FC = () => {
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"Cash" | "Kredit" | "Pembayaran Kredit" | null>(null);

  const [cashFormData, setCashFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    nama: "",
    noHp: "",
    alamat: "",
    produk: [{ nama: "", ukuran: "", harga: 0, jumlah: 0 }],
    total: 0,
    buktiPembayaran: null as File | null,
  });

  const handleCashFormChange = (field: string, value: string | number | { index: number; data: Record<string, unknown> }) => {
    setCashFormData((prev) => {
      if (field === "produk" && typeof value === "object" && "index" in value) {
        const newProduk = [...prev.produk];
        newProduk[value.index] = { ...newProduk[value.index], ...value.data };
        return { ...prev, produk: newProduk, total: calculateTotal(newProduk) };
      }
      return { ...prev, [field]: value };
    });
  };

  const calculateTotal = (produk: { harga: number; jumlah: number }[]) => {
    return produk.reduce((total, item) => total + item.harga * item.jumlah, 0);
  };

  const handleSaveCash = () => {
    console.log("Form Cash Data Submitted:", cashFormData);
    setSelectedOption(null); // Menutup modal setelah submit
  };

  const handleOptionSelect = (option: "Cash" | "Kredit" | "Pembayaran Kredit") => {
    setSelectedOption(option);
    setShowOptionModal(false);
  };

  const tabs = [
    {
      label: "Sewa",
      content: (

          <div className="relative">
          
          <RiwayatPenyewaan />
          </div>
      ),
    },
    {
      label: "Cash",
      content: <TransaksiCash />,
    },
    {
      label: "Kredit",
      content: <TransaksiKredit />,
    },
  ];

  return (
    <div className="p-6 rounded-xl mx-auto max-w-sm sm:max-w-full">
      
      <TabLayout2 tabs={tabs} />

      {showOptionModal && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOptionModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 text-black w-1/3">
            <h2 className="text-xl font-bold mb-4">Pilih Opsi Pembayaran</h2>
            <button
              onClick={() => handleOptionSelect("Cash")}
              className="block w-full text-center py-2 mb-2 bg-primary text-white rounded-lg hover:bg-opacity-80"
            >
              Cash
            </button>
            <button
              onClick={() => handleOptionSelect("Kredit")}
              className="block w-full text-center py-2 mb-2 bg-primary text-white rounded-lg hover:bg-opacity-80"
            >
              Kredit
            </button>
            <button
              onClick={() => handleOptionSelect("Pembayaran Kredit")}
              className="block w-full text-center py-2 mb-2 bg-primary text-white rounded-lg hover:bg-opacity-80"
            >
              Pembayaran Kredit
            </button>
          </div>
        </div>
      )}

      {selectedOption === "Cash" && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-1/3 text-black">
            <h2 className="text-xl font-bold mb-4">Form Cash</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveCash(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama:</label>
                <input
                  type="text"
                  value={cashFormData.nama}
                  onChange={(e) => handleCashFormChange("nama", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nomor HP:</label>
                <input
                  type="text"
                  value={cashFormData.noHp}
                  onChange={(e) => handleCashFormChange("noHp", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <button
                type="submit"
                className="block w-full text-center py-2 bg-primary text-white rounded-lg"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}
      {selectedOption === "Kredit" && <div>Form untuk Kredit</div>}
      {selectedOption === "Pembayaran Kredit" && <div>Form untuk Pembayaran Kredit</div>}

    </div>
  );
};

export default DataTransaksi;
