import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4 }}
          aria-label="Scroll to top"
          className="fixed bottom-7 left-6 z-40 flex flex-col items-center gap-1.5 group"
        >
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="block text-primary/50 group-hover:text-primary transition-colors duration-500 text-lg leading-none"
          >
            ↑
          </motion.span>
          <span className="font-sans text-[7px] tracking-[0.3em] uppercase text-primary/30 group-hover:text-primary/70 transition-colors duration-500">
            Top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("start");
  const { data: links = [] } = useSocialLinks();

  useEffect(() => {
    const handleScroll = () => {
      const trigger = window.scrollY + window.innerHeight * 0.35;
      let current = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= trigger) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-x-hidden">
      {/* Background atmospheric grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>

      <Navigation activeSection={activeSection} />
      <ScrollToTop />

      <main className="relative z-[1] pl-5 pr-8 md:pl-24 md:pr-48 max-w-7xl mx-auto flex flex-col">
        <section id="start" className="relative min-h-screen flex items-center py-20 md:py-24">
          <StartBackground />
          <Start />
        </section>

        <div className="w-full h-px bg-primary/20 my-8 md:my-12" />

        <section id="listen" className="min-h-screen flex items-center py-16 md:py-24">
          <Listen />
        </section>

        <div className="w-full h-px bg-primary/20 my-8 md:my-12" />

        <section id="see" className="min-h-screen flex items-center py-16 md:py-24">
          <See />
        </section>

        <div className="w-full h-px bg-primary/20 my-8 md:my-12" />

        <section id="touch" className="min-h-screen flex items-center py-16 md:py-24">
          <Touch />
        </section>

        <div className="w-full h-px bg-primary/20 my-8 md:my-12" />

        <section id="sense" className="min-h-screen flex items-center py-16 md:py-24">
          <Sense />
        </section>
      </main>

      <footer className="relative z-[1] mt-24 border-t border-primary/10">
        <div className="pl-5 pr-8 md:pl-24 md:pr-48 max-w-7xl mx-auto py-12 md:py-16 flex flex-col gap-10 md:gap-12">

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
