import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useListPoems, useListGallery } from "@workspace/api-client-react";
import PageShell from "@/components/PageShell";

function firstText(content: string): string {
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      const b = blocks.find((x: { type: string }) => x.type === "text");
      if (b?.value) return b.value.slice(0, 120) + (b.value.length > 120 ? "…" : "");
    }
  } catch {}
  return content.slice(0, 120);
}

export default function SeePage() {
  const { data: poems = [], isLoading: poemsLoading } = useListPoems();
  const { data: gallery = [], isLoading: galleryLoading } = useListGallery();
  const [, navigate] = useLocation();

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-12 md:mb-20">
        <h1 className="font-serif text-5xl md:text-7xl tracking-[0.1em] text-foreground uppercase mb-4">See</h1>
        <div className="w-12 h-px bg-primary/40" />
      </motion.div>

      {(poemsLoading || poems.length > 0) && (
        <div className="mb-20 md:mb-32">
          {poemsLoading ? (
            <div className="flex flex-col animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-b border-primary/10 py-6 flex flex-col gap-2">
                  <div className="h-5 bg-muted w-48 rounded" />
                  <div className="h-3 bg-muted w-full rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {poems.map((poem, i) => (
                <motion.button
                  key={poem.id}
                  onClick={() => navigate(`/see/${poem.id}`)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.07 }}
                  className="group flex flex-col gap-2 border-b border-primary/10 py-6 text-left hover:border-primary/30 transition-colors duration-500 w-full"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-serif text-xl md:text-2xl text-foreground tracking-wide group-hover:text-primary transition-colors duration-500">
                      {poem.title ?? "Untitled"}
                    </h2>
                    <span className="text-primary/20 group-hover:text-primary/60 transition-colors duration-500 shrink-0">→</span>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground/40 font-light italic leading-relaxed">
                    {firstText(poem.content)}
                  </p>
                  {poem.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {poem.tags.map(tag => (
                        <span key={tag} className="font-sans text-[8px] tracking-widest text-primary/30 border border-primary/10 px-2 py-0.5 uppercase">{tag}</span>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {(galleryLoading || gallery.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {gallery.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={`flex flex-col gap-4 ${i % 2 !== 0 ? "md:mt-16" : ""}`}
            >
              <div className="relative aspect-square overflow-hidden group">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-color" />
                <img src={img.src} alt={img.caption} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-80 group-hover:opacity-100" />
              </div>
              <div className="font-sans text-[10px] tracking-[0.3em] text-muted-foreground uppercase">{img.caption}</div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
