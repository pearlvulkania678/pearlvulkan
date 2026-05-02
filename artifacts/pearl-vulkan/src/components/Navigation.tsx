import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface NavigationProps {
  activeSection?: string;
}

const NAV_LINKS = [
  { id: "start",  label: "Start"  },
  { id: "listen", label: "Listen" },
  { id: "see",    label: "See"    },
  { id: "touch",  label: "Touch"  },
  { id: "sense",  label: "Sense"  },
];

export default function Navigation({ activeSection }: NavigationProps) {
  const [location, navigate] = useLocation();
  const isHome = location === "/" || location === "";

  const handleClick = (id: string) => {
    if (isHome) {
      if (id === "start") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      if (id === "start") navigate("/");
      else navigate(`/${id}`);
    }
  };

  const isActive = (id: string) => {
    if (isHome) return activeSection === id || (id === "start" && !activeSection);
    if (id === "start") return location === "/";
    return location === `/${id}` || location.startsWith(`/${id}/`);
  };

  return (
    <nav className="fixed right-3 md:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
      {NAV_LINKS.map((link, i) => {
        const active = isActive(link.id);
        return (
          <motion.button
            key={link.id}
            onClick={() => handleClick(link.id)}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <span className={`hidden md:block font-sans text-[9px] tracking-[0.25em] uppercase transition-colors duration-500 ${active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/80"}`}>
              {link.label.toUpperCase()}
            </span>
            <span className={`block w-px flex-shrink-0 transition-all duration-500 ${active ? "h-8 bg-primary" : "h-3 bg-muted-foreground/25 group-hover:h-5 group-hover:bg-muted-foreground/50"}`} />
          </motion.button>
        );
      })}
    </nav>
  );
}
