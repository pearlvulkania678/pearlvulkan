import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL;

interface StartSettings {
  artistName: string;
  quote: string;
  tagline: string;
  backgroundImage: string | null;
  bgOpacity: number;
}

const DEFAULTS: StartSettings = {
  artistName: "Pearl Vulkan",
  quote: "There are places in the dark where the sound settles, where dust catches the amber light, and the silence has a shape.",
  tagline: "Enter. Slowly.",
  backgroundImage: null,
  bgOpacity: 15,
};

function useStartSettings() {
  return useQuery<StartSettings>({
    queryKey: ["start"],
    queryFn: () => fetch(`${BASE}api/start`).then(r => r.json()),
    staleTime: 60_000,
    placeholderData: DEFAULTS,
  });
}

export function StartBackground() {
  const { data } = useStartSettings();
  const s = data ?? DEFAULTS;
  if (!s.backgroundImage) return null;

  return (
    /* Image covers only the top 45vh of the section, fading out downward */
    <div
      className="absolute inset-x-0 top-0 pointer-events-none"
      style={{ height: "45vh" }}
    >
      <img
        src={s.backgroundImage}
        alt=""
        className="w-full h-full object-cover object-top"
        style={{ opacity: (s.bgOpacity ?? 15) / 100 }}
      />
      {/* Fade the bottom of the image into the page background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 20%, hsl(0,0%,10%) 100%)",
        }}
      />
    </div>
  );
}

export default function Start() {
  const { data } = useStartSettings();
  const s = data ?? DEFAULTS;

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      className="w-full flex flex-col items-start justify-center"
    >
      <h1 className="font-serif text-5xl md:text-8xl tracking-[0.1em] text-primary uppercase mb-12">
        {s.artistName.split(" ").map((word, i, arr) => (
          <span key={i}>{word}{i < arr.length - 1 ? <br /> : ""}</span>
        ))}
      </h1>

      <div className="max-w-xl">
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
      </div>
    </motion.div>
  );
}
