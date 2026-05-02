import { motion } from "framer-motion";

export default function Sense() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-32">
      <motion.div 
        initial={{ opacity: 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <p className="font-serif text-3xl md:text-5xl text-foreground leading-relaxed italic mb-12">
          "It is not empty. It is merely waiting."
        </p>
        
        <div className="w-px h-24 bg-primary/30 mx-auto mb-12"></div>
        
        <p className="font-sans text-xs tracking-[0.3em] text-primary uppercase">
          Breath in. Breath out. Leave.
        </p>
      </motion.div>
    </div>
  );
}
