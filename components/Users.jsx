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
    if (!emailRegex.test(userEmail)) setEmailError("Invalid Email");

    const docRef = doc(firestore, "users", userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("user: ", docSnap.data());
      setUserByEmail(docSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  /* 處理 Email 表格 */
  const handleEmail = (val) => {
    setUserEmail(val);
    setEmailError("");
  };

  const handleUserEmailSubmit = (event) => {
    if (event.key === "Enter") searchUserByEmail();
  };

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
    const loginUserRef = doc(firestore, "users", userData.id);

    // update login user status
    await updateDoc(loginUserRef, { status: "offline" });

    // Get documents contains login user
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
        // Chatroom already exists, handle it accordingly (e.g., show a message)
        console.log("Chatroom already exists for these users.");
        toast.error("Chatroom already exists for these users.");
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
      console.log("Chatroom created with ID:", chatroomRef.id);
      setActiveTab("chatrooms");
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

  /* 用戶登出 */
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
                  // name={
                  //   chatroom.usersData.find(
                  //     (data) => data.id !== userData.id
                  //   ).name
                  // }
                  // avatarUrl={
                  //   chatroom.usersData.find(
                  //       (data) => data.id !== userData.id
                  //   ).avatarUrl
                  // }
                  // status={
                  //   chatroom.usersData.find(
                  //       (data) => data.id !== userData.id
                  //   ).status
                  // }

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
                    email={user.email}
                    status={user.status}
                    latestMessage={""}
                    type={"user"}
                  />
                )}
              </div>
            ))}

            {/* Search user by name */}
            {/* <div className="mt-2">
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
                    className="w-[20px] h-[20px] hover:cursor-pointer"
                    onClick={searchUserByName}
                  />
                </div>
              </div>
            </div> */}

            {/* Search user by email */}
            {/* <div className="mt-6">
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
                    className="w-[20px] h-[20px] hover:cursor-pointer"
                    onClick={searchUserByEmail}
                  />
                </div>
              </div>
              {emailError && (
                <span className="label-text text-red-500 p-1">
                  {emailError}
                </span>
              )}
            </div> */}

            {/* user found by email  */}
            {/* {activeTab === "users" && userByEmail && (
              // <UsersCard
              //   name={userByEmail.name}
              //   avatarUrl={userByEmail.avatarUrl}
              //   type={"user"}
              //   status={userByEmail.status}
              //   email={userByEmail.email}
              // />
              <div
                className={`mt-8 flex items-center p-4 relative hover:cursor-pointer bg-gray-800`}
              >
                <IoPersonAddSharp
                  className="absolute top-[5px] right-[5px] w-[20px] h-[20px] hover:cursor-pointer text-sky-500"
                  onClick={() => {
                    createChat(userByEmail);
                  }}
                />
                <div className="mr-4 relative flex flex-col">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={userByEmail.avatarUrl}
                      alt="Avatar"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 border border-2 rounded-full ${
                        userByEmail.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">{userByEmail.name}</h2>
                  <p className="text-gray-500 truncate">{userByEmail.email}</p>
                </div>
              </div>
            )} */}
          </>
        )}
      </div>

      {/* bottom */}
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
