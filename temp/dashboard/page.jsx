"use client";

/* react */
import { useEffect, useState } from "react";

/* next */
import { useRouter } from "next/navigation";

/* firebase */
import { firestore, auth } from "@/firebase/client-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/* zustand */
import { useLoginUserStore } from '@/stores/zustand/userStore'

/* components */
import Users from "@/components/main/Main";
import ChatRoom from "../../components/chatroom/ChatRoom";
import LoadingSkeleton from "@/components/skeleton/LoadingSkeleton";

function HomePage() {
  const [user, setUser] = useState(null);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  const router = useRouter();

  const { setLoginUser, setUserCredential } = useLoginUserStore()

  /* get login user */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('user credential: ', user)
        setUserCredential(user)
        const docRef = doc(firestore, "users", user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser(data);
          setLoginUser(data)
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        router.push("/login/firebase");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (user == null) return <LoadingSkeleton />;

  return (
    <div className="flex h-screen">
      <div
        className={`relative ${
          selectedChatroom == null ? "users-mobile" : "users-hide"
        }`}
      >
        <Users userData={user} setSelectedChatroom={setSelectedChatroom} />
      </div>

      {selectedChatroom && (
        <div className={`w-9/12 ${selectedChatroom ? 'chatroom-mobile' : 'chatroom-hide'}`}>
          <ChatRoom selectedChatroom={selectedChatroom} setSelectedChatroom={setSelectedChatroom} />
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

export default HomePage;
