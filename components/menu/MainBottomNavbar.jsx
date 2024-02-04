/* components */
import { IoMdChatboxes } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

export default function BottomNavbar({ userData, activeTab, handleTabClick }) {
  return (
    <div className="mt-auto hidden users-mobile">
    <div className="btm-nav">
      <button
        className={`${
          activeTab == "add" ? "active text-base-content" : ""
        }`}
      >
        <IoMdAdd
          className="w-6 h-6 font-bold text-base-content"
          onClick={() => handleTabClick("add")}
        />
      </button>
      <button
        className={`${
          activeTab == "chatrooms" ? "active text-base-content" : ""
        }`}
      >
        <IoMdChatboxes
          className="w-6 h-6 text-base-content"
          onClick={() => handleTabClick("chatrooms")}
        />
      </button>
      <button
        className={`${
          activeTab == "settings" ? "active text-base-content" : ""
        }`}
      >
        <IoSettingsSharp
          className="w-6 h-6 text-base-content"
          onClick={() => handleTabClick("settings")}
        />
      </button>
      <button
        className={`${
          activeTab == "user" ? "active text-base-content" : ""
        }`}
      >
        <img
          src={userData.avatarUrl}
          width={30}
          height={30}
          alt="Picture of the author"
          className="rounded-full"
          tabIndex={0}
          role="button"
          onClick={() => handleTabClick("user")}
        />
      </button>
    </div>
  </div>
  )
}
