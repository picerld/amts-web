"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/utils/socket";
import Cookies from "js-cookie";
import { LobbyData } from "@/types/lobby";
import LobbyHeader from "@/features/quizz/components/container/LobbyHeader";
import CreateLobbyForm from "../components/CreateLobbyForm";
import InstructorLobbyList from "../components/InstructorLobbyList";
import { useNotification } from "@/features/quizz/context/NotificationContext";
import { useRouter } from "next/navigation";

type LobbyStatus = "WAITING" | "ONGOING" | "FINISHED";

const statusOrder: Record<LobbyStatus, number> = {
  WAITING: 1,
  ONGOING: 2,
  FINISHED: 3,
};

export default function InstructorPage() {
  const router = useRouter();
  const { showNotif } = useNotification();

  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [lobbyName, setLobbyName] = useState<string>("");
  const [lobbyDuration, setLobbyDuration] = useState<number>(0);
  const [isJoining, setIsJoining] = useState<string[]>([]);

  const instructorId = Cookies.get("user.id") ?? "";

  useEffect(() => {
    const s = getSocket();

    s.emit("get-lobbies");

    s.on("lobby-updated", (updatedLobbies: LobbyData[]) => {
      setLobbies(updatedLobbies.filter((l) => l.instructorId === instructorId));
    });

    s.on("quiz-started", (startedLobby: LobbyData) => {
      console.log("Quiz started event received for", startedLobby.id);
      if (startedLobby.instructorId === instructorId) {
        setLobbies((prev) =>
          prev.map((l) =>
            l.id === startedLobby.id ? { ...l, status: "ONGOING" } : l
          )
        );
      }
    });

    s.on("quiz-ended", ({ lobbyId }) => {
      console.log("Quiz ended event received for", lobbyId);
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.id === lobbyId ? { ...lobby, status: "FINISHED" } : lobby
        )
      );
    });

    s.on("lobby-deleted", ({ lobbyId }) => {
      setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));
    });

    s.on("lobby-created", (createdLobby: LobbyData) => {
      if (createdLobby.instructorId === instructorId) {
        setLobbies((prev) => [...prev, createdLobby]);
      }
    });

    const joinSuccessHandler = ({ lobbyId }: { lobbyId: string }) => {
      setIsJoining((prev) => prev.filter((id) => id !== lobbyId));
      localStorage.setItem("joinedLobby", lobbyId);
      router.push(`/lobby/instructor/${lobbyId}`);
    };

    s.on("join-success", joinSuccessHandler);

    return () => {
      s.off("lobby-updated");
      s.off("quiz-started");
      s.off("quiz-ended");
      s.off("lobby-deleted");
      s.off("lobby-created");
      s.off("join-success");
    };
  }, [instructorId, router]);

  const createLobby = () => {
    const s = getSocket();
    if (!s || !lobbyName.trim()) return;

    setIsCreating(true);

    s.emit(
      "create-lobby",
      {
        name: lobbyName,
        instructorId,
        duration: lobbyDuration,
      },
      (response: { success: boolean; lobby?: LobbyData; message?: string }) => {
        setIsCreating(false);

        if (response.success && response.lobby) {
          const createdLobby = response.lobby;

          s.emit("join-lobby", {
            lobbyId: createdLobby.id,
            userId: instructorId,
            username: "rafi",
          });

          localStorage.setItem("joinedLobby", createdLobby.id);

          showNotif({
            title: "Let's go!",
            description: `Lobby "${createdLobby.name}" created successfully!`,
          });

          setLobbyName("");
          setLobbyDuration(0);

          router.push(`/lobby/instructor/${createdLobby.id}`);
        } else {
          showNotif({
            title: "Error",
            description: response.message || "Failed to create lobby",
          });
        }
      }
    );
  };

  const joinLobby = (lobbyId: string, status: string) => {
    const s = getSocket();

    if (isJoining) {
      router.push(`/lobby/instructor/${lobbyId}`);
    }

    if (status === "FINISHED") {
      alert("This mission has already ended. You cannot join.");
      return;
    }

    if (status === "ONGOING") {
      alert("This mission has already started. You cannot join.");
      return;
    }

    setIsJoining((prev) => [...prev, lobbyId]);

    s.emit("join-lobby", {
      lobbyId,
      userId: instructorId,
      username: Cookies.get("user.username") || "Anonymous",
    });
  };

  const startQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit("start-quiz", { lobbyId });
  };

  const endQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit("end-quiz", { lobbyId });
  };

  const deleteLobby = (lobbyId: string) => {
    const s = getSocket();
    if (s) {
      s.emit("delete-lobby", { lobbyId, instructorId });
    }

    showNotif({
      title: "Deleted!",
      description: "Lobby deleted successfully!",
    });
  };

  const sortedLobbies = [...lobbies].sort((a, b) => {
    const statusDiff =
      statusOrder[a.status as LobbyStatus] -
      statusOrder[b.status as LobbyStatus];

    if (statusDiff !== 0) return statusDiff;

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bDate - aDate;
  });

  return (
    <LobbyHeader withBack>
      <CreateLobbyForm
        lobbyName={lobbyName}
        setLobbyName={setLobbyName}
        lobbyDuration={lobbyDuration}
        setLobbyDuration={setLobbyDuration}
        isCreating={isCreating}
        createLobby={createLobby}
      />

      <InstructorLobbyList
        sortedLobbies={sortedLobbies}
        joinLobby={joinLobby}
        startQuiz={startQuiz}
        endQuiz={endQuiz}
        deleteLobby={deleteLobby}
      />
    </LobbyHeader>
  );
}
