import { motion } from "framer-motion";
import { useState } from "react";

export default function Touch() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className="relative cursor-crosshair"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="text-center max-w-md mx-auto p-12">
          <p className={`font-serif text-2xl transition-all duration-1000 ease-out ${hovered ? "text-primary tracking-[0.2em] blur-[1px]" : "text-foreground tracking-normal blur-0"}`}>
            Reach out.
          </p>
          <div className={`mt-8 h-px bg-primary mx-auto transition-all duration-1000 ${hovered ? "w-full opacity-100" : "w-0 opacity-0"}`}></div>
          <p className={`mt-8 font-sans text-xs uppercase tracking-widest transition-all duration-1000 ${hovered ? "opacity-100 text-muted-foreground" : "opacity-0"}`}>
            Some things dissolve when held.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
