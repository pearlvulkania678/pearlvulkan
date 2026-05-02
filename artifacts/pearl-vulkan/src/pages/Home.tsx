import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Start from "@/components/sections/Start";
import Listen from "@/components/sections/Listen";
import See from "@/components/sections/See";
import Touch from "@/components/sections/Touch";
import Sense from "@/components/sections/Sense";
import Navigation from "@/components/Navigation";

const sections = ["start", "listen", "see", "touch", "sense"];

export default function Home() {
  const [activeSection, setActiveSection] = useState("start");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.current?.observe(el);
    });

    return () => {
      observer.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      {/* Background atmospheric grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>

      <Navigation activeSection={activeSection} />

      <main className="pl-6 md:pl-24 pr-24 md:pr-48 max-w-7xl mx-auto flex flex-col">
        <section id="start" className="min-h-screen flex items-center pt-24 pb-24">
          <Start />
        </section>

        <div className="w-full h-px bg-primary/20 my-12" />

        <section id="listen" className="min-h-screen flex items-center pt-24 pb-24">
          <Listen />
        </section>

        <div className="w-full h-px bg-primary/20 my-12" />

        <section id="see" className="min-h-screen flex items-center pt-24 pb-24">
          <See />
        </section>

        <div className="w-full h-px bg-primary/20 my-12" />

        <section id="touch" className="min-h-screen flex items-center pt-24 pb-24">
          <Touch />
        </section>

        <div className="w-full h-px bg-primary/20 my-12" />

        <section id="sense" className="min-h-screen flex items-center pt-24 pb-24">
          <Sense />
        </section>
      </main>

      <footer className="py-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-2xl tracking-[0.2em] text-primary uppercase small-caps mb-4">Pearl Vulkan</h2>
        <p className="text-sm text-muted-foreground font-light tracking-wide">&copy; 2026 A mysterious, poetic digital universe.</p>
      </footer>
    </div>
  );
}
