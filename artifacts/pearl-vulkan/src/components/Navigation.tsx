import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface NavigationProps {
  activeSection: string;
}

const links = [
  { id: "start",  label: "Start"  },
  { id: "listen", label: "Listen" },
  { id: "see",    label: "See"    },
  { id: "touch",  label: "Touch"  },
  { id: "sense",  label: "Sense"  },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Navigation({ activeSection }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ── Desktop: right-side vertical nav ── */}
      <nav className="hidden md:flex fixed right-10 top-1/2 -translate-y-1/2 z-40 flex-col gap-4">
        {links.map((link, i) => {
          const isActive = activeSection === link.id;
          return (
            <motion.button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="flex items-center gap-3 group"
            >
              <span className={`font-sans text-[9px] tracking-[0.25em] uppercase transition-colors duration-500 ${isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/80"}`}>
                {link.label.toUpperCase()}
              </span>
              <span className={`block w-px flex-shrink-0 transition-all duration-500 ${isActive ? "h-8 bg-primary" : "h-3 bg-muted-foreground/25 group-hover:h-5 group-hover:bg-muted-foreground/50"}`} />
            </motion.button>
          );
        })}
      </nav>

      {/* ── Mobile: hamburger button ── */}
      <button
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
        className="md:hidden fixed top-5 right-5 z-50 flex flex-col justify-center items-center gap-[5px] w-10 h-10"
      >
        <motion.span
          animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className="block w-6 h-px bg-primary origin-center"
        />
        <motion.span
          animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.2 }}
          className="block w-6 h-px bg-primary origin-center"
        />
        <motion.span
          animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          className="block w-6 h-px bg-primary origin-center"
        />
      </button>

      {/* ── Mobile: full-screen overlay menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="md:hidden fixed inset-0 z-40 bg-[#111010]/95 backdrop-blur-sm flex flex-col items-start justify-center px-10"
            onClick={() => setMenuOpen(false)}
          >
            <nav className="flex flex-col gap-8">
              {links.map((link, i) => {
                const isActive = activeSection === link.id;
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollTo(link.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-5 group text-left"
                  >
                    <span className={`block w-px transition-all duration-500 ${isActive ? "h-10 bg-primary" : "h-4 bg-primary/25 group-hover:h-7 group-hover:bg-primary/60"}`} />
                    <span className={`font-serif text-3xl tracking-[0.15em] uppercase transition-colors duration-300 ${isActive ? "text-primary" : "text-foreground/40 group-hover:text-foreground/80"}`}>
                      {link.label}
                    </span>
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
