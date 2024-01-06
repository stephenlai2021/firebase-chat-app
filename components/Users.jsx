"use client";

/* react */
import { useEffect, useState } from "react";

/* firebase */
import { firestore, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  doc,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

/* next */
import { useRouter } from "next/navigation";

/* components */
import UsersCard from "./UsersCard";

/* 3rd-party libraries */
import { toast } from "react-hot-toast";
import { AiOutlineLogout } from "react-icons/ai";

function Users({ userData, setSelectedChatroom }) {
  // console.log('userData: ', userData)
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);

  const router = useRouter();

  const handleTabClick = (tab) => setActiveTab(tab);

  /* 讀取用戶s */
  useEffect(() => {
    const usersRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      /* 方法一 */
      // const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // console.log("users: ", users);
      // setUsers(users);

      /* 方法二 官方推薦 */
      const users = [];
      snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
      setUsers(users);
      console.log("users: ", users);
    });
    return () => unsubscribe();
  }, []);

  // 讀取聊天室s
  useEffect(() => {
    if (!userData?.id) return;
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.id)
    );
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      /* 方法一 */
      // const chatrooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // setUserChatrooms(chatrooms);
      // console.log("chatrooms: ", chatrooms);

      /* 方法二 官方推薦 */
      const chatrooms = [];
      snapshot.forEach((doc) => {
        chatrooms.push({ id: doc.id, ...doc.data() });
      });
      setUserChatrooms(chatrooms);
      console.log("chatrooms: ", chatrooms);

    });

    // Cleanup function for chatrooms
    return () => unsubscribeChatrooms();
  }, [userData]);

  const setUserStatusOffline = async () => {
    const loginUserRef = doc(firestore, "users", userData.id)
    await updateDoc(loginUserRef, { status: 'offline' })
    console.log('You are offline')
  }

  /* 建立聊天室 */
  const createChat = async (user) => {
    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(
      collection(firestore, "chatrooms"),
      // where("users", "==", [userData.id, user.id])
      where("users", "in", [[userData.id, user.id], [user.id, userData.id]])
    );

    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

      if (existingChatroomsSnapshot.docs.length > 0) {
        // Chatroom already exists, handle it accordingly (e.g., show a message)
        console.log("Chatroom already exists for these users.");
        toast.error("Chatroom already exists for these users.");
        return;
      }

      // Chatroom doesn't exist, proceed to create a new one
      const usersData = {
        [userData.id]: userData, // login user data
        [user.id]: user, // selected user data
      };

      const chatroomData = {
        users: [userData.id, user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      const chatroomRef = await addDoc(
        collection(firestore, "chatrooms"),
        chatroomData
      );

      // const chatroomRef = await setDoc(
      //   doc(firestore, "chatrooms", `${userData.id}+${user.id}`),
      //   // doc(firestore, "chatrooms", `${userData.name}+${user.name}`),
      //   chatroomData
      // );

      // chatroomRef.id = doc id
      console.log("Chatroom created with ID:", chatroomRef.id); 
      setActiveTab("chatrooms");
    } catch (error) {
      console.error("Error creating or checking chatroom:", error);
    }
  };

  const openChat = async (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
    };
    setSelectedChatroom(data);
    console.log("openChat: ", data);
  };

  const logoutClick = () => {
    signOut(auth)
    .then(() => {
        setUserStatusOffline()
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    // <div className="flex flex-col relative">
    <>
      {/* <div className="fixed top-0 bg-black z-20 w-[300px]"> */}
        <div className="flex flex-col h-[72px] lg:flex-row justify-evenly p-4 space-y-4 lg:space-y-0">
          <button
            className={`btn-outline rounded lg:w-1/2 sm:w-full ${
              activeTab === "users" ? "btn-primary" : ""
            }`}
            onClick={() => handleTabClick("users")}
          >
            Users
          </button>
          <button
            className={`btn-outline rounded lg:ml-2 ml-0 lg:w-1/2 sm:w-full ${
              activeTab === "chatrooms" ? "btn-primary" : ""
            }`}
            onClick={() => handleTabClick("chatrooms")}
          >
            Chatrooms
          </button>
        </div>
      {/* </div> */}

      {/* <div className="w-[300px] pt-[110px] lg:pt-[70px] shadow-lg h-full pb-[60px] overflow-auto flex flex-col"> */}
      <div className="">
        {activeTab === "chatrooms" && (
          <>
            {userChatrooms.map((chatroom) => (
              <div
                key={chatroom.id}
                onClick={() => {
                  openChat(chatroom);
                }}
              >
                <UsersCard
                  name={
                    chatroom.usersData[
                      chatroom.users.find((id) => id !== userData?.id)
                    ].name
                  }
                  avatarUrl={
                    chatroom.usersData[
                      chatroom.users.find((id) => id !== userData?.id)
                    ].avatarUrl
                  }
                  latestMessage={chatroom.lastMessage}
                  type={"chat"}
                />
              </div>
            ))}
          </>
        )}

        {activeTab === "users" && (
          <>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  createChat(user);
                }}
              >
                {user.id !== userData?.id && (
                  <UsersCard
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    latestMessage={""}
                    type={"user"}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* bottom */}
      {/* <div className="border border-2 flex p-4 fixed bottom-0 bg-black w-[300px] z-2"> */}
      {/* <div className="border border-2 flex p-4 fixed bottom-0 bg-black z-2"> */}
      {/* <div className="border border-2 flex p-4"> */}
      <div className="bottom-rwd flex p-4 fixed bg-black bottom-0 max-w-[300px] min-w-[171px] lg:w-full md:w-[290px] sm:w-[250px] ">
      {/* <div className="flex p-4 fixed bg-black bottom-0 min-w-[171px] w-full"> */}
        <div className="flex items-center">
          <img
            src={userData.avatarUrl}
            width={30}
            height={30}
            alt="Picture of the author"
            className="rounded-full"
          />
        </div>
        <span className="flex items-end ml-1">{userData.name}</span>
        <div
          // className="btn-logout-rwd ml-[200px] flex items-center hover:cursor-pointer"
          className="btn-logout-rwd flex ml-auto items-center hover:cursor-pointer"
          onClick={logoutClick}
        >
          <AiOutlineLogout />
        </div>
      </div>
    {/* </div> */}
    </>
  );
}

export default Users;
