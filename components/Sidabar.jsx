import { useState } from "react";

/* components */
import { IoPersonAddSharp } from "react-icons/io5";
import { IoMdChatboxes } from "react-icons/io";

export default function Sidabar() {
  const [activeTab, setActiveTab] = useState("chatrooms");

  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="w-[80px] h-screen p-5 flex flex-col border-2 border-red-300 items-center">
      <div className="mb-6" onClick={() => handleTabClick("users")}>
        <IoPersonAddSharp
          className={`w-[20px] h-[20px] hover:cursor-pointer`}
        />
      </div>
      <div className="mb-6" onClick={() => handleTabClick("chatrooms")}>
        <IoMdChatboxes className={`w-[24px] h-[24px] hover:cursor-pointer`} />
      </div>
    </div>
  );
}
