import { Poppins } from "next/font/google";
import GuestNavbar from "../container/GuestNavbar";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={`${poppins.variable} antialiased scroll-smooth w-full min-h-screen`}
    >
      <GuestNavbar />

      <div className="min-h-screen">{children}</div>
    </main>
  );
}
