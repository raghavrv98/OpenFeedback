import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const userInfoItem = JSON.parse(localStorage.getItem("data"));
  const [userInfo, setUserInfo] = useState(userInfoItem);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAction = (action) => {
    if (action === "logout") {
      navigate("/");
      localStorage.removeItem("data");
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-xl mb-4">
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold">
          OPEN <span className="text-blue-500">FEEDBACK</span>
        </h1>
        <p className="text-gray-500 text-xs">Give anonymous feedback easily</p>
      </div>

      {/* RIGHT */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-xl transition"
        >
          <img
            src={userInfo.avatar}
            alt="profile"
            className="w-10 h-10 rounded-full border"
          />
          <span className="font-medium">{userInfo.name}</span>
          <span className="text-sm text-gray-500">{open ? "▲" : "▼"}</span>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-3 w-52 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <ul className="py-2 text-sm">
              <li
                onClick={() => handleAction("edit")}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-700">Edit Profile</span>
              </li>

              <li
                onClick={() => handleAction("delete")}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-red-50 transition"
              >
                <span className="font-medium text-red-600">Delete Account</span>
              </li>

              {/* Divider */}
              <div className="my-2 border-t border-gray-200 mx-3"></div>

              <li
                onClick={() => handleAction("logout")}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-red-100 transition"
              >
                <span className="font-semibold text-red-600">Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
