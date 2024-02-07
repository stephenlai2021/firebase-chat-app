/* utils */
import moment from "moment";

/* next */
import Image from "next/image";

function MessageCard({ message, me, other }) {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  return (
    <div
      key={message.id}
      className={` ${isMessageFromMe ? "chat chat-end" : "chat chat-start"}`}
    >
      {/* chat avatar */}
      {/* {isMessageFromMe && (
        <div className="chat-image avatar avatar-show hidden">
          <div className="w-10 rounded-full">
            <img src={me.avatarUrl} alt="Avatar" />
          </div>
        </div>
      )}
      {!isMessageFromMe && (
        <div className="chat-image avatar avatar-show hidden">
          <div className="w-10 rounded-full">
            <img src={other?.avatarUrl} alt="Avatar" />
          </div>
        </div>
      )} */}

      {/* chat bubble */}
      <div
        className={`${
          isMessageFromMe
            ? "chat-bubble chat-bubble-accent"
            : "chat-bubble chat-bubble-primary"
        }`}
      >
        {message.image && (
          <div className="max-w-60 flex justify-center">
            <img src={message.image} className="max-h-60 mb-4 rounded" />
          </div>
        )}
        <p
          className={`max-w-[360px] text-wrap leading-tight ${
            isMessageFromMe ? "text-accent-content" : "text-primary-content"
          }`}
        >
          {message.content}
        </p>
        <div
          className={`text-xs ${
            isMessageFromMe ? "text-accent-content" : "text-primary-content"
          }`}
        >
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
