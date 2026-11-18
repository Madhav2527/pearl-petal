import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#39342F",
};

export const metadata: Metadata = {
  title: "Petal & Pearl | Beauty in Every Little Detail",
  description: "Boutique online jewelry, hair accessories, and everyday essentials crafted with gentle elegance.",
  metadataBase: new URL("https://thepearlpetals.in"),
  openGraph: {
    title: "Petal & Pearl — Boutique Fashion Accessories",
    description: "Beauty in Every Little Detail. Discover handcrafted baroque pearl jewelry, French hair bows, and everyday keepsakes.",
    url: "https://thepearlpetals.in",
    siteName: "Petal & Pearl",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <CartProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
