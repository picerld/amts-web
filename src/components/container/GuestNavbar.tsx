import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import { Home } from "lucide-react";
import { buttonVariants } from "../ui/button";

export default function GuestNavbar() {
  return (
    <header className="w-full fixed bg-background shadow-shadow py-5 px-10">
      <div className="container mx-auto flex items-center justify-between">
        <nav className="flex items-center justify-center w-full gap-6">
          <Link href={"/"} className={buttonVariants({ variant: "default" })}>
            <Home className="!w-6 !h-6" strokeWidth={2} />
            Home
          </Link>
        </nav>
        <div className="flex justify-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
