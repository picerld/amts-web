import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="default"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="border-2 border-black"
    >
      <Sun className="!h-5 !w-5 dark:hidden" strokeWidth={2.5} />
      <Moon className="!h-5 !w-5 hidden dark:block" strokeWidth={2.5} />
    </Button>
  );
}
