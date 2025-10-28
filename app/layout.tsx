import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { SplashScreen } from '@/components/splash-screen';
import { APIProvider } from '@/components/api-provider';

export const metadata: Metadata = {
  title: 'Next Gen Connect',
  description: 'Smart Helmet Navigation & Connectivity Hub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <APIProvider>
          <SplashScreen />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Toaster />
        </APIProvider>
      </body>
    </html>
  );
}
