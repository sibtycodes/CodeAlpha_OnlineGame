import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastContainer} from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: "~ Syed Sibtain Ali Shah",
  description: "Multiplayer Riddles Online Game ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer position="top-right" style={{zIndex:99999}} />
        <Navbar/>
        
        {children}
        
        </body>
    </html>
  );
}
