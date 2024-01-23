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
import { FaCircleUser } from "react-icons/fa6";
import { IoMdChatboxes } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";

function Users({ userData, setSelectedChatroom }) {
  // console.log("userData: ", userData);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const [user, setUser] = useState("");
  const [menu, setMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userByEmail, setUserByEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();

  const handleTabClick = (tab) => setActiveTab(tab);

  /* 依姓名搜尋用戶 */
  const searchUserByName = async () => {
    if (!userName) return;

    const q = query(
      collection(firestore, "users"),
      where("name", "==", userName)
    );

    const users = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      users.push(doc.data());
      setUserName("");
    });
    console.log("users: ", users);
  };

  /* 依電郵信箱搜尋用戶 */
  const searchUserByEmail = async () => {
    if (!userEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError("Invalid Email");
      return
    }

    const docRef = doc(firestore, "users", userEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserByEmail(docSnap.data());
    } else {
      console.log("The email does not exist!");
      toast('The email does not exist!', {
        icon: '⚠️'
      });
    }
  };

  /* 處理 Email 表格 */
  const handleEmail = (val) => {
    setUserEmail(val);
    setUserByEmail("");
    setEmailError("");
  };

  /* 用戶按 Enter 鍵執行 searchUserByEmail 函式 */
  const handleUserEmailSubmit = (event) => {
    if (event.key === "Enter") searchUserByEmail();
  };

  /* 切換到 chatrooms tab 時清除 Email 表格內容及找到的用戶資料 */
  useEffect(() => {
    if (activeTab == "chatrooms") {
      setUserEmail("");
      setUserByEmail("");
    }
  }, [activeTab]);

  /* 讀取用戶s */
  useEffect(() => {
    const usersRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = [];
      // snapshot.forEach((doc) => users.push({id: doc.id, ...doc.data()}));
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
      where("users", "array-contains", userData.id)
    );
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
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

  /* 把登出用戶狀態設置為下線 */
  const setUserStatusOffline = async () => {
    const loginUserRef = doc(firestore, "users", userData.email);

    // update login user status in users collection
    await updateDoc(loginUserRef, { status: "offline" });

    // update login user status in chatrooms collection
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.id)
    );
    const querySnapshot = await getDocs(chatroomsQuery);
    querySnapshot.forEach(async (document) => {
      console.log(document.id, " => ", document.data());

      await updateDoc(doc(firestore, "chatrooms", document.id), {
        [`usersData.${userData.id}.status`]: "offline",
      });
    });
  };

  /* 建立聊天室 */
  const createChat = async (user) => {
    setUser(user);
    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "in", [
        [userData.id, user.id],
        [user.id, userData.id],
      ])
    );

    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

      if (existingChatroomsSnapshot.docs.length > 0) {
        console.log("Chatroom already exists for this user.");
        toast.error("Chatroom already exists for this user.");
        return;
      }

      // Chatroom doesn't exist, proceed to create a new one
      // userData: login user data
      // user: user data

      /* 
        usersData = {
          asdfadfadf: {},
          234erterts: {}
        }
      */
      const usersData = {
        [userData.id]: userData,
        [user.id]: user,
      };
      // const usersData = [userData, user];

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
      // console.log("Chatroom created with ID:", chatroomRef.id);
      setActiveTab("chatrooms");
      setUserByEmail("");
    } catch (error) {
      console.error("Error creating or checking chatroom:", error);
    }
  };

  /* 開啟聊天室 */
  const openChat = async (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        // chatroom.usersData[chatroom.usersData.find((id) => id !== userData.id)],
        chatroom.usersData.find((user) => user.email !== userData.email),
    };
    setSelectedChatroom(data);
    console.log("openChat: ", data);
  };

  /* 登出用戶並將用戶狀態設置為"offline" */
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
      {/* top menu */}
      <div className="p-2">
        <ul className="menu menu-horizontal bg-base-200 rounded-box w-full">
          <li
            className="w-1/2 flex justify-center items-center"
            onClick={() => handleTabClick("users")}
          >
            <a className="tooltip tooltip-bottom" data-tip="Search">
              <IoSearchSharp
                className={`w-[22px] h-[22px] hover:cursor-pointer ${
                  activeTab === "users" ? "text-white" : "text-gray-700"
                }`}
              />
            </a>
          </li>
          <li
            className="w-1/2 flex justify-center items-center"
            onClick={() => handleTabClick("chatrooms")}
          >
            <a className="tooltip tooltip-bottom" data-tip="Chatrooms">
              <IoMdChatboxes
                className={`w-[24px] h-[24px] hover:cursor-pointer ${
                  activeTab === "chatrooms" ? "text-white" : "text-gray-700"
                }`}
              />
            </a>
          </li>
        </ul>
      </div>

      {/* body */}
      <div className="p-2">
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
                  email={
                    chatroom.usersData[
                      chatroom.users.find((id) => id !== userData?.id)
                    ].email
                  }
                  status={
                    chatroom.usersData[
                      chatroom.users.find((id) => id !== userData?.id)
                    ].status
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
            {/* Search user by name */}
            <div className="mt-2">
              <span className="label-text pl-1">Search by name</span>
              <div className="relative">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter name"
                  className="input input-bordered input-sm w-full max-w-xs pr-[30px]"
                />
                <div className="absolute right-0 top-[50%] translate-y-[-50%] p-2">
                  <IoIosSend
                    className="w-[18px] h-[18px] hover:cursor-pointer"
                    onClick={searchUserByName}
                  />
                </div>
              </div>
            </div>

            {/* Search user by email */}
            <div className="mt-6">
              <span className="label-text pl-1">Search by email</span>
              <div className="relative">
                <input
                  type="text"
                  value={userEmail}
                  onChange={(e) => handleEmail(e.target.value)}
                  onKeyDown={handleUserEmailSubmit}
                  placeholder="Enter email"
                  className="input input-bordered input-sm w-full max-w-xs pr-[30px]"
                />
                <div className="absolute right-0 top-[50%] translate-y-[-50%] p-2">
                  <IoIosSend
                    className="w-[18px] h-[18px] hover:cursor-pointer"
                    onClick={searchUserByEmail}
                  />
                </div>
              </div>
              {emailError && (
                <span className="label-text text-red-500 p-1">
                  {emailError}
                </span>
              )}
            </div>

            {/* user found by email  */}
            {activeTab === "users" && userByEmail && (
              <div className="relative mt-8 flex flex-col">                
                <UsersCard
                  name={userByEmail.name}
                  avatarUrl={userByEmail.avatarUrl}
                  email={userByEmail.email}
                  status={userByEmail.status}
                  lastMessage={userByEmail.name}
                  type={"user"}
                  found={"true"}
                  bgColor="bg-gray-800"
                />
                <button
                  className="btn btn-circle btn-sm btn-neutral absolute right-0 top-0"
                  onClick={() => createChat(userByEmail)}
                >
                  <IoPersonAddSharp
                    className="w-[20px] h-[20px] text-white"
                  />
                </button>
              </div>              
            )}
          </>
        )}
      </div>

      {/* bottom menu */}
      <div className="users-bottom h-[72px] w-[300px] flex p-4 fixed bg-black bottom-0">
        <div
          className="relative flex items-center hover:cursor-pointer"
          onClick={() => setMenu(!menu)}
        >
          <img
            src={userData.avatarUrl}
            width={25}
            height={25}
            alt="Picture of the author"
            className="rounded-full"
          />
          {/* menu */}
          {menu ? (
            <ul className="absolute top-[-80px] left-[24px] menu bg-base-200 max-w-56 rounded-box">
              <li>
                <a>{userData.email}</a>
              </li>
              <li>
                <a onClick={logoutClick}>logout</a>
              </li>
            </ul>
          ) : (
            ""
          )}
        </div>
        <span className="flex items-end ml-1 text-[12px]">Me</span>
      </div>
    </>
  );
}

export default Users;
