import { ReactNode } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { StartBackground } from "@/components/sections/Start";

export default function PageShell({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative">
      <StartBackground />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
      <Navigation />
      <main className="pl-5 pr-8 md:pl-24 md:pr-48 max-w-7xl mx-auto pt-16 md:pt-20 pb-24">
        <motion.button
          onClick={() => navigate("/")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[9px] tracking-[0.25em] text-primary/40 hover:text-primary uppercase transition-colors duration-300 mb-12 md:mb-16 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span>Home</span>
        </motion.button>
        {children}
      </main>
    </div>
  );
}
