import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL;

interface StartSettings {
  artistName: string;
  quote: string;
  tagline: string;
  backgroundImage: string | null;
}

const DEFAULTS: StartSettings = {
  artistName: "Pearl Vulkan",
  quote: "There are places in the dark where the sound settles, where dust catches the amber light, and the silence has a shape.",
  tagline: "Enter. Slowly.",
  backgroundImage: null,
};

function useStartSettings() {
  return useQuery<StartSettings>({
    queryKey: ["start"],
    queryFn: () => fetch(`${BASE}api/start`).then(r => r.json()),
    staleTime: 60_000,
    placeholderData: DEFAULTS,
  });
}

export default function Start() {
  const { data } = useStartSettings();
  const s = data ?? DEFAULTS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="w-full flex flex-col items-start justify-center relative"
    >
      {s.backgroundImage && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <img
            src={s.backgroundImage}
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
      )}

      <h1 className="font-serif text-5xl md:text-8xl tracking-[0.1em] text-primary uppercase mb-12">
        {s.artistName.split(" ").map((word, i) => (
          <span key={i}>{word}{i < s.artistName.split(" ").length - 1 ? <br /> : ""}</span>
        ))}
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 1 }}
        className="max-w-xl"
      >
        {s.quote && (
          <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed mb-6 font-serif italic">
            {s.quote}
          </p>
        )}
        {s.tagline && (
          <p className="text-sm md:text-base text-muted-foreground tracking-wide font-sans font-light uppercase">
            {s.tagline}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
