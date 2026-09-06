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
        <StaggerContainer className="w-full md:w-1/2 h-full flex flex-col space-y-6 justify-center">
          {/* Heading */}
          <StaggerItem className="h-auto md:h-auto flex items-start justify-start">
            <p className="font-bold text-3xl sm:text-4xl md:text-5xl text-black leading-snug">
              Dukung <span className="text-primary">Usaha UMKM</span> dengan Akses
              Mudah ke{" "}
              <span className="text-primary">
                Barang dan Peralatan Berkualitas!
              </span>
            </p>
          </StaggerItem>

          {/* Subheading & Tombol */}
          <StaggerItem className="space-y-4">
            <p className="text-md sm:text-lg md:text-xl w-full md:w-4/5 text-black leading-relaxed">
              Menyediakan berbagai barang dan peralatan UMKM berkualitas yang
              bisa dibeli atau disewa dengan mudah...
            </p>
            <div className="flex items-center justify-start space-x-4">
              <button 
              className="h-12 w-36 bg-primary rounded-3xl"
              onClick={() => {router.push("/produk")}}>
                Produk Kami
              </button>
              <button 
              className="h-12 w-36 border border-gray-300 rounded-3xl hover:border-primary duration-300 ease-in-out text-primary"
              onClick={() => {router.push("/layanan")}}>
                Layanan Kami
              </button>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/*Gambar*/}
        <motion.div 
          className="flex-1 justify-center hidden lg:block"
          animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <div
            className="w-full  h-[600px] rounded-t-full"
            style={{
              backgroundImage: `url('https://i.pinimg.com/736x/84/a5/22/84a5227a7adbf9e64388c54af4ff248d.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeFrame;
