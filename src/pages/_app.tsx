import { AppProps } from "next/app";
import { trpc } from "@/utils/trpc";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SidebarProvider } from "@/components/container/SidebarContext";
import {
  disconnectSocket,
  getUserIdFromCookie,
  initializeSocket,
} from "@/utils/socket";
import { NotificationProvider } from "@/features/quiz/context/NotificationContext";
import { SocketProvider } from "@/features/quiz/providers/SocketProvider";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const userId = getUserIdFromCookie();

    if (userId) {
      try {
        setTimeout(() => {
          initializeSocket();
        }, 500);
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc" })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className={poppins.className}>
            <SocketProvider>
              <SidebarProvider>
                <NotificationProvider>
                  <Component {...pageProps} />
                </NotificationProvider>
              </SidebarProvider>
            </SocketProvider>
            <Toaster />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default MyApp;
