/* react */
import { useState, useEffect, useRef } from "react";

/* next */
import backgroundImage from "../../public/avatar.png";

/* firebase */
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/firebase/client-config";

/* components */
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import MessageSkeleton from "@/components/skeleton/MessageSkeleton";

/* react-icons */
import { FaArrowLeft, FaBullseye } from "react-icons/fa";

import UserAvatar from "@/components/images/avatar.png";

let setTimeoutInstance;

function ChatRoom({ selectedChatroom, setSelectedChatroom }) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatRoomId = selectedChatroom?.id;

  const messagesContainerRef = useRef(null);

  // const [message, setMessage] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /* get other user data in realtime */
  useEffect(() => {
    const unsubOtherUser = onSnapshot(
      doc(firestore, "users", other.email),
      (doc) => {
        setOtherUser(doc.data());
      }
    );
    return () => unsubOtherUser();
  }, [other]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  /* get messages */
  useEffect(() => {
    if (!chatRoomId) return;
    setLoading(true);
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "messages"),
        where("chatRoomId", "==", chatRoomId),
        orderBy("time", "asc")
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messages);
        if (messages.length !== 0) setLoading(false);
        console.log("messages: ", messages);
      }
    );
    return () => unsubscribe();
  }, [chatRoomId]);

  /* put messages in db */
  const sendMessage = async () => {
    // Check if the message is not empty
    if (message == "" && image == null) return;

    if (
      (message == "" && image !== null) ||
      (message !== "" && image == null) ||
      (message !== "" && image !== null)
    ) {
      try {
        // Add a new message to the Firestore collection
        const newMessage = {
          chatRoomId: chatRoomId,
          sender: me.id,
          content: message,
          time: serverTimestamp(),
          image: image,
        };

        setMessage("");
        setImage(null);

        const messagesCollection = collection(firestore, "messages");
        await addDoc(messagesCollection, newMessage);

        //send to chatroom by chatroom id and update last message
        const chatroomRef = doc(firestore, "chatrooms", chatRoomId);
        await updateDoc(chatroomRef, {
          lastMessage: message ? message : "[Image]",
          lastMessageSentTime: serverTimestamp(),
        });

        // Clear the input field after sending the message
      } catch (error) {
        console.error("Error sending message:", error.message);
      }
    } else {
      setMessage("");
      setImage(null);
      return;
    }

    // Scroll to the bottom after sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const gotoUsersMenu = () => {
    setSelectedChatroom(null);
  };

  /* handle chat bubble loading time */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="flex flex-col h-screen shadow-inner">
      {/* top menu */}
      <div className="h-[64px] flex items-center shadow-inner bg-base-30">       
        {loading && !otherUser ? (
          <div className="hidden show-flex">
            <div className="flex items-end ml-4 pb-1">
              <div className="skeleton rounded w-[18px] h-[18px] pt-"></div>
            </div>
            <div className="skeleton rounded-full w-9 h-9 ml-2"></div>
            <div className="flex items-end pb-1 border-1 ml-2">
              <div className="skeleton rounded w-[72px] h-4"></div>
            </div>
          </div>
        ) : (
          <>
            {/* left arrow icon */}
            <div
              className={`${
                selectedChatroom ? "arrow-show" : "hidden"
              } border- hidden ml-4 pr-1 flex pt-3 hover:cursor-pointer`}
              onClick={gotoUsersMenu}
            >
              <FaArrowLeft className="text-base-content w-[18px] h-[18px]" />
            </div>

            {/* user avatar */}
            <div className="avatar ml-1
             relative">
              <div className="w-9 h-9 rounded-full">
                <img src={otherUser?.avatarUrl} />
              </div>
              <span
                className={`absolute bottom-0 right-0 w-[10px] h-[10px] border border-2 rounded-full ${
                  otherUser?.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              ></span>
            </div>

            {/* user name */}
            <div className="h-8 font-semibold flex items-end ml-2 text-base-content">
              {otherUser?.name}
            </div>
          </>
        )}
      </div>

      {/* Messages container with overflow and scroll */}
      <div
        ref={messagesContainerRef}
        className="shadow-inner flex-1 overflow-y-auto overflow-x-hidden py-4 px-6 chatroom-padding"
      >
        {!loading &&
          messages?.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              me={me}
              other={otherUser}
            />
          ))}

        {/* hide loading screen after 2 seconds */}
        {/* {messages.length == 0 && <MessageSkeleton />} */}
        {loading && <MessageSkeleton />}
      </div>

      {/* Input box at the bottom */}
      <MessageInput
        message={message}
        sendMessage={sendMessage}
        setMessage={setMessage}
        image={image}
        setImage={setImage}
      />
    </div>
  );
}

export default ChatRoom;
