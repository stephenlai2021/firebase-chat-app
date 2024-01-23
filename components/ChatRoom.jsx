import React, { useState, useEffect, useRef } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
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
import { firestore } from "@/lib/firebase";

function ChatRoom({ selectedChatroom }) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  console.log("other: ", other);
  const chatRoomId = selectedChatroom?.id;

  const messagesContainerRef = useRef(null);

  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  /* get other user data */
  useEffect(() => {
    const unsubOtherUser = onSnapshot(
      doc(firestore, "users", other.email),
      // doc(firestore, "users", selectedChatroom?.otherData.email),
      (doc) => {
        setOtherUser(doc.data())
        console.log('other user: ', otherUser)
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
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  /* put messages in db */
  const sendMessage = async () => {
    // Check if the message is not empty
    if (message == "" && image == "") return;

    if (
      (message == "" && image !== "") ||
      (message !== "" && image == "") ||
      (message !== "" && image !== "")
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

        const messagesCollection = collection(firestore, "messages");
        await addDoc(messagesCollection, newMessage);
        setMessage("");
        setImage("");
        //send to chatroom by chatroom id and update last message
        const chatroomRef = doc(firestore, "chatrooms", chatRoomId);
        await updateDoc(chatroomRef, {
          // lastMessage: message ? message : `Image`,
          lastMessage: message ? message : `${me.name} has sent an image`,
        });

        // Clear the input field after sending the message
      } catch (error) {
        console.error("Error sending message:", error.message);
      }
    }

    // Scroll to the bottom after sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* top menu */}
      <div className="bg-gray-900 h-[72px] flex items-center">
        <div className="relative">
          <img src={otherUser?.avatarUrl} className="w-9 h-9 ml-2" alt="" />
          <span
            className={`absolute bottom-0 right-0 w-[10px] h-[10px] border border-2 rounded-full ${
              otherUser?.status === "online" ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
        </div>
        <div className="h-8 flex items-end ml-2">{otherUser?.name}</div>
      </div>

      {/* Messages container with overflow and scroll */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pt-10 px-6"
      >
        {messages?.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            me={me}
            other={other}
          />
        ))}
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
