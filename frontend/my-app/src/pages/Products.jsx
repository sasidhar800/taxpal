import React from "react";
import Layout from "../components/Layout";

function Products() {
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
              Products Management 🛍️
            </h1>

            <p className="text-gray-400 mt-2">
              Manage all products easily
            </p>

          </div>

          <button
            className="
            bg-gradient-to-r
            from-purple-500 to-indigo-500
            px-5 py-3
            rounded-2xl
            hover:scale-105
            transition-all duration-300
            "
          >
            Add Product
          </button>

        </div>

        {/* Product Cards */}
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
          "
        >

          {/* Card */}
          <div
            className="
            bg-slate-900
            p-6
            rounded-3xl
            border border-white/10
            hover:scale-105
            transition-all duration-300
            "
          >

            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
              alt="product"
              className="
              w-full
              h-52
              object-cover
              rounded-2xl
              "
            />

            <h2 className="text-2xl font-bold mt-4">
              Nike Shoes
            </h2>

            <p className="text-gray-400 mt-2">
              Premium quality running shoes.
            </p>

            <div className="flex justify-between items-center mt-5">

              <span className="text-2xl font-bold text-green-400">
                ₹4999
              </span>

              <button
                className="
                bg-purple-500
                px-4 py-2
                rounded-xl
                hover:bg-purple-600
                "
              >
                Edit
              </button>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Products;