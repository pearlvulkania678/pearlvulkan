import { motion } from "framer-motion";
import { useState } from "react";
import { useListTracks } from "@workspace/api-client-react";

export default function Listen() {
  const { data: tracks = [], isLoading } = useListTracks();
  const [filter, setFilter] = useState<string>("ALL MUSIC");

  const genres = ["ALL MUSIC", ...Array.from(new Set(tracks.map((t) => t.genre)))];
  const filteredTracks = filter === "ALL MUSIC" ? tracks : tracks.filter((t) => t.genre === filter);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Sound</p>
          <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase">Listen</h2>
        </div>
        <div className="flex flex-wrap gap-6 font-sans text-xs tracking-widest">
          {genres.map((g) => (
            <button
              key={g}
              data-testid={`filter-${g}`}
              onClick={() => setFilter(g)}
              className={`transition-colors duration-500 hover:text-primary ${
                filter === g ? "text-primary border-b border-primary pb-1" : "text-muted-foreground pb-1"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-8 items-start border-l border-primary/20 pl-8 animate-pulse">
              <div className="w-32 h-32 bg-muted shrink-0" />
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-6 bg-muted w-48 rounded" />
                <div className="h-3 bg-muted w-24 rounded" />
                <div className="h-3 bg-muted w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {filteredTracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1 }}
              data-testid={`track-${track.id}`}
              className="group flex flex-col md:flex-row gap-8 items-start border-l border-primary/20 pl-6 md:pl-8 hover:border-primary transition-colors duration-700"
            >
              <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 overflow-hidden bg-muted">
                {track.imagePath && (
                  <img
                    src={track.imagePath}
                    alt={track.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:mix-blend-normal"
                  />
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                  <h3 className="font-serif text-2xl text-foreground tracking-wide">{track.title}</h3>
                  <span className="font-sans text-xs text-muted-foreground tracking-widest">{track.duration}</span>
                </div>
                <div className="font-sans text-[10px] text-primary tracking-[0.2em] uppercase">{track.genre}</div>
                <p className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed max-w-2xl mt-2">
                  {track.description}
                </p>
                {track.hasListen && (
                  <button
                    data-testid={`listen-btn-${track.id}`}
                    className="mt-4 self-start text-xs font-sans tracking-[0.2em] text-primary border border-primary/30 px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase"
                  >
                    Listen
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
