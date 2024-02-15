/* components */
import { IoMdChatboxes } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { BsChatDots } from "react-icons/bs";
import { RiUserAddLine } from "react-icons/ri";

export default function MainBottomNavbar({ activeTab, handleTabClick }) {
  return (
    <div className="mt-auto hidden users-mobile">
      <div className="btm-nav">
        <button
          className={`${activeTab === "add" ? "active" : ""}`}
        >
          <RiUserAddLine
            className="w-[22px] h-[22px] font-bold text-base-content"
            onClick={() => handleTabClick("add")}
          />
        </button>
        <button
          className={`${activeTab === "chatrooms" ? "active" : ""}`}
        >
          <BsChatDots
            className="w-6 h-6 text-base-content"
            onClick={() => handleTabClick("chatrooms")}
          />
        </button>
      </div>
    </div>
  );
}
