import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useListTracks } from "@workspace/api-client-react";
import PageShell from "@/components/PageShell";

export default function ListenPage() {
  const { data: tracks = [], isLoading } = useListTracks();
  const [, navigate] = useLocation();

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-12 md:mb-20">
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Sound</p>
        <h1 className="font-serif text-5xl md:text-7xl tracking-[0.1em] text-foreground uppercase mb-4">Listen</h1>
        <div className="w-12 h-px bg-primary/40" />
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-6 border-b border-primary/10 py-6">
              <div className="w-16 h-16 bg-muted shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-5 bg-muted w-48 rounded" />
                <div className="h-3 bg-muted w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <p className="font-sans text-[10px] tracking-widest text-primary/20 uppercase">No tracks yet.</p>
      ) : (
        <div className="flex flex-col">
          {tracks.map((track, i) => (
            <motion.button
              key={track.id}
              onClick={() => navigate(`/listen/${track.id}`)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.07 }}
              className="group flex items-center gap-5 md:gap-6 border-b border-primary/10 py-5 md:py-6 text-left hover:border-primary/30 transition-colors duration-500 w-full"
            >
              <div className="shrink-0 w-14 h-14 md:w-18 md:h-18 overflow-hidden bg-muted/20">
                {track.imagePath && (
                  <img src={track.imagePath} alt={track.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-lg md:text-2xl text-foreground tracking-wide group-hover:text-primary transition-colors duration-500 truncate">
                  {track.title}
                </h2>
                <p className="font-sans text-[9px] tracking-[0.2em] text-primary/40 uppercase mt-1">{track.genre}</p>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                <span className="hidden md:block font-sans text-xs text-muted-foreground/30 tracking-widest">{track.duration}</span>
                <span className="text-primary/20 group-hover:text-primary/70 transition-colors duration-500 text-sm">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
