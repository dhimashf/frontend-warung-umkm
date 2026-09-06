"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedPageProps {
  children: React.ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // Mendapatkan URL saat ini

  useEffect(() => {
    // TEMPORARY: Bypassing authentication for testing
    // const token = localStorage.getItem("token");
    // const role = localStorage.getItem("role"); // Mengambil role dari localStorage

    // if (!token) {
    //   const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    //   router.replace(loginUrl);
    //   return;
    // }

    // if (role !== "PELANGGAN") {
    //   // Arahkan ke halaman yang sesuai jika peran tidak valid
    //   router.replace("/penyewaan/not-found"); // Halaman untuk peran yang tidak diizinkan
    // }
  }, [router, pathname]);

  return <>{children}</>;
};

export default ProtectedPage;
