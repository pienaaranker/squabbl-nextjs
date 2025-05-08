'use client';

import dynamic from 'next/dynamic';

const InstallPWA = dynamic(() => import('./InstallPWA'), { ssr: false });

export default function ClientInstallPWAWrapper() {
  return <InstallPWA />;
} 