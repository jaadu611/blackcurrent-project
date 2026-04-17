"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import Link from 'next/link';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    number: "",
    password: "",
    institute: "",
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
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
        body: JSON.stringify({
           fullName: formData.fullName,
           number: formData.number,
           password: formData.password,
           institute: formData.institute,
           email: formData.email
        }),
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
    <>
      {/* Header/Logo - Matches Login with mb-12 */}
      <div className="mb-12 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="h-5 w-5 text-surface" />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">Osamu</span>
      </div>

      {/* Main Centered content area - spread out with space-y-10 */}
      <div className="mx-auto w-full max-w-md space-y-10 flex-1 flex flex-col justify-center">
        <header>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight text-on-surface mb-1"
          >
            Create account
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-on-surface-variant"
          >
            Already have an account? <Link className="text-primary font-bold hover:underline" href="/login">Sign In</Link>
          </motion.p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            {/* Full Name */}
            <div className="relative group">
              <input 
                id="fullName" 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-surface-highest rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                required 
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Email Address */}
            <div className="relative group">
              <input 
                id="email" 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-surface-highest rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <input 
                id="number" 
                type="tel" 
                placeholder="Phone Number" 
                className="w-full bg-surface-highest rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                required 
                value={formData.number}
                onChange={handleChange}
              />
            </div>

            {/* Institute Name */}
            <div className="relative group">
              <input 
                id="institute" 
                type="text" 
                placeholder="Institute Name" 
                className="w-full bg-surface-highest rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                required 
                value={formData.institute}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="relative md:col-span-2 group">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Security Code" 
                className="w-full bg-surface-highest rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all pr-12 font-medium"
                required 
                value={formData.password}
                onChange={handleChange}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
            <div className="flex items-center h-5">
              <input 
                id="terms" 
                type="checkbox" 
                className="w-4 h-4 rounded-sm bg-surface-highest border-0 text-primary focus:ring-0 accent-primary"
                required
              />
            </div>
            <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
              I agree to the <a className="text-primary hover:underline" href="#">Terms</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </label>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-4"
          >
            <button 
              type="submit"
              disabled={loading}
              className="bg-linear-to-br from-primary-container to-primary text-[#003915] font-semibold transition-all hover:brightness-110 hover:underline active:scale-[0.98] group flex w-full items-center justify-center gap-2 rounded-lg py-4 text-base disabled:opacity-50"
            >
              {loading ? "Registering..." : "Complete Registration"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </form>
      </div>

      {/* Footer sticks to the bottom */}
      <footer className="mt-auto flex justify-center gap-6 pt-8 text-[10px] font-medium text-on-surface-variant/40">
        <a href="#" className="hover:text-on-surface-variant transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-on-surface-variant transition-colors">Terms of Service</a>
      </footer>
    </>
  );
}
