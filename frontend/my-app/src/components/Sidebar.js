import React from "react";

import {
  LayoutDashboard,
  BarChart3,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  signOut
} from "firebase/auth";

import {
  auth
} from "../firebase";

import toast
from "react-hot-toast";

function Sidebar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  // =========================
  // USER DATA
  // =========================

  const googleUser =
    JSON.parse(
      localStorage.getItem(
        "googleUser"
      )
    );

  const normalUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  const user =
    googleUser ||
    normalUser;

  // =========================
  // LOGOUT
  // =========================

  const handleLogout =
    async () => {

      try {

        await signOut(auth);

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "googleUser"
        );

        localStorage.removeItem(
          "user"
        );

        toast.success(
          "Logged out successfully 👋"
        );

        navigate("/");

      } catch (error) {

        console.log(error);

        toast.error(
          "Logout failed ❌"
        );
      }
    };

  // =========================
  // MENU
  // =========================

  const menu = [

    {
      name: "Dashboard",
      icon:
        <LayoutDashboard size={20} />,
      path: "/dashboard",
    },

    {
      name: "Analytics",
      icon:
        <BarChart3 size={20} />,
      path: "/analytics",
    },

    {
      name: "Profile",
      icon:
        <User size={20} />,
      path: "/profile",
    },

    {
      name: "Settings",
      icon:
        <Settings size={20} />,
      path: "/settings",
    },

  ];

  return (

    <div
      className="
      fixed
      left-0
      top-0
      h-screen
      w-64
      bg-[#111827]/95
      backdrop-blur-lg
      border-r
      border-slate-800
      shadow-2xl
      flex
      flex-col
      justify-between
      p-5
      "
    >

      {/* TOP */}

      <div>

        {/* LOGO */}

        <div className="mb-10">

          <h2
            className="
            text-3xl
            font-bold
            tracking-wide
            text-cyan-400
            "
          >

            TaxPal

          </h2>

          <p
            className="
            text-slate-400
            text-sm
            mt-2
            "
          >

            Finance Dashboard

          </p>

        </div>

        {/* USER CARD */}

        <div
          className="
          bg-[#1e293b]
          rounded-2xl
          p-4
          mb-8
          border
          border-slate-700
          shadow-lg
          "
        >

          <div className="flex items-center gap-3">

            {user?.photoURL ? (

              <img
                src={user.photoURL}
                alt="profile"
                className="
                w-14
                h-14
                rounded-full
                border-2
                border-cyan-400
                object-cover
                "
              />

            ) : (

              <div
                className="
                w-14
                h-14
                rounded-full
                bg-cyan-500
                flex
                items-center
                justify-center
                text-white
                text-xl
                font-bold
                "
              >

                {user?.name?.charAt(0) ||
                  user?.displayName?.charAt(0) ||
                  "U"}

              </div>

            )}

            <div>

              <h3
                className="
                text-white
                font-semibold
                text-lg
                "
              >

                {user?.displayName ||
                  user?.name ||
                  "User"}

              </h3>

              <p
                className="
                text-slate-400
                text-sm
                break-all
                "
              >

                {user?.email ||
                  "user@example.com"}

              </p>

            </div>

          </div>

        </div>

        {/* MENU */}

        <ul className="space-y-4">

          {menu.map((item, index) => (

            <li
              key={index}
              onClick={() =>
                navigate(item.path)
              }
              className={`
              flex
              items-center
              gap-4
              px-4
              py-3
              rounded-2xl
              cursor-pointer
              transition-all
              duration-300
              hover:scale-105
              hover:translate-x-1
              shadow-lg
              ${
                location.pathname ===
                item.path
                  ? "bg-cyan-500 text-white"
                  : "bg-[#1e293b] text-slate-200 hover:bg-[#334155]"
              }
              `}
            >

              <span>

                {item.icon}

              </span>

              <span className="font-medium">

                {item.name}

              </span>

            </li>

          ))}

        </ul>

      </div>

      {/* FOOTER */}

      <div>

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          bg-red-500
          hover:bg-red-600
          text-white
          py-3
          rounded-2xl
          transition-all
          duration-300
          hover:scale-105
          shadow-lg
          mb-4
          "
        >

          <LogOut size={18} />

          Logout

        </button>

        {/* COPYRIGHT */}

        <div
          className="
          text-center
          text-slate-500
          text-sm
          border-t
          border-slate-800
          pt-4
          "
        >

          © 2026 TaxPal

        </div>

      </div>

    </div>
  );
}

export default Sidebar;