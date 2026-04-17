"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    number: "",
    password: "",
    institute: "",
    email: "",
  });

  const institutes = [
    "Select Institute",
    "Institute 1",
    "Institute 2",
    "Institute 3",
  ];

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        await refreshUser();
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-5xl font-bold text-black mb-2 tracking-tighter">SignUp</h1>
            <p className="text-gray-500 text-sm font-medium">
              Join the Blackcurrent community today
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full name: Jone Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors"
                required
              />
            </div>

            {/* Phone Number Input */}
            <div>
              <input
                type="text"
                name="number"
                placeholder="Phone Number"
                value={formData.number}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Institute Dropdown */}
            <div>
              <select
                name="institute"
                value={formData.institute}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors bg-white appearance-none cursor-pointer"
                required
              >
                {institutes.map((institute) => (
                  <option key={institute} value={institute}>
                    {institute}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:border-green-400 placeholder-gray-400 text-gray-700 transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-100 mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>

          {/* Footer Text */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href={"/login"}
              className="text-green-400 hover:text-green-500 font-semibold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
