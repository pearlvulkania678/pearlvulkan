import { motion } from "framer-motion";
import { useListPoems } from "@workspace/api-client-react";
import PageShell from "@/components/PageShell";
import { BlockRenderer, parseBlocks } from "@/components/BlockRenderer";

export default function PoemDetail({ id }: { id: string }) {
  const { data: poems = [], isLoading } = useListPoems();
  const poem = poems.find(p => String(p.id) === id);

  if (isLoading) return (
    <PageShell>
      <div className="animate-pulse flex flex-col gap-8 max-w-2xl">
        <div className="h-8 bg-muted w-48 rounded" />
        <div className="flex flex-col gap-4">
          <div className="h-4 bg-muted w-full rounded" />
          <div className="h-4 bg-muted w-3/4 rounded" />
          <div className="h-4 bg-muted w-5/6 rounded" />
        </div>
      </div>
    </PageShell>
  );

  if (!poem) return (
    <PageShell>
      <p className="font-sans text-sm text-muted-foreground/60">Not found.</p>
    </PageShell>
  );

  const blocks = parseBlocks(poem.content);

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="max-w-2xl flex flex-col gap-12"
      >
        {poem.title && (
          <h1 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide italic">{poem.title}</h1>
        )}

        <BlockRenderer blocks={blocks} prose />

        {poem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-primary/10">
            {poem.tags.map(tag => (
              <span key={tag} className="font-sans text-[9px] tracking-[0.3em] text-primary/60 border border-primary/20 px-3 py-1 uppercase">
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
