import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL;

interface TouchItem {
  id: number;
  title: string;
  subtitle: string | null;
  description: string;
  imagePath: string | null;
  linkUrl: string | null;
  published: boolean;
  sortOrder: number;
}

function useTouchItems() {
  return useQuery<TouchItem[]>({
    queryKey: ["touch"],
    queryFn: () => fetch(`${BASE}api/touch`).then(r => r.json()),
    staleTime: 30_000,
  });
}

export default function Touch() {
  const { data: items = [], isLoading } = useTouchItems();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-24"
      >
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Material</p>
        <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase mb-4">Touch</h2>
        <div className="w-12 h-px bg-primary/40" />
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[4/3] bg-muted" />
              <div className="h-4 bg-muted w-48 rounded" />
              <div className="h-3 bg-muted w-full rounded" />
              <div className="h-3 bg-muted w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="flex flex-col items-center justify-center py-32 gap-6"
        >
          <div className="w-px h-24 bg-primary/20 mx-auto" />
          <p className="font-serif text-xl text-foreground/40 italic text-center">
            Some things dissolve when held.
          </p>
          <p className="font-sans text-[9px] tracking-[0.3em] text-primary/30 uppercase text-center">
            Content coming soon
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.2, delay: i * 0.15 }}
              className={`group flex flex-col gap-5 ${i % 2 !== 0 ? "md:mt-20" : ""}`}
            >
              {item.imagePath && (
                <div className="relative overflow-hidden aspect-[4/3] bg-muted">
                  <img
                    src={item.imagePath}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 scale-105 group-hover:scale-100 transition-all duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-color" />
                </div>
              )}

              <div className="flex flex-col gap-3 border-l border-primary/20 pl-5 group-hover:border-primary transition-colors duration-700">
                <div>
                  <h3 className="font-serif text-2xl text-foreground tracking-wide">{item.title}</h3>
                  {item.subtitle && (
                    <p className="font-sans text-[10px] tracking-[0.25em] text-primary/60 uppercase mt-1">{item.subtitle}</p>
                  )}
                </div>
                <p className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed">
                  {item.description}
                </p>
                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start font-sans text-[10px] tracking-[0.25em] text-primary/60 uppercase border-b border-primary/20 pb-0.5 hover:text-primary hover:border-primary transition-colors duration-500 mt-1"
                  >
                    Acquire →
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
