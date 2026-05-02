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
    if (id === "start") navigate("/");
    else navigate(`/${id}`);
  };

  const isActive = (id: string) => {
    if (isHome) return activeSection === id || (id === "start" && !activeSection);
    if (id === "start") return location === "/";
    return location === `/${id}` || location.startsWith(`/${id}/`);
  };

  return (
    <nav
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[999] flex flex-col gap-5 pr-4 md:pr-10"
      style={{ pointerEvents: "auto" }}
    >
      {NAV_LINKS.map((link, i) => {
        const active = isActive(link.id);
        return (
          <motion.button
            key={link.id}
            onClick={() => handleClick(link.id)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <span
              className={`font-sans text-[9px] md:text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground/50 group-hover:text-muted-foreground/90"
              }`}
            >
              {link.label}
            </span>
            <span
              className={`block flex-shrink-0 transition-all duration-500 ${
                active
                  ? "w-[2px] h-8 bg-primary"
                  : "w-[1px] h-4 bg-muted-foreground/40 group-hover:h-6 group-hover:bg-muted-foreground/70"
              }`}
            />
          </motion.button>
        );
      })}
    </nav>
  );
}
