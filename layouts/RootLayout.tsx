"use client";

import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { usePathname } from 'next/navigation';;


interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useLocation();

  return (
    <>
      <Helmet>
        <title>ZTOI Tech Internship</title>
        <meta name="description" content="Launch your tech career with ZTOI Tech's free online internship program. Get real projects, mentorship, and an industry certificate." />
      </Helmet>
      <ScrollRestoration />
      {children}
    </>
  );
}
