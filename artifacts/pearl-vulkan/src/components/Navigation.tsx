import { motion } from "framer-motion";

interface NavigationProps {
  activeSection: string;
}

export default function Navigation({ activeSection }: NavigationProps) {
  const links = [
    { id: "start",  label: "START"  },
    { id: "listen", label: "LISTEN" },
    { id: "read",   label: "READ"   },
    { id: "see",    label: "SEE"    },
    { id: "touch",  label: "TOUCH"  },
    { id: "sense",  label: "SENSE"  },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
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
            <span
              className={`font-sans text-[9px] tracking-[0.25em] uppercase transition-colors duration-500 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/40 group-hover:text-muted-foreground/80"
              }`}
            >
              {link.label}
            </span>
            <span
              className={`block w-px flex-shrink-0 transition-all duration-500 ${
                isActive
                  ? "h-8 bg-primary"
                  : "h-3 bg-muted-foreground/25 group-hover:h-5 group-hover:bg-muted-foreground/50"
              }`}
            />
          </motion.button>
        );
      })}
    </nav>
  );
}
