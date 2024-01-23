/* react */
import { useEffect, useState } from "react";

/* firebase */
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

/* 3rd-party library */
import moment from "moment";

function MessageCard({ message, me, other }) {
  const [otherUser, setOtherUser] = useState(null);

  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  /* get other user data */
  // useEffect(() => {
  //   const unsubOtherUser = onSnapshot(
  //     doc(firestore, "users", other.email),
  //     (doc) => {
  //       setOtherUser(doc.data());
  //       console.log("other user: ", otherUser);
  //     }
  //   );
  //   return () => unsubOtherUser();
  // }, [other]);

  return (
    <div
      key={message.id}
      className={`flex mb-4 ${
        isMessageFromMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar on the left or right based on the sender */}
      {/* <div className={`w-10 h-10 ${isMessageFromMe ? "ml-2 mr-2" : "mr-2"}`}>
        {isMessageFromMe && (
          <img
            className="w-full h-full object-cover rounded-full"
            src={me.avatarUrl}
            alt="Avatar"
          />
        )}
        {!isMessageFromMe && (
          <img
            className="w-full h-full object-cover rounded-full"
            src={other?.avatarUrl}
            alt="Avatar"
          />
        )}
      </div> */}

      {/* Message bubble on the right or left based on the sender */}
      <div
        className={`p-2 rounded-md ${
          isMessageFromMe
            ? "bg-blue-500 self-end text-white"
            : "bg-yellow-200 self-start text-gray-900"
        }`}
      >
        {message.image && (
          <div className="w-60 flex justify-center">
            <img src={message.image} className="max-h-60 mb-4 rounded" />
          </div>
        )}
        <p>{message.content}</p>
        <div
          className={`text-xs ${
            isMessageFromMe ? "text-white" : "text-gray-900"
          }`}
        >
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
