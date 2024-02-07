/* components */
import { IoMdChatboxes } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { BsChatDots } from "react-icons/bs";
import { RiUserAddLine } from "react-icons/ri";

export default function BottomNavbar({ userData, activeTab, handleTabClick }) {
  return (
    <div className="mt-auto hidden users-mobile">
      <div className="btm-na shadow-inne h-14 w-full border-1 flex">
        <button
          // className={`${activeTab == "add" ? "active text-base-content" : ""}`}
          className="text-base-content w-1/2 shadow-inner flex justify-center items-center"
        >
          {/* <IoMdAdd */}
          <RiUserAddLine
            className="w-[23px] h-[23px] font-bold text-base-content"
            onClick={() => handleTabClick("add")}
          />
        </button>
        <button
          // className={`${activeTab == "chatrooms" ? "active text-base-content" : ""}`}
          className="text-base-content w-1/2 shadow-inner flex justify-center items-center"
        >
          {/* <IoMdChatboxes */}
          <BsChatDots
            className="w-6 h-6 text-base-content"
            onClick={() => handleTabClick("chatrooms")}
          />
        </button>
      </div>
    </div>
  );
}
