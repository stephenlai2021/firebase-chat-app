"use client";

/* react */
import { useEffect, useState, useContext } from "react";

/* next */
import { useRouter } from "next/navigation";

/* firebase */
import { firestore, auth } from "@/firebase/client-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/* components */
import Main from "@/components/main/Main";
import ChatRoom from "@/components/chatroom/ChatRoom";
import LoadingSkeleton from "@/components/skeleton/LoadingSkeleton";

/* context */
import { Context } from "@/context/authContext";

import { useUserData } from "@/hooks/useFirebase";

function DashboardPage() {
  // const [userData, setUserData] = useState(null);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  const router = useRouter();

  const { userData } = useUserData();
  console.log("user data: ", userData);
  
  // const { user } = useUser();
  // console.log("user: ", user);

  // const getUserData = async () => {
  //   const docRef = doc(firestore, "users", user.email);
  //   const docSnap = await getDoc(docRef);
  //   if (docSnap.exists()) {
  //     const data = docSnap.data();
  //     setUserData(data);
  //   } else {
  //     console.log("No such document!");
  //   }
  // };

  // useEffect(() => {
  //   if (user) getUserData();
  // }, [user]);

  // useEffect(() => {
  //   console.log("user data: ", userData);
  // }, [userData]);

  /* get login user */
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       console.log('user credential: ', user)
  //       const docRef = doc(firestore, "users", user.email);
  //       const docSnap = await getDoc(docRef);
  //       if (docSnap.exists()) {
  //         const data = docSnap.data();
  //         setUser(data);
  //       } else {
  //         console.log("No such document!");
  //       }
  //     } else {
  //       setUser(null);
  //       router.push("/login");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [auth, router]);

  if (userData == null) return <LoadingSkeleton />;
  // if (loading) return <LoadingSkeleton />;

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
