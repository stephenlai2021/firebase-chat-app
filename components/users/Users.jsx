"use client";

/* react */
import { useEffect, useState } from "react";

/* firebase */
import { firestore, auth } from "@/firebase/client-config";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
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
import { IoMdChatboxes } from "react-icons/io";
import { IoIosSend } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";

import { themes } from "@/actions/client/utils";

function Users({ userData, setSelectedChatroom }) {
  const [activeTab, setActiveTab] = useState("chatrooms");
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const [user, setUser] = useState("");
  const [menu, setMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [userByName, setUserByName] = useState("");
  const [usersByName, setUsersByName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userByEmail, setUserByEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();

  const handleTabClick = (tab) => setActiveTab(tab);

  /* 依姓名搜尋用戶 */
  const searchUserByName = async () => {
    if (!userName) return;

    console.log("user name: ", userName);
    const q = query(
      collection(firestore, "users"),
      where("name", "==", userName)
    );

    const users = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      users.push(doc.data());
    });

    setUsersByName(users);
    setUserByEmail("");
  };

  /* 依電郵信箱搜尋用戶 */
  const searchUserByEmail = async () => {
    if (!userEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError("Invalid Email");
      return;
    }

    // 在 users 收集搜尋符合 email 的用戶
    const docRef = doc(firestore, "users", userEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserByEmail(docSnap.data());
    } else {
      console.log("The email does not exist!");
      toast("The email does not exist!", {
        icon: "⚠️",
      });
    }

    if (userEmail == userData.email) {
      console.log("This is you!");
      toast("This is you!", {
        icon: "😀",
      });
    }

    setUsersByName("");
  };

  /* 處理 Name 表格 */
  const handleName = (val) => {
    setUserByEmail("");
    setEmailError("");
    setUserName(val);
    setUsersByName("");
  };

  /* 處理 Email 表格 */
  const handleEmail = (val) => {
    setUsersByName("");
    setUserEmail(val);
    setUserByEmail("");
    setEmailError("");
  };

  /* 用戶按 Enter 鍵執行 searchUserByEmail 函式 */
  const handleUserEmailSubmit = (event) => {
    if (event.key === "Enter") searchUserByEmail();
  };

  /* 用戶按 Enter 鍵執行 searchUserByName 函式 */
  const handleUserNameSubmit = (event) => {
    if (event.key === "Enter") searchUserByName();
  };

  /* 切換到 chatrooms tab 時清除 Email 表格內容及找到的用戶資料 */
  useEffect(() => {
    if (activeTab == "chatrooms") {
      setUserName("");
      setUsersByName("");
      setUserEmail("");
      setUserByEmail("");
    }
  }, [activeTab]);

  /* 讀取用戶s */
  useEffect(() => {
    const usersRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = [];
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

  /* 把登陸用戶狀態設置為 "offline" */
  const setUserStatusOffline = async () => {
    /* 把 users 收集的登陸用戶狀態設置為 "offline" */
    const loginUserRef = doc(firestore, "users", userData.email);
    await updateDoc(loginUserRef, { status: "offline" });

    /* 把 chatrooms 收集的登陸用戶狀態設置為 "offline" */
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.id)
    );
    const querySnapshot = await getDocs(chatroomsQuery);
    querySnapshot.forEach(async (document) => {
      await updateDoc(doc(firestore, "chatrooms", document.id), {
        [`usersData.${userData.id}.status`]: "offline",
      });
    });
  };

  /* 建立聊天室 */
  const createChat = async (user) => {
    setUser(user);

    // 檢查聊天室是否存在
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
        console.log(`chatroom for ${user.name} is already existed`);
        toast(`chatroom for ${user.name} is already existed`, { icon: "😎" });
        return;
      }

      const usersData = {
        [userData.id]: userData,
        [user.id]: user,
      };

      const chatroomData = {
        users: [userData.id, user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
        lastMessageSentTime: null,
      };

      await addDoc(collection(firestore, "chatrooms"), chatroomData);
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
        chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
    };
    setSelectedChatroom(data);
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
  //   // {
  //   //   label: "Default",
  //   //   value: "default",
  //   // },
  //   {
  //     label: "Light",
  //     value: "light",
  //   },
  //   {
  //     label: "Dark",
  //     value: "dark",
  //   },
  //   {
  //     label: "Retro",
  //     value: "retro",
  //   },
  //   {
  //     label: "Cyberpunk",
  //     value: "cyberpunk",
  //   },
  //   {
  //     label: "Valentine",
  //     value: "valentine",
  //   },
  //   {
  //     label: "Halloween",
  //     value: "halloween",
  //   },
  //   {
  //     label: "Aqua",
  //     value: "aqua",
  //   },
  //   {
  //     label: "Synthwave",
  //     value: "synthwave",
  //   },
  //   {
  //     label: "Luxury",
  //     value: "luxury",
  //   },
  //   {
  //     label: "Dracula",
  //     value: "dracula",
  //   },
  //   {
  //     label: "Coffee",
  //     value: "coffee",
  //   },
  //   {
  //     label: "Autumn",
  //     value: "autumn",
  //   }
  // ];

  return (
    <div className="flex h-full">
      {/* sidebar */}
      <div className="shadow-inner h-full flex flex-col items-center sidebar-hide pt-1">
        {/* add friend icon */}
        <div
          className={`${
            activeTab == "add" ? "menu-active border-base-content" : ""
          } border- w-full py-4 px-5 flex items-center justify-center`}
        >
          <IoPersonAddSharp
            className={`w-[20px] h-[20px] hover:cursor-pointer text-base-content`}
            onClick={() => handleTabClick("add")}
          />
        </div>

        {/* chatroom icon */}
        <div
          className={`${
            activeTab == "chatrooms" ? "menu-active border-base-content" : ""
          } border- w-full py-4 px-5 flex items-center justify-center`}
        >
          <IoMdChatboxes
            className={`w-[22px] h-[22px] hover:cursor-pointer text-base-content`}
            onClick={() => handleTabClick("chatrooms")}
          />
        </div>

        {/* settings icon */}
        <div
          className={`${
            activeTab == "settings" ? "menu-active border-base-content" : ""
          } border- w-full py-4 px-5 flex items-center justify-center`}
        >
          <IoSettingsSharp
            className={`w-[22px] h-[22px] hover:cursor-pointer text-base-content`}
            onClick={() => handleTabClick("settings")}
          />
        </div>

        {/* user icon */}
        <div
          className={`${
            activeTab == "user" ? "menu-active border-base-content" : ""
          } mt-auto p-5 w-full py-4 px-5 flex items-center justify-center`}
          onClick={() => handleTabClick("user")}
        >
          <img
            src={userData.avatarUrl}
            width={30}
            height={30}
            alt="Picture of the author"
            className="rounded-full"
            tabIndex={0}
            role="button"
          />
        </div>
      </div>

      {/* main */}
      <div className="shadow-inner h-screen flex flex-col w-[300px] min-w-[200px] users-mobile">
        {/* navbar */}
        <div className="h-[60px] flex py-[16px] pl-[15px]">
          <div className="text-xl font-bold text-base-content">
            {activeTab == "chatrooms"
              ? "Chatrooms"
              : activeTab == "add"
              ? "Add friend"
              : activeTab == "settings"
              ? "Settings"
              : activeTab == "user"
              ? userData.name
              : ""}
          </div>
        </div>

        {/* body */}
        <div className="pt-1 overflow-y-auto">
          {/* chatrooms section */}
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
                    key={chatroom.id}
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
                    lastMessage={chatroom.lastMessage}
                    lastMessageSentTime={chatroom.lastMessageSentTime}
                    timeStamp={chatroom.timestamp}
                    loginUser={userData}
                    type={"chat"}
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === "settings" && (
            <div className="settings-section">
              <ul className="menu text-base-content">
                <li>
                  <details open>
                    <summary>Theme</summary>
                    <ul className="menu">
                      {themes.map((theme) => (
                        <li key={theme.label}>
                          <label className="label cursor-pointer w-full">
                            <span className="label-text">{theme.label}</span>
                            <input
                              type="radio"
                              name="theme-radios"
                              className="radio theme-controller"
                              value={theme.value}
                            />
                          </label>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
                <li>
                  <a onClick={logoutClick}>Logout</a>
                </li>
              </ul>
            </div>
          )}

          {/* add friend section */}
          {activeTab === "add" && (
            <>
              {/* Search user by name */}
              <div className="mt-3 px-2 input-padding">
                <span className="label-text pl-1">Search by name</span>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => handleName(e.target.value)}
                    onKeyDown={handleUserNameSubmit}
                    placeholder="Enter name"
                    className="input bg-base-200 input-md w-full max-w-x text-base-content"
                  />
                  <div className="absolute right-1 top-[50%] translate-y-[-50%] p-2">
                    <IoIosSend
                      className="w-[18px] h-[18px] hover:cursor-pointer text-base-content"
                      onClick={searchUserByName}
                    />
                  </div>
                </div>
              </div>

              {/* Search user by email */}
              <div className="mt-6 px-2 input-padding">
                <span className="label-text pl-1">Search by email</span>
                <div className="relative">
                  <input
                    type="text"
                    value={userEmail}
                    onChange={(e) => handleEmail(e.target.value)}
                    onKeyDown={handleUserEmailSubmit}
                    placeholder="Enter email"
                    className="input input-md bg-base-200 w-full max-w-x text-base-content"
                  />
                  <div className="absolute right-1 top-[50%] translate-y-[-50%] p-2">
                    <IoIosSend
                      className="w-[18px] h-[18px] hover:cursor-pointer text-base-content"
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

              {/* users found by name  */}
              {activeTab === "users" && usersByName && (
                <div className="relative mt-8 flex flex-col">
                  {usersByName &&
                    usersByName.map((user) => (
                      <div key={user.id} className="relative mb-2">
                        <UsersCard
                          name={user.name}
                          avatarUrl={user.avatarUrl}
                          email={user.email}
                          status={user.status}
                          lastMessage={user.name}
                          type={"user"}
                          found={"true"}
                          bgColor="bg-gray-800"
                        />
                        {user.email !== userData.email && (
                          <button
                            className="btn btn-circle btn-sm btn-neutral absolute right-0 top-0"
                            onClick={() => createChat(user)}
                          >
                            <IoPersonAddSharp className="w-[20px] h-[20px] text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}

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
                  {userEmail !== userData.email && (
                    <button
                      className="btn btn-circle btn-sm btn-neutral absolute right-0 top-0"
                      onClick={() => createChat(userByEmail)}
                    >
                      <IoPersonAddSharp className="w-[20px] h-[20px] text-white" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* user section */}
          {activeTab === "user" && <>user profile</>}
        </div>

        {/* bottom menu */}
        <div className="mt-auto hidden users-mobile">
          <div className="btm-nav">
            {/* add friend button */}
            <button
              className={`${
                activeTab == "add" ? "active text-base-content" : ""
              }`}
            >
              <IoPersonAddSharp
                className="w-[20px] h-[20px] text-base-content"
                onClick={() => handleTabClick("add")}
              />
            </button>

            {/* chatroom button */}
            <button
              className={`${
                activeTab == "chatrooms" ? "active text-base-content" : ""
              }`}
            >
              <IoMdChatboxes
                className="w-[24px] h-[24px] text-base-content"
                onClick={() => handleTabClick("chatrooms")}
              />
            </button>

            {/* settings button */}
            <button
              className={`${
                activeTab == "settings" ? "active text-base-content" : ""
              }`}
            >
              <IoSettingsSharp
                className="w-[24px] h-[24px] text-base-content"
                onClick={() => handleTabClick("settings")}
              />
            </button>

            {/* user icon */}
            <button
              className={`${
                activeTab == "user" ? "active text-base-content" : ""
              }`}
            >
              <img
                src={userData.avatarUrl}
                width={30}
                height={30}
                alt="Picture of the author"
                className="rounded-full"
                tabIndex={0}
                role="button"
                onClick={() => handleTabClick("user")}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
