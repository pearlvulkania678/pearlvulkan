import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL;

type ContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "video"; src: string; caption?: string };

function parseBlocks(content: string): ContentBlock[] {
  try {
    const p = JSON.parse(content);
    if (Array.isArray(p)) return p as ContentBlock[];
  } catch {}
  if (content && content !== "[]") return [{ type: "text", value: content }];
  return [];
}

function getVideoEmbed(src: string): { kind: "youtube" | "vimeo" | "file"; embedSrc: string } {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { kind: "youtube", embedSrc: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vm = src.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "vimeo", embedSrc: `https://player.vimeo.com/video/${vm[1]}?color=c9b77a&title=0&byline=0&portrait=0` };
  return { kind: "file", embedSrc: src };
}

interface TouchItem {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  imagePath: string | null;
  linkUrl: string | null;
  content: string;
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

function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, bi) => {
        if (block.type === "text") {
          return (
            <p key={bi} className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed whitespace-pre-wrap">
              {block.value}
            </p>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={bi} className="flex flex-col gap-2">
              <img
                src={block.src}
                alt={block.caption ?? ""}
                className="w-full object-cover opacity-80 hover:opacity-100 transition-all duration-700"
                style={{ maxHeight: "360px", objectFit: "cover" }}
              />
              {block.caption && (
                <figcaption className="font-sans text-[9px] tracking-[0.25em] text-primary/50 uppercase text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        if (block.type === "video") {
          const { kind, embedSrc } = getVideoEmbed(block.src);
          return (
            <figure key={bi} className="flex flex-col gap-2">
              {kind === "file" ? (
                <video src={embedSrc} controls className="w-full opacity-90" style={{ maxHeight: "360px" }} />
              ) : (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={embedSrc}
                    title={block.caption ?? "video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0 opacity-90"
                  />
                </div>
              )}
              {block.caption && (
                <figcaption className="font-sans text-[9px] tracking-[0.25em] text-primary/50 uppercase text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
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
          {items.map((item, i) => {
            const blocks = parseBlocks(item.content);
            const hasBlocks = blocks.length > 0;
            const firstImage = !hasBlocks && item.imagePath ? item.imagePath : null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1.2, delay: i * 0.15 }}
                className={`group flex flex-col gap-5 ${i % 2 !== 0 ? "md:mt-20" : ""}`}
              >
                {firstImage && (
                  <div className="relative overflow-hidden aspect-[4/3] bg-muted">
                    <img
                      src={firstImage}
                      alt={item.title}
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-all duration-1000 ease-out"
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

                  {hasBlocks ? (
                    <BlockRenderer blocks={blocks} />
                  ) : item.description ? (
                    <p className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed">
                      {item.description}
                    </p>
                  ) : null}

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
            );
          })}
        </div>
      )}
    </div>
  );
}
