import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PageShell from "@/components/PageShell";

const BASE = import.meta.env.BASE_URL;

interface SenseItem {
  id: number; title: string; date: string | null; location: string | null;
  description: string | null; imagePath: string | null; linkUrl: string | null;
  content: string; published: boolean; sortOrder: number;
}

export default function SensePage() {
  const { data: items = [], isLoading } = useQuery<SenseItem[]>({
    queryKey: ["sense"],
    queryFn: () => fetch(`${BASE}api/sense`).then(r => r.json()),
    staleTime: 30_000,
  });
  const [, navigate] = useLocation();

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-12 md:mb-20">
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Experience</p>
        <h1 className="font-serif text-5xl md:text-7xl tracking-[0.1em] text-foreground uppercase mb-4">Sense</h1>
        <div className="w-12 h-px bg-primary/40" />
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-6 border-b border-primary/10 py-6">
              <div className="w-20 h-20 bg-muted shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-5 bg-muted w-48 rounded" />
                <div className="h-3 bg-muted w-32 rounded" />
                <div className="h-3 bg-muted w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="font-sans text-[10px] tracking-widest text-primary/20 uppercase">No items yet.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => navigate(`/sense/${item.id}`)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.07 }}
              className="group flex items-start gap-5 md:gap-8 border-b border-primary/10 py-6 text-left hover:border-primary/30 transition-colors duration-500 w-full"
            >
              {item.imagePath ? (
                <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden">
                  <img src={item.imagePath} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ) : (
                <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 border border-primary/10 group-hover:border-primary/20 transition-colors duration-500" />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-lg md:text-2xl text-foreground tracking-wide group-hover:text-primary transition-colors duration-500">{item.title}</h2>
                {(item.date || item.location) && (
                  <p className="font-sans text-[9px] tracking-[0.2em] text-primary/40 uppercase mt-1">
                    {[item.date, item.location].filter(Boolean).join(" · ")}
                  </p>
                )}
                {item.description && (
                  <p className="font-sans text-xs text-muted-foreground/40 font-light leading-relaxed mt-2 line-clamp-2">{item.description}</p>
                )}
              </div>
              <span className="text-primary/20 group-hover:text-primary/60 transition-colors duration-500 text-sm shrink-0 mt-1">→</span>
            </motion.button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
