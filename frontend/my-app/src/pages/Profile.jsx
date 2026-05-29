import React, {
  useState
} from "react";

import Layout
from "../components/Layout";

import toast
from "react-hot-toast";

function Profile() {

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
  // STATES
  // =========================

  const [name, setName] =
    useState(
      user?.displayName ||
      user?.name ||
      "Sasidhar"
    );

  const [email, setEmail] =
    useState(
      user?.email ||
      "user@gmail.com"
    );

  const [phone, setPhone] =
    useState(
      "9876543210"
    );

  const [bio, setBio] =
    useState(
      "Finance enthusiast 🚀"
    );

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave =
    () => {

      const updatedUser = {

        ...user,
        name,
        email,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(
          updatedUser
        )
      );

      toast.success(
        "Profile updated successfully ✅"
      );
    };

  return (

    <Layout>

      <div className="min-h-screen text-white">

        {/* HEADER */}

        <div className="mb-10">

          <h1
            className="
            text-5xl
            font-bold
            mb-2
            "
          >

            My Profile 👤

          </h1>

          <p className="text-slate-400">

            Manage your account information and personal details.

          </p>

        </div>

        {/* GRID */}

        <div
          className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-8
          "
        >

          {/* LEFT CARD */}

          <div
            className="
            bg-[#111827]
            border
            border-slate-800
            rounded-3xl
            p-8
            shadow-2xl
            "
          >

            {/* PROFILE IMAGE */}

            <div className="flex flex-col items-center">

              {user?.photoURL ? (

                <img
                  src={user.photoURL}
                  alt="profile"
                  className="
                  w-32
                  h-32
                  rounded-full
                  border-4
                  border-cyan-400
                  object-cover
                  shadow-lg
                  "
                />

              ) : (

                <div
                  className="
                  w-32
                  h-32
                  rounded-full
                  bg-cyan-500
                  flex
                  items-center
                  justify-center
                  text-5xl
                  font-bold
                  "
                >

                  {name.charAt(0)}

                </div>

              )}

              <h2
                className="
                text-3xl
                font-bold
                mt-5
                "
              >

                {name}

              </h2>

              <p className="text-slate-400 mt-2">

                {email}

              </p>

              <span
                className="
                mt-4
                bg-green-500/20
                text-green-400
                px-4
                py-1
                rounded-full
                text-sm
                "
              >

                Active Account

              </span>

            </div>

            {/* STATS */}

            <div className="mt-10 space-y-5">

              <div
                className="
                bg-[#1e293b]
                rounded-2xl
                p-4
                "
              >

                <p className="text-slate-400 text-sm">
                  Login Method
                </p>

                <h3 className="text-xl font-bold mt-1">
                  Google Authentication
                </h3>

              </div>

              <div
                className="
                bg-[#1e293b]
                rounded-2xl
                p-4
                "
              >

                <p className="text-slate-400 text-sm">
                  Member Since
                </p>

                <h3 className="text-xl font-bold mt-1">
                  2026
                </h3>

              </div>

              <div
                className="
                bg-[#1e293b]
                rounded-2xl
                p-4
                "
              >

                <p className="text-slate-400 text-sm">
                  Account Status
                </p>

                <h3 className="text-xl font-bold mt-1 text-green-400">
                  Verified
                </h3>

              </div>

            </div>

          </div>

          {/* RIGHT SECTION */}

          <div
            className="
            lg:col-span-2
            space-y-8
            "
          >

            {/* EDIT PROFILE */}

            <div
              className="
              bg-[#111827]
              border
              border-slate-800
              rounded-3xl
              p-8
              shadow-2xl
              "
            >

              <h2
                className="
                text-3xl
                font-bold
                mb-8
                "
              >

                Edit Profile ✨

              </h2>

              <div className="space-y-6">

                <div>

                  <label className="text-slate-400">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    className="
                    w-full
                    mt-2
                    bg-[#1e293b]
                    border
                    border-slate-700
                    rounded-2xl
                    p-4
                    outline-none
                    focus:border-cyan-400
                    "
                  />

                </div>

                <div>

                  <label className="text-slate-400">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="
                    w-full
                    mt-2
                    bg-[#1e293b]
                    border
                    border-slate-700
                    rounded-2xl
                    p-4
                    outline-none
                    focus:border-cyan-400
                    "
                  />

                </div>

                <div>

                  <label className="text-slate-400">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    className="
                    w-full
                    mt-2
                    bg-[#1e293b]
                    border
                    border-slate-700
                    rounded-2xl
                    p-4
                    outline-none
                    focus:border-cyan-400
                    "
                  />

                </div>

                <div>

                  <label className="text-slate-400">
                    Bio
                  </label>

                  <textarea
                    rows="4"
                    value={bio}
                    onChange={(e) =>
                      setBio(
                        e.target.value
                      )
                    }
                    className="
                    w-full
                    mt-2
                    bg-[#1e293b]
                    border
                    border-slate-700
                    rounded-2xl
                    p-4
                    outline-none
                    focus:border-cyan-400
                    "
                  />

                </div>

                <button
                  onClick={handleSave}
                  className="
                  bg-cyan-500
                  hover:bg-cyan-600
                  px-8
                  py-4
                  rounded-2xl
                  text-lg
                  font-semibold
                  transition-all
                  duration-300
                  hover:scale-105
                  "
                >

                  Save Changes

                </button>

              </div>

            </div>

            {/* ACTIVITY */}

            <div
              className="
              bg-[#111827]
              border
              border-slate-800
              rounded-3xl
              p-8
              shadow-2xl
              "
            >

              <h2
                className="
                text-3xl
                font-bold
                mb-6
                "
              >

                Recent Activity 📈

              </h2>

              <div className="space-y-4">

                <div
                  className="
                  bg-[#1e293b]
                  p-4
                  rounded-2xl
                  "
                >

                  ✅ Logged in successfully

                </div>

                <div
                  className="
                  bg-[#1e293b]
                  p-4
                  rounded-2xl
                  "
                >

                  🔒 Changed password

                </div>

                <div
                  className="
                  bg-[#1e293b]
                  p-4
                  rounded-2xl
                  "
                >

                  ⚙️ Updated settings

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Profile;