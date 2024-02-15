/* components */
import UsersCard from "../main/UsersCard";

/* react-icons */
import { IoMdChatboxes } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";
import { FiUserPlus } from "react-icons/fi";
import { RiUserSearchFill } from "react-icons/ri";
import { SlSettings } from "react-icons/sl";
import { RiUserAddLine } from "react-icons/ri";
import { BsChatDots } from "react-icons/bs";

/* utils */
import { themes, languages } from "@/data/utils";

/* theme */
import { ThemeContext } from "@/context/ThemeContext";

/* react */
import { useContext } from "react";

export default function Sidabar({
  userData,
  activeTab,
  handleTabClick,
  logoutClick,
}) {
  const { changeTheme } = useContext(ThemeContext
    )
  return (
    <div className="bg-base-30 shadow-inner h-full flex flex-col items-center sidebar-hide pt-3">
      {/* add icon */}
      <div
        className={`${
          activeTab == "add" ? "menu-active border-base-content" : ""
        } border- w-full py-3 px-5 flex items-center justify-center`}
      >
        <RiUserAddLine
          className={`w-[20px] h-[20px] hover:cursor-pointer text-base-content`}
          onClick={() => handleTabClick("add")}
        />
      </div>

      {/* chatroom icon */}
      <div
        className={`${
          activeTab == "chatrooms" ? "menu-active border-base-content" : ""
        } border- w-full py-3 px-5 flex items-center justify-center`}
      >
        <BsChatDots
          className={`w-[20px] h-[20px] hover:cursor-pointer text-base-content`}
          onClick={() => handleTabClick("chatrooms")}
        />
      </div>

      {/* bottom icon */}
      <div className="mt-auto mb-3">
        <div className="drawer z-[100]">
          <input
            id="sidebar-drawer-settings"
            type="checkbox"
            className="drawer-toggle"
          />
          <div className="border- border-red-30 flex justify-center">
            <label
              htmlFor="sidebar-drawer-settings"
              aria-label="close sidebar"
              className="px-5 py-2"
            >
              <RxAvatar className="w-[24px] h-[24px] hover:cursor-pointer text-base-content" />
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="sidebar-drawer-settings"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="pt-4 w-80 min-h-full bg-base-200 text-base-content">
              <li className="pl-2">
                <a>
                  <UsersCard
                    name={userData.name}
                    email={userData.email}
                    avatarUrl={userData.avatarUrl}
                  />
                </a>
              </li>
              <li>
                <ul className="menu bg-base-200 w-ful rounded-box">
                  <li>
                    <details>
                      <summary className="">Theme</summary>
                      <ul>
                        {themes.map((theme) => (
                          <div key={theme.label} className="form-control" onClick={() => changeTheme(theme.value)}>
                            <label className="label cursor-pointer gap-4">
                              <span className="label-text">{theme.label}</span>
                              <input
                                type="radio"
                                name="theme-radios"
                                className="radio theme-controller"
                                value={theme.value}
                              />
                            </label>
                          </div>
                        ))}
                      </ul>
                    </details>
                  </li>
                  <li>
                    <details>
                      <summary>Language</summary>
                      <ul>
                        {languages.map((language) => (
                          <li key={language.label}>
                            <a>{language.value}</a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                  <li>
                    <a onClick={logoutClick}>Logout</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
