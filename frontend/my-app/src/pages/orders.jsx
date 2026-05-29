import React, {
  useState,
  useEffect,
} from "react";

import Layout from "../components/Layout";

import { toast } from "react-toastify";
import api from "../utils/api";

import {
  Search,
  Plus,
  Trash2,
  Package,
  X,
} from "lucide-react";

function Orders() {

  // =========================
  // States
  // =========================
  const [orders, setOrders] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // ✅ Delete Modal
  const [deleteModal, setDeleteModal] =
    useState(false);

  const [selectedOrderId,
    setSelectedOrderId] =
    useState(null);

  const [formData, setFormData] =
    useState({
      customer: "",
      product: "",
      amount: "",
      status: "Pending",
    });

  // =========================
  // Fetch Orders
  // =========================
  const fetchOrders = async () => {

    try {

      const res = await api.get("/orders");

      setOrders(res.data);

      setLoading(false);

    } catch (error) {

      console.log(error);

      toast.error(
        "Failed to fetch orders"
      );
    }
  };

  // =========================
  // Load Orders
  // =========================
  useEffect(() => {

    fetchOrders();

  }, []);

  // =========================
  // Search Filter
  // =========================
  const filteredOrders =
    orders.filter((order) =>
      order.customer
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // =========================
  // Add Order
  // =========================
  const addOrder = async () => {

    if (
      !formData.customer ||
      !formData.product ||
      !formData.amount
    ) {

      return toast.error(
        "Fill all fields"
      );
    }

    try {

      await api.post("/orders", formData);

      fetchOrders();

      toast.success(
        "Order added successfully"
      );

      setShowModal(false);

      setFormData({
        customer: "",
        product: "",
        amount: "",
        status: "Pending",
      });

    } catch (error) {

      console.log(error);

      toast.error(
        "Add order failed"
      );
    }
  };

  // =========================
  // Delete Order
  // =========================
  const deleteOrder = async (id) => {

    try {

      await api.delete(`/orders/${id}`);

      fetchOrders();

      toast.success(
        "Order deleted"
      );

    } catch (error) {

      console.log(error);

      toast.error(
        "Delete failed"
      );
    }
  };

  // =========================
  // Status Color
  // =========================
  const getStatusStyle = (
    status
  ) => {

    switch (status) {

      case "Delivered":
        return `
        bg-green-500/20
        text-green-300
        `;

      case "Pending":
        return `
        bg-yellow-500/20
        text-yellow-300
        `;

      case "Cancelled":
        return `
        bg-red-500/20
        text-red-300
        `;

      default:
        return `
        bg-gray-500/20
        text-gray-300
        `;
    }
  };

  // =========================
  // Loading
  // =========================
  if (loading) {

    return (

      <div
        className="
        min-h-screen
        flex items-center
        justify-center
        bg-[#0f172a]
        text-white
        text-3xl
        "
      >
        Loading Orders...
      </div>
    );
  }

  return (

    <Layout>

      <div
        className="
        min-h-screen
        bg-[#0f172a]
        text-white
        p-8
        "
      >

        {/* Top */}
        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-5xl font-bold">
              Orders Management 📦
            </h1>

            <p className="text-gray-400 mt-2">
              Manage all customer orders
            </p>

          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="
            flex items-center gap-2
            bg-gradient-to-r
            from-purple-500 to-indigo-500
            px-5 py-3
            rounded-2xl
            hover:scale-105
            transition-all duration-300
            shadow-lg shadow-purple-500/30
            "
          >

            <Plus size={20} />

            Add Order

          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div
            className="
            p-6 rounded-3xl
            bg-gradient-to-br
            from-blue-500/20
            to-indigo-700/20
            border border-white/10
            shadow-xl
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                p-4 rounded-2xl
                bg-blue-500/20
                "
              >
                <Package size={28} />
              </div>

              <div>

                <p className="text-gray-300">
                  Total Orders
                </p>

                <h2 className="text-3xl font-bold">
                  {orders.length}
                </h2>

              </div>

            </div>

          </div>

          <div
            className="
            p-6 rounded-3xl
            bg-gradient-to-br
            from-green-500/20
            to-emerald-700/20
            border border-white/10
            shadow-xl
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                p-4 rounded-2xl
                bg-green-500/20
                "
              >
                💰
              </div>

              <div>

                <p className="text-gray-300">
                  Revenue
                </p>

                <h2 className="text-3xl font-bold">
                  ₹2,50,000
                </h2>

              </div>

            </div>

          </div>

          <div
            className="
            p-6 rounded-3xl
            bg-gradient-to-br
            from-yellow-500/20
            to-orange-700/20
            border border-white/10
            shadow-xl
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                p-4 rounded-2xl
                bg-yellow-500/20
                "
              >
                ⏳
              </div>

              <div>

                <p className="text-gray-300">
                  Pending Orders
                </p>

                <h2 className="text-3xl font-bold">

                  {
                    orders.filter(
                      (o) =>
                        o.status ===
                        "Pending"
                    ).length
                  }

                </h2>

              </div>

            </div>

          </div>

        </div>

        {/* Search */}
        <div
          className="
          flex items-center gap-3
          bg-slate-900
          p-4 rounded-2xl
          border border-white/10
          mb-8
          "
        >

          <Search size={20} />

          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
            bg-transparent
            outline-none
            w-full
            text-white
            "
          />

        </div>

        {/* Table */}
        <div
          className="
          bg-slate-900
          rounded-3xl
          border border-white/10
          shadow-2xl
          overflow-hidden
          "
        >

          <table className="w-full text-center">

            <thead>

              <tr className="bg-white/5">

                <th className="py-5">
                  Customer
                </th>

                <th className="py-5">
                  Product
                </th>

                <th className="py-5">
                  Amount
                </th>

                <th className="py-5">
                  Status
                </th>

                <th className="py-5">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.map(
                (order) => (

                  <tr
                    key={order._id}
                    className="
                    border-t border-white/10
                    hover:bg-white/5
                    transition-all duration-300
                    "
                  >

                    <td className="py-5 font-medium">
                      {order.customer}
                    </td>

                    <td className="py-5 text-gray-300">
                      {order.product}
                    </td>

                    <td className="py-5">
                      {order.amount}
                    </td>

                    <td className="py-5">

                      <span
                        className={`
                        px-3 py-1
                        rounded-full
                        text-sm
                        ${getStatusStyle(
                          order.status
                        )}
                        `}
                      >
                        {order.status}
                      </span>

                    </td>

                    <td className="py-5">

                      <div className="flex justify-center gap-4">

                        <button
                          onClick={() => {

                            setSelectedOrderId(
                              order._id
                            );

                            setDeleteModal(true);
                          }}
                          className="
                          p-2 rounded-xl
                          bg-red-500/20
                          hover:bg-red-500/40
                          transition-all
                          "
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Add Modal */}
        {showModal && (

          <div
            className="
            fixed inset-0
            bg-black/60
            flex items-center justify-center
            z-50
            "
          >

            <div
              className="
              bg-slate-900
              p-8 rounded-3xl
              w-[400px]
              border border-white/10
              shadow-2xl
              "
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-3xl font-bold">
                  Add Order
                </h2>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  <X />
                </button>

              </div>

              <div className="space-y-4">

                <input
                  type="text"
                  name="customer"
                  placeholder="Customer Name"
                  value={
                    formData.customer
                  }
                  onChange={
                    handleChange
                  }
                  className="
                  w-full
                  p-4 rounded-2xl
                  bg-white/10
                  outline-none
                  "
                />

                <input
                  type="text"
                  name="product"
                  placeholder="Product Name"
                  value={
                    formData.product
                  }
                  onChange={
                    handleChange
                  }
                  className="
                  w-full
                  p-4 rounded-2xl
                  bg-white/10
                  outline-none
                  "
                />

                <input
                  type="text"
                  name="amount"
                  placeholder="Amount"
                  value={
                    formData.amount
                  }
                  onChange={
                    handleChange
                  }
                  className="
                  w-full
                  p-4 rounded-2xl
                  bg-white/10
                  outline-none
                  "
                />

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  className="
                  w-full
                  p-4 rounded-2xl
                  bg-white/10
                  outline-none
                  "
                >

                  <option>
                    Pending
                  </option>

                  <option>
                    Delivered
                  </option>

                  <option>
                    Cancelled
                  </option>

                </select>

              </div>

              <button
                onClick={addOrder}
                className="
                mt-6
                w-full
                bg-gradient-to-r
                from-purple-500 to-indigo-500
                py-3 rounded-2xl
                hover:scale-105
                transition-all duration-300
                "
              >
                Save Order
              </button>

            </div>

          </div>
        )}

        {/* Delete Modal */}
        {
          deleteModal && (

            <div
              className="
              fixed inset-0
              bg-black/60
              flex items-center justify-center
              z-50
              "
            >

              <div
                className="
                bg-slate-900
                p-8 rounded-3xl
                w-[350px]
                border border-white/10
                shadow-2xl
                text-center
                "
              >

                <h2 className="text-2xl font-bold mb-4">
                  Delete Order?
                </h2>

                <p className="text-gray-400 mb-6">
                  This action cannot be undone.
                </p>

                <div className="flex gap-4">

                  <button
                    onClick={() =>
                      setDeleteModal(false)
                    }
                    className="
                    w-full
                    bg-gray-700
                    py-3 rounded-2xl
                    hover:bg-gray-600
                    transition-all
                    "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {

                      deleteOrder(
                        selectedOrderId
                      );

                      setDeleteModal(false);
                    }}
                    className="
                    w-full
                    bg-red-500
                    py-3 rounded-2xl
                    hover:bg-red-600
                    transition-all
                    "
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>
          )
        }

      </div>

    </Layout>
  );
}

export default Orders;
