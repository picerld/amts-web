import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import { BookMarked, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="w-full fixed bg-background shadow-shadow py-5 px-10">
      <div className="container mx-auto flex items-center justify-between">
        <nav className="flex items-center justify-center w-full gap-6">
          <Link href={"/dashboard"} className={buttonVariants({ variant: "default" })}>
            <Home className="!w-6 !h-6" strokeWidth={2} />
          </Link>
          <Button
            onClick={() => {
              router.push("/question/create");
              localStorage.removeItem("bankId");
              localStorage.removeItem("topicTitle");
            }}
          >
            <BookMarked className="!w-6 !h-6" strokeWidth={2} />
          </Button>
        </nav>
        <div className="flex justify-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
