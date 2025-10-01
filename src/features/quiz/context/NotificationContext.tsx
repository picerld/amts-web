"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import NotificationQuizz from "../components/ui/notification-quiz";

interface NotificationData {
  title: string;
  description?: string;
}

interface NotificationContextType {
  showNotif: (data: NotificationData) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifData, setNotifData] = useState<NotificationData | null>(null);
  const [visible, setVisible] = useState(false);

  const showNotif = ({ title, description }: NotificationData) => {
    setNotifData({ title, description });
    setVisible(true);

    setTimeout(() => setVisible(false), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotif }}>
      {children}
      <NotificationQuizz
        visible={visible}
        title={notifData?.title}
        description={notifData?.description}
        onClose={() => setVisible(false)}
      />
    </NotificationContext.Provider>
  );
};
