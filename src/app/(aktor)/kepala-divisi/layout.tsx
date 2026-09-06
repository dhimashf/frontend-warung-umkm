"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null for loading state

  useEffect(() => {
    // TEMPORARY: Bypassing authentication for testing
    // const role = localStorage.getItem('role');
    // if (role === 'KEPALA DIVISI') {
      setHasAccess(true);
    // } else {
    //   setHasAccess(false);
    //   router.push('/kepala-divisi/not-found'); // Redirect to 404 page if role is not correct
    // }
  }, [router]);

  if (hasAccess === null) {
    return <div>Loading...</div>; // Show loading until role is checked
  }

  if (!hasAccess) {
    return <div>Access Denied</div>; 
  }

  return (
    <main>{children}</main>
  );
};

export default Layout;
