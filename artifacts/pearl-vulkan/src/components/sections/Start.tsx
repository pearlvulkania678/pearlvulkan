import { motion } from "framer-motion";

export default function Start() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="w-full flex flex-col items-start justify-center"
    >
      <h1 className="font-serif text-5xl md:text-8xl tracking-[0.1em] text-primary uppercase mb-12">
        Pearl<br/>Vulkan
      </h1>
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 1 }}
        className="max-w-xl"
      >
        <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed mb-6 font-serif italic">
          There are places in the dark where the sound settles, where dust catches the amber light, and the silence has a shape.
        </p>
        <p className="text-sm md:text-base text-muted-foreground tracking-wide font-sans font-light uppercase">
          Enter. Slowly.
        </p>
      </motion.div>
    </motion.div>
  );
}
