"use client";

import moment from "moment";

function UsersCard({
  name,
  avatarUrl,
  email,
  lastMessage,
  lastMessageSentTime,
  timeStamp,
  status,
  found,
  type,
  loginUser,
  bgColor,
}) {
  /* 時間格式 */
  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  return (
    <div
      className={`${
        found == "true" ? "" : "hover:cursor-pointer"
      } border-1 border-red-30 w-full hover:bg-base-300 flex items-center justify-between rounded px-4 py-3 relative ${
        bgColor ? bgColor : ""
      }`}
    >
      {/* Avatar on the left */}
      <div className="flex-shrink-0 mr-4 relative">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={
              avatarUrl
                ? avatarUrl
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToK4qEfbnd-RN82wdL2awn_PMviy_pelocqQ&usqp=CAU"
            }
            alt="Avatar"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 border border-2 rounded-full ${
              status === "online" ? "bg-green-500" : "bg-gray-500"
            }`}
          ></span>
        </div>
      </div>

      {type == "chat" && (
        <div className="flex-1">
          <div className="flex items-center justify-between text-desktop text-phone border-1 border-green-30">
            <h2 className="text-lg font-semibold truncate text-base-content">{name}</h2>
            <div className="text-xs text-base-content truncate time-stamp-desktop">
              {lastMessageSentTime ? formatTimeAgo(lastMessageSentTime) : ''}
            </div>
          </div>
          <p className="text-base-content truncate text-sm text-desktop text-tablet text-phone">
            {lastMessage}
          </p>
        </div>
      )}
    </div>
  );
}

export default UsersCard;
