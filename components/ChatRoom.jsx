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

  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  //get messages
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
        //console.log(messages);
        setMessages(messages);
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  //put messages in db
  const sendMessage = async () => {
    const messagesCollection = collection(firestore, "messages");
    // Check if the message is not empty
    // if (message == "" && image == "") return;

    if ((message == "" && image !== "") || (message !== "" && image == "") || (message !== "" && image !== "")) {
      try {
        // Add a new message to the Firestore collection
        const newMessage = {
          chatRoomId: chatRoomId,
          sender: me.id,
          content: message,
          time: serverTimestamp(),
          image: image,
        };

        await addDoc(messagesCollection, newMessage);
        setMessage("");
        setImage("");
        //send to chatroom by chatroom id and update last message
        const chatroomRef = doc(firestore, "chatrooms", chatRoomId);
        await updateDoc(chatroomRef, {
          lastMessage: message ? message : "Image",
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
      {/* Selected user info at the top */}
      <div className="bg-gray-900 h-[72px] flex items-center">
        <div className="relative">
          <img src={other.avatarUrl} className="w-9 h-9 ml-2" alt="" />
          {/* <span
            className={`absolute bottom-0 right-0 w-[10px] h-[10px] border border-2 rounded-full ${
              other.status === "online" ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span> */}
        </div>
        <div className="h-8 flex items-end ml-4">{other.name}</div>
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
        // showEmojiPicker={showEmojiPicker}
        // setShowEmojiPicker={setShowEmojiPicker}
      />
    </div>
  );
}

export default ChatRoom;
