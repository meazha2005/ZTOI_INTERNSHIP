import type { Metadata } from 'next';
import Providers from '@/lib/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ZTOI Tech Internship',
  description: 'Launch your tech career with ZTOI Tech\'s free online internship program. Get real projects, mentorship, and an industry certificate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-background text-foreground font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
