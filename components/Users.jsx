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
  getDoc,
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
  // console.log("userData: ", userData);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const [user, setUser] = useState("");

  const router = useRouter();

  const handleTabClick = (tab) => setActiveTab(tab);

  /* 讀取用戶s */
  useEffect(() => {
    const usersRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      /* 方法一 */
      // const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // setUsers(users);

      /* 方法二 官方推薦 */
      const users = [];
      // snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
      snapshot.forEach((doc) => users.push(doc.data()));
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
      // where("users", "array-contains", userData.id)
      where("users", "array-contains", userData.email)
    );
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      /* 方法一 */
      // const chatrooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // setUserChatrooms(chatrooms);

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
    const loginUserRef = doc(firestore, "users", userData.id);

    // update login user status
    await updateDoc(loginUserRef, { status: "offline" });

    // Get documents contains login user
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.email)
      // where("usersData", "array-contains", { email: userData.email })
    );

    const chatroomsIdArray = [];
    const querySnapshot = await getDocs(chatroomsQuery);
    querySnapshot.forEach(async (doc) => {
      console.log(doc.id, ' => ', doc.data())
      chatroomsIdArray.push(doc.id)
      const updatedUsersData = [{ ...userData, status: 'offline' }, user]
      // await updateDoc(doc.id, { usersData: updatedUsersData })
      
    });
    console.log('chatroomsIdArray: ', chatroomsIdArray)

    /* 
    chatroomsIdArray = [
      "Ih7w7ROVl8eLjZiTBTCW",
      "VI2MMJddRReEsAaxnUwy"
    ]
    */
    // chatroomsIdArray.forEach(async chatroomId => {
    //   const docRef = doc(firestore, 'chatrooms', chatroomId)
    //   const matches = await getDoc(docRef);
    //   if (!matches.exists()) return;
      
    //   const docData = matches.data()
    //   const foundUser = docData.usersData.find(user => user.email === userData.email).status
    //   await updateDoc(docRef, { status: 'offline' })
    // })
  };

  /* 建立聊天室 */
  const createChat = async (user) => {
    setUser(user);
    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "in", [
        [userData.email, user.email],
        [user.email, userData.email],
      ])
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
      // userData: login user data
      // user: user data

      // const usersData = {
      //   // [userData.id]: userData,
      //   // [user.id]: user,
      //   [userData.email]: userData,
      //   [user.email]: user,
      // };
      // const usersData = [
      //   userData,
      //   user,
      // ];
      const usersData = [
        userData,
        user,
      ];

      const chatroomData = {
        users: [userData.email, user.email],
        usersData,
        // loginUser: userData,
        // otherUser: user,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      const chatroomRef = await addDoc(
        collection(firestore, "chatrooms"),
        chatroomData
      );
      console.log('Chatroom created with ID:', chatroomRef.id);
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
        // chatroom.usersData[chatroom.usersData.find((id) => id !== userData.id)],
        chatroom.usersData.find(user => user.email !== userData.email)
    };
    setSelectedChatroom(data);
    console.log("openChat: ", data);
  };

  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        setUserStatusOffline();
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <>
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
                  // name={
                  //   chatroom.usersData[
                  //     chatroom.users.find((id) => id !== userData?.id)
                  //   ].name
                  // }
                  // avatarUrl={
                  //   chatroom.usersData[
                  //     chatroom.users.find((id) => id !== userData?.id)
                  //   ].avatarUrl
                  // }
                  // status={
                  //   chatroom.usersData[
                  //     chatroom.users.find((id) => id !== userData?.id)
                  //   ].status
                  // }

                  name={
                    chatroom.usersData.find((data) => data.email !== userData.email).name                    
                  }
                  avatarUrl={
                    chatroom.usersData.find((data) => data.email !== userData.email).avatarUrl
                  }
                  status={
                    chatroom.usersData.find((data) => data.email !== userData.email).status
                  }
                  latestMessage={chatroom.lastMessage}
                  type={"chat"}
                  id={userData.id}

                  // name={chatroom.otherUser.name}                    
                  // avatarUrl={chatroom.otherUser.avatarUrl}
                  // status={chatroom.otherUser.status}
                  // latestMessage={chatroom.lastMessage}
                  // type={"chat"}
                  // id={userData.id}
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
                    id={user.id}
                    status={user.status}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* bottom */}
      <div className="bottom-rwd flex p-4 fixed bg-black bottom-0 max-w-[300px] min-w-[171px] lg:w-full md:w-[290px] sm:w-[250px] ">
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
          className="btn-logout-rwd flex ml-auto items-center hover:cursor-pointer"
          onClick={logoutClick}
        >
          <AiOutlineLogout />
        </div>
      </div>
    </>
  );
}

export default Users;
