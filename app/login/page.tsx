"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
      } else {
        await refreshUser(); // Update context
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
        <div className="absolute top-10 right-10 w-64 h-64 bg-red-500 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-400 rounded-full opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-red-500 rounded-3xl mx-auto mb-8 shadow-xl shadow-red-200" />
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 font-medium">Continue your teacher journey with Blackcurrent</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500 rounded-full opacity-5 -mr-16 -mt-16"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-black mb-3 tracking-tighter">Login</h1>
            <p className="text-gray-500 font-medium tracking-tight"> Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white placeholder-gray-400 text-gray-900 transition-all font-medium"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white placeholder-gray-400 text-gray-900 transition-all font-medium pr-14"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-100 mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8 font-medium">
            Don't have an account?{" "}
            <Link
              href={"/signup"}
              className="text-red-500 hover:text-red-600 font-bold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
