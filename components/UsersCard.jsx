"use client";

import moment from "moment";

function UsersCard({
  name,
  avatarUrl,
  email,
  lastMessage,
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
      className={`${found == 'true' ? '' : 'hover:cursor-pointer'} hover:bg-gray-800 flex items-center justify-between rounded p-4 relative ${
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
        /* Name, latest message, and time on the right */
        <div className="flex-1">
          <h2 className="text-lg font-semibold truncate">{name}</h2>
          <p className="text-gray-500 truncate text-sm">
            {lastMessage}
          </p>
        </div>
      )}

      {type == "user" && (
        /* Name */
        <div className="flex-1">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold truncate">{name}</h2>
            {/* <p className="text-gray-500 text-sm truncate">{email}</p> */}
          </div>
        </div>
      )}

      {/* {lastMessage && (
        <div className="h-[48px]">
          <span className="truncate text-xs text-gray-500">
            {formatTimeAgo(timeStamp)}
          </span>
        </div>
      )} */}
    </div>
  );
}

export default UsersCard;
