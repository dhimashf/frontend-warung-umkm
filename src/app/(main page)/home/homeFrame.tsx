"use client";
import React from "react";
import {useRouter} from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/animations/Stagger";

const HomeFrame: React.FC = () => {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  return (
    <section>
      <div className="flex flex-col mx-auto md:flex-row items-center mb-20 justify-between gap-12">
        {/* Teks dan Button */}
        <StaggerContainer className="w-full md:w-1/2 h-full flex flex-col space-y-8 justify-center z-10">
          {/* Heading */}
          <StaggerItem className="h-auto md:h-auto flex items-start justify-start">
            <p className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] text-gray-900 leading-[1.1] tracking-tight">
              Dukung <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#4ade80]">UMKM Riau</span> <br className="hidden md:block"/> dengan Fasilitas
              Terbaik.
            </p>
          </StaggerItem>

          {/* Subheading & Tombol */}
          <StaggerItem className="space-y-6">
            <p className="text-lg md:text-xl w-full md:w-5/6 text-gray-500 leading-relaxed font-light">
              Menyediakan berbagai barang dan peralatan UMKM berkualitas premium yang
              bisa dibeli atau disewa dengan mudah.
            </p>
            <div className="flex items-center justify-start space-x-4 pt-2">
              <button 
              className="h-14 px-8 bg-primary text-white rounded-full shadow-[0_8px_30px_rgb(47,104,53,0.3)] hover:shadow-[0_8px_30px_rgb(47,104,53,0.5)] hover:-translate-y-1 transition-all duration-300 ease-out font-semibold text-lg"
              onClick={() => {router.push("/produk")}}>
                Produk Kami
              </button>
              <button 
              className="h-14 px-8 border border-gray-200 bg-white/60 backdrop-blur-md rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 ease-out text-gray-700 font-semibold text-lg"
              onClick={() => {router.push("/layanan")}}>
                Layanan Kami
              </button>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/*Gambar*/}
        <motion.div 
          className="flex-1 justify-center hidden lg:block relative"
          animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          {/* Decorative glowing orb behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[100px] rounded-full"></div>
          
          <div
            className="relative w-full h-[600px] rounded-[2.5rem] border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
            style={{
              backgroundImage: `url('https://i.pinimg.com/736x/84/a5/22/84a5227a7adbf9e64388c54af4ff248d.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeFrame;
