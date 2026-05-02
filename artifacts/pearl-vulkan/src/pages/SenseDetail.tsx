import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageShell from "@/components/PageShell";
import { BlockRenderer, parseBlocks } from "@/components/BlockRenderer";

const BASE = import.meta.env.BASE_URL;

interface SenseItem {
  id: number; title: string; date: string | null; location: string | null;
  description: string | null; imagePath: string | null; linkUrl: string | null;
  content: string; published: boolean; sortOrder: number;
}

export default function SenseDetail({ id }: { id: string }) {
  const { data: items = [], isLoading } = useQuery<SenseItem[]>({
    queryKey: ["sense"],
    queryFn: () => fetch(`${BASE}api/sense`).then(r => r.json()),
    staleTime: 30_000,
  });
  const item = items.find(i => String(i.id) === id);

  if (isLoading) return (
    <PageShell>
      <div className="animate-pulse flex flex-col gap-8 max-w-3xl">
        <div className="w-full h-64 bg-muted" />
        <div className="h-8 bg-muted w-48 rounded" />
      </div>
    </PageShell>
  );

  if (!item) return (
    <PageShell>
      <p className="font-sans text-sm text-muted-foreground/60">Not found.</p>
    </PageShell>
  );

  const blocks = parseBlocks(item.content);

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="max-w-3xl flex flex-col gap-10"
      >
        {item.imagePath && (
          <div className="w-full overflow-hidden">
            <img src={item.imagePath} alt={item.title} className="w-full object-cover opacity-90" style={{ maxHeight: "520px" }} />
          </div>
        )}

        <div>
          {(item.date || item.location) && (
            <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">
              {[item.date, item.location].filter(Boolean).join(" · ")}
            </p>
          )}
          <h1 className="font-serif text-3xl md:text-5xl text-foreground tracking-wide">{item.title}</h1>
        </div>

        {item.description && (
          <p className="font-sans text-sm text-muted-foreground/70 font-light leading-relaxed">{item.description}</p>
        )}

        {blocks.length > 0 && <BlockRenderer blocks={blocks} prose={false} />}

        {item.linkUrl && (
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-xs font-sans tracking-[0.2em] border border-primary/30 text-primary/60 hover:text-primary hover:border-primary px-6 py-3 transition-all duration-500 uppercase"
          >
            View ↗
          </a>
        )}
      </motion.div>
    </PageShell>
  );
}
