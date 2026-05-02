import { motion } from "framer-motion";

interface NavigationProps {
  activeSection: string;
}

export default function Navigation({ activeSection }: NavigationProps) {
  const links = [
    { id: "start", label: "START" },
    { id: "listen", label: "LISTEN" },
    { id: "read", label: "READ" },
    { id: "see", label: "SEE" },
    { id: "touch", label: "TOUCH" },
    { id: "sense", label: "SENSE" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6 text-xs md:text-sm font-sans tracking-[0.2em]">
      {links.map((link) => {
        const isActive = activeSection === link.id;
        return (
          <button
            key={link.id}
            onClick={() => scrollTo(link.id)}
            className={`group flex items-center gap-4 transition-all duration-700 ease-out hover:text-primary ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out">
              {link.label}
            </span>
            <span className={`w-px h-6 transition-colors duration-700 ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`}></span>
          </button>
        );
      })}
    </nav>
  );
}
