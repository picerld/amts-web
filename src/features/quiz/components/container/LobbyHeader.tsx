"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import {
  DEFAULT_STATUS_CONFIG,
  MAX_WIDTH_CLASSES,
} from "../../constans/headerConstats";

export interface StatusConfig {
  label: string;
  className: string;
  animated?: boolean;
}

interface LobbyHeaderProps {
  children?: ReactNode;

  title?: string;
  subtitle?: string | ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;

  lobby?: {
    name?: string;
    status?: string;
    instructor?: { username?: string };
  };

  withBack?: boolean;
  backHref?: string;
  onBack?: () => void;

  status?: string;
  statusConfig?: Record<string, StatusConfig>;
  customStatusBadge?: ReactNode;

  padded?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";

  headerClassName?: string;
  containerClassName?: string;
  gradientFrom?: string;
  gradientTo?: string;

  rightContent?: ReactNode;
  belowHeader?: ReactNode;
}

export default function LobbyHeader({
  children,
  title,
  subtitle,
  icon: Icon = Shield,
  iconClassName = "bg-blue-600",
  lobby,
  withBack = false,
  backHref = "/lobby",
  onBack,
  status,
  statusConfig = DEFAULT_STATUS_CONFIG,
  customStatusBadge,
  padded = true,
  maxWidth = "7xl",
  headerClassName = "",
  containerClassName = "",
  gradientFrom = "from-blue-500/10",
  gradientTo = "to-transparent",
  rightContent,
  belowHeader,
}: LobbyHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      localStorage.removeItem("joinedLobby");
      router.push(backHref);
    }
  };

  const finalTitle = title || lobby?.name || "AFTS T50";
  const finalSubtitle =
    subtitle ||
    (lobby
      ? `Commander: ${lobby.instructor?.username || "Unknown"}`
      : "Lobby Quiz");
  const finalStatus = status || lobby?.status;

  const statusInfo = finalStatus ? statusConfig[finalStatus] : null;

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 ${containerClassName}`}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={`relative overflow-hidden bg-white shadow-lg ${headerClassName}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
        ></div>
        <div className="relative px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {withBack && (
                  <motion.button
                    onClick={handleBack}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 border border-blue-300 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}

                <motion.div
                  className={`p-3 ${iconClassName} rounded-full shadow-lg`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {finalTitle}
                  </h1>
                  {typeof finalSubtitle === "string" ? (
                    <p className="text-blue-600 font-medium">{finalSubtitle}</p>
                  ) : (
                    finalSubtitle
                  )}
                </div>
              </motion.div>

              <div className="flex items-center gap-3">
                {customStatusBadge ||
                  (statusInfo && (
                    <motion.div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.className}`}
                      animate={
                        statusInfo.animated ? { scale: [1, 1.05, 1] } : {}
                      }
                      transition={
                        statusInfo.animated
                          ? { repeat: Infinity, duration: 2 }
                          : {}
                      }
                    >
                      {statusInfo.label || finalStatus}
                    </motion.div>
                  ))}
                {rightContent}
              </div>
            </div>
          </div>
        </div>

        {belowHeader && (
          <div className="relative border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4">{belowHeader}</div>
          </div>
        )}
      </motion.div>

      <div className="px-6 py-8">
        <div
          className={`mx-auto ${
            padded ? MAX_WIDTH_CLASSES[maxWidth] : "w-full px-10"
          }`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
