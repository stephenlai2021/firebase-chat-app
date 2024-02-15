"use client";

/* react */
import { useState } from "react";

/* components */
import Main from "@/components/main/Main";
import ChatRoom from "@/components/chatroom/ChatRoom";
import LoadingSkeleton from "@/components/skeleton/LoadingSkeleton";

/* firebase */
import { useUserData } from "@/hooks/useFirebase";

function DashboardPage() {
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const { userData } = useUserData();

  if (userData == null) return <LoadingSkeleton />;

  return (
    <div className="flex h-screen">
      <div
        className={`relative ${
          selectedChatroom == null ? "users-mobile" : "users-hide"
        }`}
      >
        <Main userData={userData} setSelectedChatroom={setSelectedChatroom} />
      </div>

      {selectedChatroom && (
        <div
          className={`w-9/12 ${
            selectedChatroom ? "chatroom-mobile" : "chatroom-hide"
          }`}
        >
          <ChatRoom
            selectedChatroom={selectedChatroom}
            setSelectedChatroom={setSelectedChatroom}
          />
        </div>
      )}

      {selectedChatroom == null && (
        <div
          className={`${
            selectedChatroom == null ? "chatroom-hide" : "chatroom-mobile"
          } shadow-inner w-9/12 flex items-center justify-center h-full chatroom-none`}
        >
          <div className="text-2xl text-gray-400">Select a chatroom</div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
