/* react-icons */
import { IoMdChatboxes } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

export default function Sidabar({ userData, activeTab, handleTabClick }) {
  return (
    <div className="shadow-inner h-full flex flex-col items-center sidebar-hide pt-1">
    {/* add icon */}
    <div
      className={`${
        activeTab == "add" ? "menu-active border-base-content" : ""
      } border- w-full py-4 px-5 flex items-center justify-center`}
    >
      <IoMdAdd
        className={`w-6 h-6 font-bold hover:cursor-pointer text-base-content`}
        onClick={() => handleTabClick("add")}
      />
    </div>

    {/* chatroom icon */}
    <div
      className={`${
        activeTab == "chatrooms" ? "menu-active border-base-content" : ""
      } border- w-full py-4 px-5 flex items-center justify-center`}
    >
      <IoMdChatboxes
        className={`w-[22px] h-[22px] hover:cursor-pointer text-base-content`}
        onClick={() => handleTabClick("chatrooms")}
      />
    </div>

    {/* settings icon */}
    <div
      className={`${
        activeTab == "settings" ? "menu-active border-base-content" : ""
      } border- w-full py-4 px-5 flex items-center justify-center`}
    >
      <IoSettingsSharp
        className={`w-[22px] h-[22px] hover:cursor-pointer text-base-content`}
        onClick={() => handleTabClick("settings")}
      />
    </div>

    {/* user icon */}
    <div
      className={`${
        activeTab == "user" ? "menu-active border-base-content" : ""
      } mt-auto p-5 w-full py-4 px-5 flex items-center justify-center`}
      onClick={() => handleTabClick("user")}
    >
      <img
        src={userData.avatarUrl}
        width={30}
        height={30}
        alt="Picture of the author"
        className="rounded-full"
        tabIndex={0}
        role="button"
      />
    </div>
  </div>
  );
}
