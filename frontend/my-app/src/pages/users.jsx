import React, {
  useState,
  useEffect,
} from "react";

import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";

import { toast } from "react-toastify";
import api from "../utils/api";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  UsersRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const getErrorMessage = (
  error,
  fallback
) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

function Users() {
  const { t } = useLanguage();

  // =========================
  // States
  // =========================
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [editMode, setEditMode] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  const [formData, setFormData] =
    useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  // =========================
  // Fetch Users
  // =========================
  const fetchUsers = async () => {

    try {

      const res = await api.get("/users");

      setUsers(res.data);

      setLoading(false);

    } catch (error) {

      console.log(error);

      toast.error(
        getErrorMessage(
          error,
          "Failed to fetch users"
        )
      );

      setLoading(false);
    }
  };

  // =========================
  // Load Users
  // =========================
  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // Search Filter
  // =========================
  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const adminUsers = users.filter(
    (user) =>
      user.role
        ?.toLowerCase()
        .includes("admin")
  ).length;

  const statCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: UsersRound,
      accent: "from-cyan-400 to-blue-500",
    },
    {
      title: "Admin Users",
      value: adminUsers,
      icon: ShieldCheck,
      accent: "from-violet-400 to-fuchsia-500",
    },
    {
      title: "Visible Results",
      value: filteredUsers.length,
      icon: UserCheck,
      accent: "from-emerald-400 to-teal-500",
    },
  ];

  // =========================
  // Delete User
  // =========================
  const deleteUser = async (id) => {

    try {

      await api.delete(`/users/${id}`);

      fetchUsers();

      toast.success(
        "User deleted successfully"
      );

    } catch (error) {

      console.log(error);

      toast.error(
        getErrorMessage(error, "Delete failed")
      );
    }
  };

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Add User
  // =========================
  const addUser = async () => {

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {

      return toast.error(
        "Fill all fields"
      );
    }

    try {

      await api.post(
        "/users",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role.trim(),
        }
      );

      fetchUsers();

      toast.success(
        "User added successfully"
      );

      setShowModal(false);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "User",
      });

    } catch (error) {

      console.log(error);

      toast.error(
        getErrorMessage(
          error,
          "Add user failed"
        )
      );
    }
  };

  // =========================
  // Edit User
  // =========================
  const editUser = (user) => {

    setEditMode(true);

    setEditId(user._id);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setShowModal(true);
  };

  // =========================
  // Update User
  // =========================
  const updateUser = async () => {

    if (
      !formData.name ||
      !formData.email ||
      !formData.role
    ) {

      return toast.error(
        "Fill all fields"
      );
    }

    try {

      await api.put(
        `/users/${editId}`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role.trim(),
          ...(formData.password
            ? { password: formData.password }
            : {}),
        }
      );

      fetchUsers();

      toast.success(
        "User updated successfully"
      );

      setShowModal(false);

      setEditMode(false);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "User",
      });

    } catch (error) {

      console.log(error);

      toast.error(
        getErrorMessage(error, "Update failed")
      );
    }
  };

  // =========================
  // Open Add Modal
  // =========================
  const openAddModal = () => {

    setEditMode(false);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "User",
    });

    setShowModal(true);
  };

  // =========================
  // Loading
  // =========================
  if (loading) {

    return (

      <div
        className="
        min-h-screen
        flex items-center justify-center
        bg-slate-950
        px-6
        text-white
        "
      >
        <div className="text-center">

          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <h2 className="text-2xl font-semibold tracking-tight">
            Loading users
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Preparing your user directory...
          </p>

        </div>
      </div>
    );
  }

  return (

    <Layout>

      <div
        className="
        min-h-screen
        bg-slate-950
        px-4 py-6
        text-slate-100
        sm:px-6 lg:px-8
        "
      >

        <div className="mx-auto max-w-7xl space-y-7">

          {/* Top */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                {t("adminConsole")}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("usersManagement")}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage user profiles, roles, and access from one clean workspace.
              </p>

            </div>

            {/* Add User Button */}
            <button
              onClick={openAddModal}
              className="
              inline-flex w-full items-center justify-center gap-2
              rounded-xl
              bg-cyan-400
              px-5 py-3
              text-sm font-semibold
              text-slate-950
              shadow-lg shadow-cyan-500/20
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-cyan-500/30
              focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950
              sm:w-auto
              "
            >

              <Plus size={19} />

              {t("addUser")}

            </button>

          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">

            {statCards.map((stat) => {

              const Icon = stat.icon;

              return (

                <div
                  key={stat.title}
                  className="
                  rounded-2xl
                  border border-slate-800
                  bg-slate-900/80
                  p-5
                  shadow-xl shadow-black/20
                  transition-all duration-300
                  hover:-translate-y-1 hover:border-slate-700
                  "
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm font-medium text-slate-400">
                        {t(stat.title.replace(/\s+/g, "").replace(/^./, (value) => value.toLowerCase()))}
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                        {stat.value}
                      </p>

                    </div>

                    <div
                      className={`
                      flex h-12 w-12 items-center justify-center
                      rounded-xl
                      bg-gradient-to-br ${stat.accent}
                      text-white
                      shadow-lg shadow-black/20
                      `}
                    >
                      <Icon size={22} />
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Toolbar */}
          <div
            className="
            flex flex-col gap-4
            rounded-2xl
            border border-slate-800
            bg-slate-900/80
            p-4
            shadow-xl shadow-black/20
            lg:flex-row lg:items-center lg:justify-between
            "
          >

            {/* Search */}
            <div
              className="
              flex min-h-12 flex-1 items-center gap-3
              rounded-xl
              border border-slate-700
              bg-slate-950/80
              px-4
              transition-all duration-300
              focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10
              "
            >

              <Search size={20} className="shrink-0 text-slate-500" />

              <input
                type="text"
                placeholder={t("searchUsers")}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                w-full
                bg-transparent
                text-sm
                text-white
                outline-none
                placeholder:text-slate-500
                "
              />

            </div>

            <div className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {users.length}
              </span>{" "}
              users
            </div>

          </div>

          {/* Desktop Table */}
          <div
            className="
            hidden
            overflow-hidden
            rounded-2xl
            border border-slate-800
            bg-slate-900/80
            shadow-xl shadow-black/20
            md:block
            "
          >

            <div className="overflow-x-auto">

              <table className="w-full min-w-[760px] text-left">

                {/* Table Head */}
                <thead className="bg-slate-950/60">

                  <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.18em] text-slate-500">

                    <th className="px-6 py-4 font-semibold">
                      {t("name")}
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      {t("email")}
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      {t("role")}
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      {t("actions")}
                    </th>

                  </tr>

                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-800">

                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (

                      <tr
                        key={user._id}
                        className="
                        group
                        transition-all duration-300
                        hover:bg-slate-800/60
                        "
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                              flex h-11 w-11 shrink-0 items-center justify-center
                              rounded-xl
                              bg-cyan-400/10
                              text-sm font-bold
                              text-cyan-300
                              ring-1 ring-cyan-400/20
                              "
                            >
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-white">
                                {user.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                User ID: {user._id}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-5 text-sm text-slate-300">
                          {user.email}
                        </td>

                        <td className="px-6 py-5">

                          <span
                            className="
                            inline-flex items-center
                            rounded-full
                            border border-cyan-400/20
                            bg-cyan-400/10
                            px-3 py-1
                            text-xs font-semibold
                            text-cyan-300
                            "
                          >
                            {user.role}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            {/* Edit */}
                            <button
                              onClick={() =>
                                editUser(user)
                              }
                              className="
                              inline-flex h-10 w-10 items-center justify-center
                              rounded-xl
                              border border-amber-400/20
                              bg-amber-400/10
                              text-amber-300
                              transition-all duration-300
                              hover:-translate-y-0.5 hover:bg-amber-400/20 hover:text-amber-200
                              focus:outline-none focus:ring-2 focus:ring-amber-300/40
                              "
                              aria-label="Edit user"
                              title="Edit user"
                            >
                              <Pencil size={17} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() =>
                                deleteUser(user._id)
                              }
                              className="
                              inline-flex h-10 w-10 items-center justify-center
                              rounded-xl
                              border border-red-400/20
                              bg-red-400/10
                              text-red-300
                              transition-all duration-300
                              hover:-translate-y-0.5 hover:bg-red-400/20 hover:text-red-200
                              focus:outline-none focus:ring-2 focus:ring-red-300/40
                              "
                              aria-label="Delete user"
                              title="Delete user"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-14 text-center text-sm text-slate-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (

                <div
                  key={user._id}
                  className="
                  rounded-2xl
                  border border-slate-800
                  bg-slate-900/80
                  p-5
                  shadow-xl shadow-black/20
                  "
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className="
                        flex h-11 w-11 shrink-0 items-center justify-center
                        rounded-xl
                        bg-cyan-400/10
                        text-sm font-bold
                        text-cyan-300
                        ring-1 ring-cyan-400/20
                        "
                      >
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-white">
                          {user.name}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-400">
                          {user.email}
                        </p>

                      </div>

                    </div>

                    <span
                      className="
                      shrink-0
                      rounded-full
                      border border-cyan-400/20
                      bg-cyan-400/10
                      px-3 py-1
                      text-xs font-semibold
                      text-cyan-300
                      "
                    >
                      {user.role}
                    </span>

                  </div>

                  <div className="mt-5 flex gap-3">

                    <button
                      onClick={() =>
                        editUser(user)
                      }
                      className="
                      inline-flex flex-1 items-center justify-center gap-2
                      rounded-xl
                      border border-amber-400/20
                      bg-amber-400/10
                      px-4 py-3
                      text-sm font-semibold
                      text-amber-300
                      transition-all duration-300
                      hover:bg-amber-400/20
                      "
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteUser(user._id)
                      }
                      className="
                      inline-flex flex-1 items-center justify-center gap-2
                      rounded-xl
                      border border-red-400/20
                      bg-red-400/10
                      px-4 py-3
                      text-sm font-semibold
                      text-red-300
                      transition-all duration-300
                      hover:bg-red-400/20
                      "
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>
              ))
            ) : (
              <div
                className="
                rounded-2xl
                border border-slate-800
                bg-slate-900/80
                p-8
                text-center text-sm
                text-slate-400
                "
              >
                No users found.
              </div>
            )}

          </div>

          {/* Modal */}
          {showModal && (

            <div
              className="
              fixed inset-0
              z-50
              flex items-center justify-center
              bg-slate-950/80
              px-4 py-6
              backdrop-blur-sm
              "
            >

              <div
                className="
                w-full max-w-md
                rounded-2xl
                border border-slate-700
                bg-slate-900
                p-6
                shadow-2xl shadow-black/40
                sm:p-7
                "
              >

                {/* Top */}
                <div className="mb-6 flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium text-cyan-300">
                      User Profile
                    </p>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">

                      {editMode
                        ? "Edit User"
                        : "Add User"}

                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="
                    inline-flex h-10 w-10 items-center justify-center
                    rounded-xl
                    border border-slate-700
                    bg-slate-950/80
                    text-slate-400
                    transition-all duration-300
                    hover:border-red-400/40 hover:text-red-300
                    focus:outline-none focus:ring-2 focus:ring-cyan-300/40
                    "
                    aria-label="Close modal"
                  >
                    <X size={19} />
                  </button>

                </div>

                {/* Inputs */}
                <div className="space-y-4">

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    className="
                    w-full
                    rounded-xl
                    border border-slate-700
                    bg-slate-950/80
                    px-4 py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-slate-500
                    focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10
                    "
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    className="
                    w-full
                    rounded-xl
                    border border-slate-700
                    bg-slate-950/80
                    px-4 py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-slate-500
                    focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10
                    "
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder={
                      editMode
                        ? "New password (optional)"
                        : "Enter password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    className="
                    w-full
                    rounded-xl
                    border border-slate-700
                    bg-slate-950/80
                    px-4 py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-slate-500
                    focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10
                    "
                  />

                  <input
                    type="text"
                    name="role"
                    placeholder="Enter role"
                    value={formData.role}
                    onChange={handleChange}
                    className="
                    w-full
                    rounded-xl
                    border border-slate-700
                    bg-slate-950/80
                    px-4 py-3.5
                    text-sm
                    text-white
                    outline-none
                    transition-all duration-300
                    placeholder:text-slate-500
                    focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10
                    "
                  />

                </div>

                {/* Button */}
                <button
                  onClick={
                    editMode
                      ? updateUser
                      : addUser
                  }
                  className="
                  mt-6
                  inline-flex w-full items-center justify-center
                  rounded-xl
                  bg-cyan-400
                  px-5 py-3.5
                  text-sm font-semibold
                  text-slate-950
                  shadow-lg shadow-cyan-500/20
                  transition-all duration-300
                  hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-cyan-500/30
                  focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900
                  "
                >

                  {editMode
                    ? "Update User"
                    : "Save User"}

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </Layout>
  );
}

export default Users;
