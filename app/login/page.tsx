"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  Fingerprint
} from "lucide-react";

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
    <main className="flex h-dvh w-screen overflow-hidden bg-surface">
      {/* Left Pane - Immersive Illustration */}
      <section className="relative hidden w-3/5 lg:block h-full">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3-BTaE0xtTlYUYgZmdcTNRjf5gPK2ulzbqMmUokiKhLarRWL36Tb9TNdWVyI9aVowoFcGdOmgUqhSAFHvVl394k8QFugnZM8NT7W1k14y6U6S5rFnAWrsNeHUIJu_jmisZwubkDpjOkPVhZIqW57rtuSTMRlNkSH3wS7568nez8tmbuAa1rjAIx9YmwwX8-x-TOtnMdHdlMHzrg5bYdjG7INVIYoQdRpSYpWAwTRK3E4TrbBpo36AloZrhcVZEv6vI3-DT8cxwvs" 
          alt="Welcome to Osamu" 
          className="absolute inset-0 h-full w-full object-cover brightness-75 transition-all duration-700 hover:brightness-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent opacity-80" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-16 left-16 max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center rounded-sm bg-primary-brand px-3 py-1 text-[10px] font-bold tracking-widest text-surface uppercase">
            Institutional Access
          </div>
          <h1 className="mb-6 font-sans text-7xl font-semibold tracking-tight text-white">
            Welcome to Osamu
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
            Step back into the Digital Atheneum. Your curated path to academic excellence and growth begins here.
          </p>
        </motion.div>

        <div className="absolute bottom-8 left-16 text-[11px] font-medium tracking-wide text-white/40">
          © {new Date().getFullYear()} Osamu Academic Grove. All rights reserved.
        </div>
      </section>

      {/* Right Pane - Authentication Form */}
      <section className="flex flex-1 flex-col bg-surface p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col h-full max-h-screen"
        >
          {/* Header/Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-brand">
              <BookOpen className="h-5 w-5 text-surface" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-brand">Osamu</span>
          </div>

          <div className="mx-auto w-full max-w-sm space-y-8 flex-1 flex flex-col justify-center">
            <div>
              <h2 className="mb-1 text-3xl font-semibold tracking-tight text-on-surface">Sign In</h2>
              <p className="text-sm text-on-surface-variant">Continue your journey in the Academic Grove.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    type="email"
                    name="email"
                    placeholder="Institutional Email"
                    className="w-full bg-surface-highest rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="Security Code"
                    className="w-full bg-surface-highest rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all pr-12"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface">
                  <input type="checkbox" className="h-4 w-4 rounded border-0 bg-surface-highest text-primary focus:ring-0 focus:ring-offset-0" />
                  <span>Remember access</span>
                </label>
                <a href="#" className="text-sm font-medium text-tertiary hover:brightness-110">
                  Forgot credentials?
                </a>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="bg-linear-to-br from-primary-container to-primary text-[#003915] font-semibold transition-all hover:brightness-110 hover:underline active:scale-[0.98] group flex w-full items-center justify-center gap-2 rounded-lg py-3 text-base disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Enter The Grove"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="grow border-t border-on-surface/5"></div>
              <span className="mx-4 shrink text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">Or access with</span>
              <div className="grow border-t border-on-surface/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-surface-container-high py-3 text-xs font-semibold text-on-surface transition-all hover:bg-surface-container-highest">
                <GraduationCap size={16} className="text-on-surface-variant" />
                Google Workspace
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-surface-container-high py-3 text-xs font-semibold text-on-surface transition-all hover:bg-surface-container-highest">
                <Fingerprint size={16} className="text-on-surface-variant" />
                SSO
              </button>
            </div>

            <p className="text-center text-sm text-on-surface-variant py-2">
              New to Osamu?{' '}
              <Link href="/signup" className="font-bold text-primary-brand hover:brightness-110 hover:underline">
                Join our Registry
              </Link>
            </p>
          </div>

          {/* Footer links */}
          <div className="mt-auto flex justify-center gap-6 pt-4 text-[10px] font-medium text-on-surface-variant/40">
            <a href="#" className="hover:text-on-surface-variant transition-colors hover:underline">Privacy Policy</a>
            <a href="#" className="hover:text-on-surface-variant transition-colors hover:underline">Terms of Service</a>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default LoginPage;
