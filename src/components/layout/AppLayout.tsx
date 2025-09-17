import { Poppins } from "next/font/google";
import Navbar from "../container/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={`${poppins.variable} antialiased scroll-smooth w-full min-h-screen`}
    >
      <Navbar />

      {children}

      <footer className="flex min-h-16 border-t-2 p-4 mt-10">
        <p className="w-full text-center text-muted-foreground">
          &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
