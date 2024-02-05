"use client";

/* react */
import { useState } from "react";

/* firebase */
import { firestore } from "@/firebase/client-config";
import { doc, getDoc } from "firebase/firestore";

/* components */
import Users from "./hooks/Main_new";
import ChatRoom from "./components/chatroom/ChatRoom";
import LoadingSkeleton from "@/components/skeleton/LoadingSkeleton";

function Main({ userCredential }) {
  const [user, setUser] = useState(null);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  const getUserData = async () => {
    const docRef = doc(firestore, "users", userCredential.email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUser(userData);
      console.log('user data: ', userData)
    } else {
      // console.log("No such document!");
      console.log("Cannot find user!");
    }
  };

  useEffect(() => {
    getUserData()
  }, [userCredential, userData]);

  if (user == null) return <LoadingSkeleton />;

  return (
    <div className="flex h-screen oveflow-hidden">
      <div
        className={`relative ${
          selectedChatroom == null ? "users-mobile" : "users-hide"
        }`}
      >
        <Users userData={user} setSelectedChatroom={setSelectedChatroom} />
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
          } w-9/12 flex items-center justify-center h-full chatroom-none`}
        >
          <div className="text-2xl text-gray-400">Select a chatroom</div>
        </div>
      )}
    </div>
  );
}

export default Main;
