import {
  Menu,
  Bell,
  Search,
  Home,
  ChevronLeft,
  LogOut,
  UserPen,
  UsersRound,
  NotebookPen,
  Album,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import React, { useEffect, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { LogoutButton } from "../container/LogoutButton";
import { cn } from "@/lib/utils";
import { useSidebar } from "../container/SidebarContext";

export default function GuardedLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathName = usePathname();
  const router = useRouter();

  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed } =
    useSidebar();

  const token = Cookies.get("auth.token");

  const { data: user, isLoading } = trpc.auth.authMe.useQuery(
    token ? { token } : skipToken,
    {
      retry: false,
      enabled: !!token,
      refetchOnWindowFocus: false,
    }
  );

  const navItem = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Instructor List", href: "/instructors", icon: UserPen },
    { name: "Student List", href: "/students", icon: UsersRound },
    { name: "Subject", href: "/subjects", icon: NotebookPen },
    { name: "Report", href: "/reports", icon: Album },
  ];

  const updatedNavItem = navItem.map((item) => ({
    ...item,
    active: pathName === item.href || pathName.includes(item.href),
  }));

  const group1 = updatedNavItem.filter((item) =>
    ["Subject", "Report"].includes(item.name)
  );

  const group2 = updatedNavItem.filter((item) =>
    ["Dashboard", "Instructor List", "Student List"].includes(item.name)
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess() {
      toast.success("Berhasil Logout!", {
        description: "Silahkan login kembali!",
      });
      router.push("/");
    },
    onError(error) {
      console.log(error);
      toast.error("Gagal Logout!", {
        description: "Silahkan coba lagi!",
      });
    },
  });

  function handleLogout() {
    if (!token) {
      toast.error("Tidak ada token, gagal logout");
      return;
    }
    Cookies.remove("auth.token");
    logoutMutation.mutate({ token });
  }

  const NavItem = ({ item }: { item: (typeof updatedNavItem)[number] }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href}>
        <Button
          variant={item.active ? "default" : "neutral"}
          className={`w-full justify-start h-11 my-1.5 px-4 font-medium transition-all duration-200 hover:scale-[1.02] ${
            item.active
              ? "bg-main text-main-foreground shadow-shadow"
              : "hover:bg-main/10 hover:text-main hover:translate-x-1"
          } ${sidebarCollapsed ? "px-0 justify-center" : ""}`}
        >
          <Icon
            className={`h-5! w-5! ${sidebarCollapsed ? "" : "mr-3"}`}
            strokeWidth={2.5}
          />
          {!sidebarCollapsed && <span>{item.name}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Card
          className={`relative transition-all duration-300 ease-in-out border-r-4 border-border bg-secondary-background shadow-shadow rounded-none ${
            sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="flex items-start justify-between h-[4.23rem] px-4 border-b-4 border-border">
            {!sidebarCollapsed && (
              <Link
                href="/"
                className="flex items-center justify-center space-x-3"
              >
                <h1 className="text-2xl font-bold text-foreground">AFTS</h1>
              </Link>
            )}
            <Button
              variant="default"
              size={"sm"}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="bg-main text-main-foreground border-border hover:bg-main/90 hover:scale-105 transition-all duration-200"
            >
              {sidebarCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-6">
            <div className="px-4">
              {!sidebarCollapsed && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70 px-2">
                    User Database
                  </h3>
                </div>
              )}

              <div className="space-y-4">
                {group2.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </div>

            <div className="px-4">
              {!sidebarCollapsed && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground opacity-70 px-2">
                    Assessment Database
                  </h3>
                </div>
              )}

              <div className="space-y-2">
                {group1.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </div>
          </nav>

          <div className="pt-4 px-4 border-t-4 border-[var(--border)]">
            <Card
              className={cn(
                "p-4 bg-[var(--background)] border-[var(--border)]",
                sidebarCollapsed ? "rounded-full p-0" : "rounded-lg"
              )}
            >
              {!sidebarCollapsed ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      {isLoading ? (
                        <AvatarFallback className="bg-[var(--main)] text-[var(--main-foreground)] font-bold">
                          <Loader2 className="animate-spin h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-[var(--main)] text-[var(--main-foreground)] font-bold">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      {isLoading ? (
                        <span className="text-sm">Loading...</span>
                      ) : (
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {user?.username || "Unknown"}
                        </p>
                      )}
                      <p className="text-xs text-[var(--foreground)] opacity-70">
                        Online
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="neutral"
                    size="icon"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="h-8 w-8 text-[var(--foreground)] hover:bg-[var(--main)]/10 hover:text-[var(--main)]"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="neutral"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[var(--main)] text-[var(--main-foreground)] font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        {user?.username || "Unknown"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </Card>
          </div>
        </Card>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="border-b-4 border-[var(--border)] bg-[var(--secondary-background)] shadow-[var(--shadow)] rounded-none">
            <div className="flex items-center justify-between px-6 py-4 h-10">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="default" size="icon" className="lg:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="p-6 border-b-4 border-[var(--border)]">
                      <SheetTitle className="text-left">Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="py-6 space-y-6">
                      <div className="px-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2">
                          User Database
                        </h3>
                        <div className="space-y-2">
                          {group2.map((item) => {
                            const Icon = item.icon;
                            return (
                              <SheetClose asChild key={item.name}>
                                <Link href={item.href}>
                                  <Button
                                    variant={
                                      item.active ? "default" : "neutral"
                                    }
                                    className="w-full justify-start h-11 px-4"
                                  >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                  </Button>
                                </Link>
                              </SheetClose>
                            );
                          })}
                        </div>
                      </div>

                      <div className="px-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2">
                          Assessment Database
                        </h3>
                        <div className="space-y-2">
                          {group1.map((item) => {
                            const Icon = item.icon;
                            return (
                              <SheetClose asChild key={item.name}>
                                <Link href={item.href}>
                                  <Button
                                    variant={
                                      item.active ? "default" : "neutral"
                                    }
                                    className="w-full justify-start h-11 px-4"
                                  >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                  </Button>
                                </Link>
                              </SheetClose>
                            );
                          })}
                        </div>
                      </div>
                    </nav>

                    <SheetFooter className="p-4 border-t-4 border-[var(--border)]">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {user?.username || "Unknown"}
                          </span>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 w-64 bg-[var(--background)] border-[var(--border)] focus:ring-[var(--ring)]"
                  />
                </div>

                <Button variant="neutral" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600">
                    3
                  </Badge>
                </Button>

                <ModeToggle />

                <div className="hidden lg:block">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </Card>

          <main className="flex-1 overflow-auto bg-background">
            <div className="h-full p-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
