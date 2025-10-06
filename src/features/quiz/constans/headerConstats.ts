import { StatusConfig } from "../components/container/LobbyHeader";

export const MAX_WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
  full: "w-full",
};

export const DEFAULT_STATUS_CONFIG: Record<string, StatusConfig> = {
  ONGOING: {
    label: "Ongoing",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    animated: true,
  },
  WAITING: {
    label: "Waiting",
    className: "bg-blue-100 text-blue-700 border border-blue-300",
    animated: true,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border border-green-300",
    animated: true,
  },
  ENDED: {
    label: "Ended",
    className: "bg-gray-100 text-gray-700 border border-gray-300",
    animated: true,
  },
};