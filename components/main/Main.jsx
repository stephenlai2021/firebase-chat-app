"use client";

/* react */
import { useEffect, useState, useContext } from "react";

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
import Sidebar from "../menu/Sidebar";
import MainBottomNavbar from "../menu/MainBottomNavbar";
import MainNavbar from "../menu/MainNavbar";

/* utils */
import { toast } from "react-hot-toast";

/* react-icons */
import { IoIosSend } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";

function Main({ userData, setSelectedChatroom }) {
  const [activeTab, setActiveTab] = useState("chatrooms");
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const [user, setUser] = useState("");
  const [userName, setUserName] = useState("");
  const [usersByName, setUsersByName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userByEmail, setUserByEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();

  const handleTabClick = (tab) => setActiveTab(tab);

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
      users.push(doc.data());
    });

    setUsersByName(users);
    setUserByEmail("");
  };

  const searchUserByEmail = async () => {
    if (!userEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError("Invalid Email");
      return;
    }

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

  const handleName = (val) => {
    setUserByEmail("");
    setEmailError("");
    setUserName(val);
    setUsersByName("");
  };

  const handleEmail = (val) => {
    setUsersByName("");
    setUserEmail(val);
    setUserByEmail("");
    setEmailError("");
  };

  const handleUserEmailSubmit = (event) => {
    if (event.key === "Enter") searchUserByEmail();
  };

  const handleUserNameSubmit = (event) => {
    if (event.key === "Enter") searchUserByName();
  };

  /* reset name && email if switch to chatrooms menu */
  useEffect(() => {
    if (activeTab == "chatrooms") {
      setUserName("");
      setUsersByName("");
      setUserEmail("");
      setUserByEmail("");
    }
  }, [activeTab]);

  /* get users */
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

  /* get chatrooms */
  useEffect(() => {
    if (!userData.id) return;
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

    return () => unsubscribeChatrooms();
  }, [userData]);

  const setUserStatusOffline = async () => {
    const loginUserRef = doc(firestore, "users", userData.email);
    await updateDoc(loginUserRef, { status: "offline" });

    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.id)
    );
    const querySnapshot = await getDocs(chatroomsQuery);
    querySnapshot.forEach(async (document) => {
      // console.log(document.id, document.data())
      await updateDoc(doc(firestore, "chatrooms", document.id), {
        [`usersData.${userData.id}.status`]: "offline",
      });
    });
  };

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

  const openChat = async (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
    };
    setSelectedChatroom(data);
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
    <div className="flex h-full">
      <Sidebar
        userData={userData}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
      />
      <div className="shadow-inner h-screen flex flex-col w-[300px] min-w-[200px] users-mobile">
        <MainNavbar activeTab={activeTab} />

        {/* main body */}
        <div className="pt-1 overflow-y-auto h-full">
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
                    found={"false"}
                  />
                </div>
              ))}
            </>
          )}
          {activeTab === "settings" && (
            <div className="settings-section">
              <ul className="menu text-base-content">
                <li>
                  <a className="">Theme</a>
                </li>
                <li>
                  <a className="">Language</a>
                </li>
                <li>
                  <a onClick={logoutClick}>Logout</a>
                </li>
              </ul>
            </div>
          )}
          {activeTab === "add" && (
            <>
              <div className="my-3 px-3 input-padding">
                <span className="label-text pl-1">Search by name</span>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => handleName(e.target.value)}
                    onKeyDown={handleUserNameSubmit}
                    placeholder="Enter name"
                    className="input bg-base-200 rounded-md input-bordere input-md w-full max-w-x text-base-content"
                  />
                  <div className="absolute right-1 top-[50%] translate-y-[-50%] p-2">
                    <IoIosSend
                      className="w-[18px] h-[18px] hover:cursor-pointer text-base-content"
                      onClick={searchUserByName}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 px-3 input-padding">
                <span className="label-text pl-1">Search by email</span>
                <div className="relative">
                  <input
                    type="text"
                    value={userEmail}
                    onChange={(e) => handleEmail(e.target.value)}
                    onKeyDown={handleUserEmailSubmit}
                    placeholder="Enter email"
                    className="input input-md input-bordered rounded-md bg-base-200 w-full text-base-content"
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
              {activeTab === "add" && usersByName && (
                <div className="relative mt-8 flex flex-col">
                  {usersByName &&
                    usersByName.map((user) => (
                      <div key={user.id} className="relative mb-2">
                        <UsersCard
                          name={user.name}
                          avatarUrl={user.avatarUrl}
                          email={user.email}
                          status={user.status}
                          lastMessage={user.lastMessage}
                          found={"true"}
                        />
                        {user.email !== userData.email && (
                          <IoPersonAddSharp
                            className="w-5 h-5 text-base-content absolute right-4 top-[50%] translate-y-[-50%] hover:cursor-pointer"
                            onClick={() => createChat(user)}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* user found by email  */}
              {activeTab === "add" && userByEmail && (
                <div className="relative mt-8 flex flex-col">
                  <UsersCard
                    name={userByEmail.name}
                    avatarUrl={userByEmail.avatarUrl}
                    email={userByEmail.email}
                    status={userByEmail.status}
                    lastMessage={userByEmail.lastMessage}
                    found={"true"}
                  />
                  {userEmail !== userData.email && (
                    <IoPersonAddSharp
                      className="w-5 h-5 font-semibold text-base-content absolute right-4 top-[50%] translate-y-[-50%] hover:cursor-pointer"
                      onClick={() => createChat(userByEmail)}
                    />
                  )}
                </div>
              )}
            </>
          )}
          {activeTab === "user" && (
            <div className="px-3 text-base-content">user profile</div>
          )}
        </div>

        <MainBottomNavbar
          userData={userData}
          activeTab={activeTab}
          handleTabClick={handleTabClick}
        />
      </div>
    </div>
  );
}

export default Main;
