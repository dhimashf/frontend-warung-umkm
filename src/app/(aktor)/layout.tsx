"use client";

import { ReactNode, useState, useEffect } from "react";
import Navbar from "@/app/(aktor)/navbar";
import Sidebar from "@/app/(aktor)/sidebar";
import { usePathname, useRouter } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Ekstraksi peran pengguna dari URL
  const userRole = pathname.split("/")[1] as "direktur" | "kepala-divisi" | "pelanggan";

  // State untuk toggle sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fungsi untuk toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // TEMPORARY: Bypassing authentication for testing
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   router.push("/login");
    // } else {
      setIsAuthenticated(true);
    // }
  }, [router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>; // Optionally, show a loading state
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar role={userRole} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />
        {/* Main Content */}
        <main className="py-6 mt-10 md:mt-12">{children}</main>
      </div>

      {/* Overlay untuk menutup sidebar di layar kecil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
