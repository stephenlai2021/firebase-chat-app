/* 3rd-party library */
import moment from "moment";

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
      className={` ${
        isMessageFromMe ? "chat chat-end" : "chat chat-start"
      }`}
    >
      {isMessageFromMe && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              className="avatar-show hidden"
              src={me.avatarUrl}
              alt="Avatar"
            />
          </div>
        </div>
      )}
      {!isMessageFromMe && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              className="avatar-show hidden"
              src={other?.avatarUrl}
              alt="Avatar"
            />
          </div>
        </div>
      )}
      <div
        className={`${
          isMessageFromMe
            ? "chat-bubble chat-bubble-accent"
            : "chat-bubble chat-bubble-info"
        }`}
      >
        {message.image && (
          <div className="w-60 flex justify-center">
            <img src={message.image} className="max-h-60 mb-4 rounded" />
          </div>
        )}
        <p>{message.content}</p>
        <div
          // className={`text-xs ${
          //   isMessageFromMe ? "text-white" : "text-gray-900"
          // }`}
          className="text-xs"
        >
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
