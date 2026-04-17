"use client";

import React, { useState } from "react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-gray-100 to-gray-200 items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500 rounded-full opacity-80"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-green-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-32 right-32 w-72 h-72 bg-green-300 rounded-full opacity-50"></div>
        <div className="relative z-10">
          <p className="text-6xl font-light text-gray-400">Image</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative elements for smaller screens */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500 rounded-full opacity-20 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-green-400 rounded-full opacity-20 -ml-20 -mb-20"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-black mb-2">Login</h1>
            <p className="text-gray-600 text-sm">
              Welcome back to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-green-400 hover:text-green-500 text-sm font-semibold"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-3 rounded-lg transition-colors mt-8"
            >
              Login
            </button>
          </form>

          {/* Footer Text */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-green-400 hover:text-green-500 font-semibold"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
