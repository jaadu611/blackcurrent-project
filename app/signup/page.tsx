"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import RegistrationForm from "./components/RegistrationForm";
import { motion } from "motion/react";

export default function App() {
  return (
    <main className="flex h-dvh w-screen overflow-hidden bg-surface">
      {/* Left Pane - Immersive Illustration */}
      <section className="relative hidden w-3/5 lg:block h-full">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkeNHAfN_9eGaj6xA8Cs9nyqM8h4AlstbViq8nZBl0hKBVvR_OtD_RiSR4lZFyWJqtaGgKfBd2A01ZV_RHSE64yB_ACAncF8IGwSts3UaA2tST6pQ7Ho8MXFDpDkipMTy32AxBNJoV72ZN7rDn6A6pbpwV626FS2tAHYH672O87bmI-BDQhNubxNCqVtZ2QXjML_GXVi_c7zH_cGEuXQ33mhqSJT32YnhSXcM4Tz8_2B1wwP-2O_oyMlxk3SS-lSg8dxSLGGliGq8" 
          alt="Join Osamu" 
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
            Institutional Registry
          </div>
          <h1 className="mb-6 font-sans text-7xl font-semibold tracking-tight text-white leading-tight">
            Join the <span className="text-primary">Osamu</span> community
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
            Access a curated ecosystem of academic resources and institutional intelligence designed for the modern scholar.
          </p>
        </motion.div>

        <div className="absolute bottom-8 left-16 text-[11px] font-medium tracking-wide text-white/40">
          © {new Date().getFullYear()} Osamu Academic Grove. All rights reserved.
        </div>
      </section>

      {/* Right Pane - Registration Form */}
      <section className="flex flex-1 flex-col bg-surface p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col h-full max-h-screen"
        >
          <RegistrationForm />
        </motion.div>
      </section>
    </main>
  );
}
