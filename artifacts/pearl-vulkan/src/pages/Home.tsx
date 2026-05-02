import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Start, { StartBackground } from "@/components/sections/Start";
import Listen from "@/components/sections/Listen";
import See from "@/components/sections/See";
import Touch from "@/components/sections/Touch";
import Sense from "@/components/sections/Sense";
import Navigation from "@/components/Navigation";

const BASE = import.meta.env.BASE_URL;
const sections = ["start", "listen", "see", "touch", "sense"];

interface SocialLink { id: number; label: string; url: string; sortOrder: number; published: boolean; }

function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ["social-links"],
    queryFn: () => fetch(`${BASE}api/social-links`).then(r => r.json()),
    staleTime: 60_000,
  });
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("start");
  const observer = useRef<IntersectionObserver | null>(null);
  const { data: links = [] } = useSocialLinks();

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
      {/* Persistent background image */}
      <StartBackground />
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

      <footer className="mt-24 border-t border-primary/10">
        <div className="pl-6 md:pl-24 pr-24 md:pr-48 max-w-7xl mx-auto py-16 flex flex-col gap-12">

          {/* Artist name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <h2 className="font-serif text-3xl md:text-5xl tracking-[0.15em] text-primary uppercase leading-tight">
              Pearl<br />Vulkan
            </h2>
          </motion.div>

          {/* Links row */}
          {links.length > 0 && (
            <motion.nav
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex flex-wrap gap-x-8 gap-y-3"
            >
              {links.map((link, i) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2"
                >
                  <span className="font-sans text-[10px] tracking-[0.3em] text-primary/50 uppercase group-hover:text-primary transition-colors duration-500">
                    {link.label}
                  </span>
                  {i < links.length - 1 && (
                    <span className="text-primary/15 text-[10px] select-none pl-8">·</span>
                  )}
                </a>
              ))}
            </motion.nav>
          )}

          {/* Bottom line */}
          <div className="flex items-center justify-between border-t border-primary/10 pt-6">
            <p className="font-sans text-[9px] tracking-[0.25em] text-muted-foreground/40 uppercase">
              &copy; {new Date().getFullYear()} Pearl Vulkan
            </p>
            <p className="font-sans text-[9px] tracking-[0.25em] text-muted-foreground/20 uppercase">
              A mysterious, poetic digital universe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
