"use client";
import { CiCreditCard1 } from "react-icons/ci";
import { GoContainer } from "react-icons/go";
import { IoCashOutline } from "react-icons/io5";
import React from "react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/animations/Stagger";

const LayananFrame: React.FC = () => {
  const router = useRouter();  // Inisialisasi router

  // Fungsi untuk menavigasi berdasarkan tab yang dipilih
  const navigateToTab = (tab: string) => {
    router.push(`/layanan#${tab.toLowerCase()}`); // Navigasi ke halaman /layanan dengan fragment untuk tab
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <FadeIn className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center text-black">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Apa saja layanan kami?
          </h2>
          <p className="mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Kami menawarkan produk dengan menyediakan opsi transaksi penyewaan
            serta pembelian yang dapat dilakukan secara cash maupun kredit
          </p>
        </div>
        <StaggerContainer className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8 mx-auto">
          {/* Card untuk Cash */}
          <StaggerItem
            className="relative flex hover:bg-primary hover:text-white hover:shadow-lg group flex-col items-center p-12 bg-foreground shadow-md rounded-3xl space-y-4 cursor-pointer"
            onClick={() => navigateToTab('Cash')} // Menambahkan onClick untuk navigasi
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-lg">
              <IoCashOutline className="text-6xl group-hover:text-white text-primary" />
            </div>
            <h3 className="text-xl group-hover:text-white font-semibold text-black">Cash</h3>
            <p className="text-sm group-hover:text-white text-gray-600 text-center">
              Pembayaran langsung secara lunas
            </p>
          </StaggerItem>
          {/* Card untuk Kredit */}
          <StaggerItem
            className="relative flex hover:bg-primary hover:text-white hover:shadow-lg group   flex-col items-center p-12 bg-foreground shadow-md rounded-3xl space-y-4 cursor-pointer"
            onClick={() => navigateToTab('Kredit')} // Menambahkan onClick untuk navigasi
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-lg">
              <CiCreditCard1 className="text-6xl group-hover:text-white text-primary" />
            </div>
            <h3 className="text-xl font-semibold group-hover:text-white text-black">Kredit</h3>
            <p className="text-sm text-gray-600 group-hover:text-white text-center">
              Pembayaran dengan uang muka serta cicilan hingga 5x
            </p>
          </StaggerItem>
          {/* Card untuk Sewa */}
          <StaggerItem
            className="relative flex hover:bg-primary hover:text-white hover:shadow-lg group flex-col items-center p-12 bg-[#FCFCFC] shadow-md rounded-3xl space-y-4 cursor-pointer"
            onClick={() => navigateToTab('Sewa')} // Menambahkan onClick untuk navigasi
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-lg">
              <GoContainer className="text-6xl group-hover:text-white text-primary" />
            </div>
            <h3 className="text-xl font-semibold group-hover:text-white text-black">Sewa</h3>
            <p className="text-sm text-gray-600 group-hover:text-white text-center">
              Penyewaan booth
            </p>
          </StaggerItem>
        </StaggerContainer>
      </FadeIn>
    </section>
  );
};

export default LayananFrame;
