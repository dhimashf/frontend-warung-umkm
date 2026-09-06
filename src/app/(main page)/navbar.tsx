"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FaUserCircle } from "react-icons/fa"; // Import React Icon untuk akun
import Link from "next/link"; // Import Link dari next/link
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import ConfirmationPopup from "@/components/ConfirmationPopUp";
import { motion, useReducedMotion } from "framer-motion";


const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State untuk status login
  const [username, setUsername] = useState<string>(""); // State untuk username
  const [role, setRole] = useState<string>(""); // State untuk role
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk dropdown
  const router = useRouter();
  const [biodata, setBiodata] = useState<boolean>(false);
  const [isLogoutVisible, setLogoutVisible] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Create a ref for the dropdown

  useEffect(() => {
    // Periksa apakah token login ada di localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Ambil biodata dari localStorage
      const biodata = JSON.parse(localStorage.getItem("biodata") || "{}");
      if (biodata && biodata.nama) {
        console.log("Biodata retrieved:", biodata);
        setBiodata(true);
        setUsername(biodata.nama); // Set username sesuai dengan nama di biodata
      } else {
        console.log("Biodata not available or incomplete.");
        setUsername(""); // Pastikan username tidak di-set jika biodata tidak valid
      }
  
      setRole(localStorage.getItem("role") || "User"); // Set role, misalnya "Pelanggan" atau "Admin"
    } else {
      setIsLoggedIn(false);
    }
  }, []);
  

  // Close dropdown if click is outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Clean up on unmount
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
  };

  const handleDashboardRedirect = () => {
    if (role === "PELANGGAN" && biodata) {
      router.push("/pelanggan");
    } else if (role === "KEPALA DIVISI") {
      router.push("/kepala-divisi");
    } else if (role === "DIREKTUR") {
      router.push("/direktur");
    }
  };
  const handleLogout = () => {
    // Hapus token dari localStorage dan set isLoggedIn ke false
    localStorage.clear();
    setIsLoggedIn(false);
    setLogoutVisible(false);
    setIsDropdownOpen(false); // Close dropdown after logout
    window.location.reload();
  };
  const handleCanceLogout = () => {
    setLogoutVisible(false);
  }

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Layanan", href: "/layanan" },
    { name: "Produk", href: "/produk" },
    { name: "Tentang", href: "/tentang" },
  ];

  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      className="bg-white/80 backdrop-blur-md fixed w-full h-auto z-50 top-0 start-0 border-b border-black/5 shadow-sm"
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="#" className="flex items-center space-x-2 rtl:space-x-reverse group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-[#4ade80] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all">W</div>
          <span className="self-center text-xl font-bold font-outfit whitespace-nowrap text-gray-900 tracking-tight">
            Warung UMKM Riau
          </span>
        </a>
        <div className="flex md:order-2 space-x-2 rtl:space-x-reverse items-center">
          {/* Tampilkan tombol hanya jika belum login */}
          {!isLoggedIn && (
            <>
              <Link href="/login">
                <button
                  type="button"
                  className="text-gray-600 text-sm hover:text-primary font-semibold px-4 py-2 md:px-5 md:py-2.5 transition-colors"
                >
                  Masuk
                </button>
              </Link>
              <Link href="/register">
                <button
                  type="button"
                  className="text-white text-sm bg-primary hover:bg-[#245229] focus:ring-4 focus:outline-none focus:ring-primary/30 font-medium rounded-full px-5 py-2 md:px-6 md:py-2.5 text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Daftar
                </button>
              </Link>
            </>
          )}
          {/* Ikon akun, username, dan dropdown */}
          {isLoggedIn && (
            <div className="relative flex items-center space-x-2">
              <FaUserCircle className="w-6 h-6 text-primary" />
              
              {/* Tampilkan username hanya jika role adalah "PELANGGAN" */}
              {role === "PELANGGAN" &&  biodata === true
              ? (<div>
                <span className="text-primary font-medium mr-1">{username} </span>
                <span className="text-sm hidden xl:inline-block text-gray-500"> ({role})</span>
              </div>
              )
              : (<span className="text-base text-primary">{role}</span>
              
              )}
              
              
              <button
                onClick={toggleDropdown}
                className="flex items-center text-primary hover:text-primary ml-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef} // Attach the ref to the dropdown container
                  className="absolute right-0 top-8 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                >
                  <ul>
                    <li>
                      {role === "PELANGGAN" && biodata === true && (
                        <button
                          onClick = {() => router.push('/biodata')}
                          className="block w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200 border-b"
                          >
                          <AiOutlineUser className="w-4 h-4 inline-block mr-2 " /> Biodata
                        </button>
                      )}
                      <button
                        onClick={() => setLogoutVisible(true)}
                        className="py-2 w-full px-4 flex items-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-100"
                      >
                        <MdLogout className="w-4 h-4 inline-block mr-2" /> Logout
                      </button>

                      {isLogoutVisible && (
                        <ConfirmationPopup
                          title="Konfirmasi Logout"
                          message="Apakah Anda yakin ingin logout?"
                          onConfirm={handleLogout}
                          onCancel={handleCanceLogout}
                          confirmText="Ya, Logout"
                          cancelText="Batal"
                        />
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}


          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-primary rounded-lg md:hidden hover:bg-gray-200"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen ? "true" : "false"}
            onClick={toggleMenu}
          >
            <span className="sr-only">Menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between ${isMenuOpen ? "block" : "hidden"} w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:bg-transparent bg-white/90 md:border-none border border-gray-100 rounded-xl">
            {/* Tambahkan menu Dashboard */}
            {(role == "KEPALA DIVISI" || role == "DIREKTUR" || (role === "PELANGGAN" && biodata)) && (
              <li>
                <button
                  onClick={handleDashboardRedirect}
                  className={`block py-2 px-3 md:p-0 relative group transition-colors ${
                    pathname === "/dashboard"
                      ? "text-primary font-semibold"
                      : "text-gray-500 hover:text-gray-900 font-medium"
                  }`}
                >
                  Dashboard
                  <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full transition-transform origin-left duration-300 ${
                    pathname === "/dashboard" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}></span>
                </button>
              </li>
            )}
            {menuItems.map((item) => (
              <li key={item.name}>
                  <a
                  href={item.href}
                  className={`block py-2 px-3 md:p-0 relative group transition-colors ${
                    pathname === item.href
                      ? "text-primary font-semibold"
                      : "text-gray-500 hover:text-gray-900 font-medium"
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full transition-transform origin-left duration-300 ${
                    pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
