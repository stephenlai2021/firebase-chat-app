import React from "react";

export default function Navbar({ activeTab }) {
  return (
    <div className="h-[60px] flex py-[16px] pl-[15px]">
      <div className="text-xl font-bold text-base-content">
        {activeTab == "chatrooms"
          ? "Chatrooms"
          : activeTab == "add"
          ? "Add friend"
          : activeTab == "settings"
          ? "Settings"
          : activeTab == "user"
          ? "Profile"
          : ""}
      </div>
    </div>
  );
}
