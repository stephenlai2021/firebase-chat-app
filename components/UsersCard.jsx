"use client";

function UsersCard({ avatarUrl, name, latestMessage, time, type, status }) {
  return (
    <div
      className={`flex items-center p-4 relative hover:cursor-pointer hover:bg-gray-800`}
    >
      {/* Avatar on the left */}
      <div className="flex-shrink-0 mr-4 relative border border-2">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={avatarUrl}
            alt="Avatar"
          />
          <span className={`absolute bottom-0 right-0 w-3 h-3 border border-2 rounded-full ${status === "online" ? 'bg-green-500' : 'bg-gray-500'}`}></span>
        </div>
      </div>

      {type == "chat" && (
        /* Name, latest message, and time on the right */
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{name}</h2>
          </div>
          <p className="text-gray-500 truncate">{latestMessage}</p>
        </div>
      )}

      {type == "user" && (
        /* Name */
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{name}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersCard;
