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
import { IoSearchSharp } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { IoSettingsSharp } from "react-icons/io5";

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

  return (
    <div className="flex h-full">
      {/* sidebar */}
      <div className="shadow-inner h-full flex flex-col items-center sidebar-hide pt-1">
        <div
          className={`${
            activeTab == "users" ? "menu-active border-base-content" : ""
          } border- w-full py-4 px-5 flex items-center justify-center`}
        >
          <IoPersonAddSharp
            className={`w-[20px] h-[20px] hover:cursor-pointer text-base-content`}
            onClick={() => handleTabClick("users")}
          />
        </div>
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
        <div className="drawer mt-auto p-5">
          <input id="sidebar-menu" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label htmlFor="sidebar-menu" className="drawer-button">
              <img
                src={userData.avatarUrl}
                width={30}
                height={30}
                alt="Picture of the author"
                className="rounded-full"
                tabIndex={0}
                role="button"
              />
            </label>
          </div>
          <div className="drawer-side z-[500]">
            <label
              htmlFor="sidebar-menu"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
              <li>
                <a>
                  <div className="dropdown dropdown-bottom">
                    <div tabIndex={0} role="button" className="">
                      Theme
                      <svg
                        width="12px"
                        height="12px"
                        className="ml-2 h-2 w-2 fill-current opacity-60 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 2048 2048"
                      >
                        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                      </svg>
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52"
                    >
                      <li>
                        <input
                          type="radio"
                          name="theme-dropdown"
                          className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                          aria-label="Default"
                          value="default"
                        />
                      </li>
                      <li>
                        <input
                          type="radio"
                          name="theme-dropdown"
                          className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                          aria-label="Retro"
                          value="retro"
                        />
                      </li>
                      <li>
                        <input
                          type="radio"
                          name="theme-dropdown"
                          className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                          aria-label="Cyberpunk"
                          value="cyberpunk"
                        />
                      </li>
                      <li>
                        <input
                          type="radio"
                          name="theme-dropdown"
                          className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                          aria-label="Valentine"
                          value="valentine"
                        />
                      </li>
                      <li>
                        <input
                          type="radio"
                          name="theme-dropdown"
                          className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                          aria-label="Aqua"
                          value="aqua"
                        />
                      </li>
                    </ul>
                  </div>
                </a>
              </li>
              <li>
                <a onClick={logoutClick}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* <dialog id="theme-modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click outside to close</p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>        
      </dialog> */}

      {/* main */}
      <div className="shadow-inner h-screen flex flex-col w-[300px] min-w-[200px] users-mobile">
        {/* navbar */}
        {/* <div className="h-[60px] flex items-center pl-[15px]">
          <div className="text-xl font-bold text-base-content">
            {activeTab == "chatrooms"
              ? "Chatrooms"
              : activeTab == "users"
              ? "Add friend"
              : activeTab == "settings"
              ? "Settings"
              : ""}
          </div>
        </div> */}

        <div className="navbar bg-base-10">
          <a className="btn btn-ghost text-xl">
            {activeTab == "chatrooms"
              ? "Chatrooms"
              : activeTab == "users"
              ? "Add friend"
              : activeTab == "settings"
              ? "Settings"
              : ""}
          </a>
        </div>

        {/* body */}
        <div className="pt-2 overflow-y-auto">
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
            <div className="px-2 flex flex-col items-center">
              {/* <div className="dropdown mb-72">
                <div tabIndex={0} role="button" className="btn btn-wide m-1" >
                  Theme
                  <svg
                    width="12px"
                    height="12px"
                    className="h-2 w-2 fill-current opacity-60 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2048 2048"
                  >
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52"
                >
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="text-base-content theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Default"
                      value="default"
                    />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="text-base-content theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Retro"
                      value="retro"
                    />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="text-base-content theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Cyberpunk"
                      value="cyberpunk"
                    />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="text-base-content theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Valentine"
                      value="valentine"
                    />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="text-base-content theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Aqua"
                      value="aqua"
                    />
                  </li>
                </ul>
              </div> */}

              <details className="collapse bg-base-200 ">
                <summary className="collapse-title font-medium text-base-content">
                  <div className="flex justify-between items-center">
                    <span>Themes</span>
                    <svg
                      width="12px"
                      height="12px"
                      className="h-3 w-3 fill-current opacity-60 inline-block"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 2048 2048"
                    >
                      <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                    </svg>
                  </div>
                </summary>
                <div className="collapse-content">
                  <div className="join join-vertical">
                    <input
                      type="radio"
                      name="theme-buttons"
                      className="btn btn-wide theme-controller join-item w-full"
                      aria-label="Default"
                      value="default"
                    />
                    <input
                      type="radio"
                      name="theme-buttons"
                      className="btn btn-wide theme-controller join-item"
                      aria-label="Retro"
                      value="retro"
                    />
                    <input
                      type="radio"
                      name="theme-buttons"
                      className="btn btn-wide theme-controller join-item"
                      aria-label="Cyberpunk"
                      value="cyberpunk"
                    />
                    <input
                      type="radio"
                      name="theme-buttons"
                      className="btn btn-wide theme-controller join-item"
                      aria-label="Valentine"
                      value="valentine"
                    />
                    <input
                      type="radio"
                      name="theme-buttons"
                      className="btn btn-wide theme-controller join-item"
                      aria-label="Aqua"
                      value="aqua"
                    />
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* users section */}
          {activeTab === "users" && (
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
        </div>

        {/* bottom menu */}
        <div className="mt-auto hidden users-mobile">
          <div className="btm-nav">
            <button
              className={`${
                activeTab == "users" ? "active text-base-content" : ""
              }`}
            >
              <IoPersonAddSharp
                className="w-[20px] h-[20px] text-base-content"
                onClick={() => handleTabClick("users")}
              />
            </button>

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

            <div className="drawer">
              <input
                id="bottom-menu"
                type="checkbox"
                className="drawer-toggle"
              />
              <div className="drawer-content">
                <label htmlFor="bottom-menu" className="drawer-button">
                  <img
                    src={userData.avatarUrl}
                    width={26}
                    height={26}
                    alt="Picture of the author"
                    className="rounded-full"
                    tabIndex={0}
                    role="button"
                  />
                </label>
              </div>
              <div className="drawer-side z-[500]">
                <label
                  htmlFor="bottom-menu"
                  aria-label="close sidebar"
                  className="drawer-overlay"
                ></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                  <li>
                    <a>Sidebar Item 1</a>
                  </li>
                  <li>
                    <a onClick={logoutClick}>Logout</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
