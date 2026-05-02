import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PageShell from "@/components/PageShell";

const BASE = import.meta.env.BASE_URL;

interface TouchItem {
  id: number; title: string; subtitle: string | null; description: string | null;
  imagePath: string | null; linkUrl: string | null; content: string; published: boolean; sortOrder: number;
}

export default function TouchPage() {
  const { data: items = [], isLoading } = useQuery<TouchItem[]>({
    queryKey: ["touch"],
    queryFn: () => fetch(`${BASE}api/touch`).then(r => r.json()),
    staleTime: 30_000,
  });
  const [, navigate] = useLocation();

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-12 md:mb-20">
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Material</p>
        <h1 className="font-serif text-5xl md:text-7xl tracking-[0.1em] text-foreground uppercase mb-4">Touch</h1>
        <div className="w-12 h-px bg-primary/40" />
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[4/3] bg-muted" />
              <div className="h-5 bg-muted w-40 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="font-sans text-[10px] tracking-widest text-primary/20 uppercase">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => navigate(`/touch/${item.id}`)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.09 }}
              className="group flex flex-col gap-4 text-left w-full"
            >
              {item.imagePath ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-color" />
                  <img src={item.imagePath} alt={item.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-75 group-hover:opacity-100" />
                </div>
              ) : (
                <div className="aspect-[4/3] border border-primary/10 group-hover:border-primary/30 transition-colors duration-500 flex items-center justify-center">
                  <span className="font-sans text-[9px] tracking-widest text-primary/20 uppercase">No image</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl text-foreground tracking-wide group-hover:text-primary transition-colors duration-500">{item.title}</h2>
                  {item.subtitle && <p className="font-sans text-[9px] tracking-[0.2em] text-primary/40 uppercase mt-1">{item.subtitle}</p>}
                </div>
                <span className="text-primary/20 group-hover:text-primary/60 transition-colors duration-500 text-sm shrink-0">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
