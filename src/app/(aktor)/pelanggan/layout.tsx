"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'accessDenied' | 'missingBiodata' | 'allowed'>('loading');

  useEffect(() => {
    // const role = localStorage.getItem('role');
    const biodata = localStorage.getItem('biodata');
    
    // if (role === 'PELANGGAN') {
      if (!biodata) {
        setStatus('missingBiodata');
        setTimeout(() => {
          router.push('/biodata-baru'); // Redirect after showing message
        }, 3000); // Delay before redirect
        return;
      }
      setStatus('allowed');
    // } else {
    //   setStatus('accessDenied');
    //   router.push('/kepala-divisi/not-found'); // Redirect to 404 page if role is not correct
    // }
  }, [router]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Show loading until role is checked
  }

  if (status === 'accessDenied') {
    return <div>Access Denied</div>;
  }

  if (status === 'missingBiodata') {
    return <div className='fixed flex z-50 justify-center items-center inset-0 bg-black bg-opacity-10 text-primary  font-semibold px-4 py-2 rounded'>Anda belum memiliki biodata. Mengarahkan ke halaman biodata baru...</div>;
  }

  return (
    <main>{children}</main>
  );
};

export default Layout;
