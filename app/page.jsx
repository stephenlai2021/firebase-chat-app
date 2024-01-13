"use client";

/* react */
import { useEffect, useState } from "react";

/* next */
import { useRouter } from "next/navigation";

/* firebase */
import { firestore, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/* zustand */
import useStore from "@/stores/loginUser";

/* components */
import Users from "../components/Users";
import ChatRoom from "../components/ChatRoom";
import LoadingSkeleton from "@/components/skeleton/LoadingSkeleton";

function page() {
  const [user, setUser] = useState(null);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  const router = useRouter();

  /* zustand */
  const { loginUser } = useStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // const data = { id: docSnap.id, ...docSnap.data() };
          const data = docSnap.data();
          setUser(data);
          console.log('get login user: ', data)
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  if (user == null) return <LoadingSkeleton />;

  return (
    <div className="flex h-screen oveflow-hidden">
      <div className="bg-gray-900 w-[300px]">
        <Users userData={user} setSelectedChatroom={setSelectedChatroom} />
      </div>

      <div className="flex-grow w-9/12">
      {/* <div className="flex-grow w-full"> */}
      {/* <div className=""> */}
        {selectedChatroom ? (
          // <ChatRoom user={user} selectedChatroom={selectedChatroom} />
          <ChatRoom selectedChatroom={selectedChatroom} />
        ) : (
          // selectedChatroom === null
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl text-gray-400">Select a chatroom</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default page;
