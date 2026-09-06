import React from "react";
import Navbar from "@/app/(main page)/navbar";
import HomeFrame from "@/app/(main page)/home/homeFrame";
import ProdukFrame from "@/app/(main page)/home/produkFrame";
import LayananFrame from "./(main page)/home/layanan";
import TentangFrame from "./(main page)/home/tentang";
import Footer from "./(main page)/footer";
import { PageTransition } from "@/components/animations/PageTransition";

const HomePage: React.FC = () => {
  return (
    <PageTransition type="fade" className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-gray-50 selection:bg-primary/20">
      <Navbar />
      <main className="relative px-6 py-24 md:px-20 lg:px-40 md:py-32 space-y-32">
        <HomeFrame />
        <ProdukFrame />
        <LayananFrame />
        <TentangFrame />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default HomePage;
