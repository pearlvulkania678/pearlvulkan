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

interface SenseItem {
  id: number;
  title: string;
  date: string | null;
  location: string | null;
  description: string | null;
  imagePath: string | null;
  linkUrl: string | null;
  content: string;
  published: boolean;
  sortOrder: number;
}

function useSenseItems() {
  return useQuery<SenseItem[]>({
    queryKey: ["sense"],
    queryFn: () => fetch(`${BASE}api/sense`).then(r => r.json()),
    staleTime: 30_000,
  });
}

function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, bi) => {
        if (block.type === "text") {
          return (
            <p key={bi} className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed whitespace-pre-wrap max-w-2xl">
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
                style={{ maxHeight: "400px", objectFit: "cover" }}
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
                <video src={embedSrc} controls className="w-full opacity-90" style={{ maxHeight: "400px" }} />
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

export default function Sense() {
  const { data: items = [], isLoading } = useSenseItems();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-10 md:mb-24"
      >
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Experience</p>
        <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase mb-4">Sense</h2>
        <div className="w-12 h-px bg-primary/40" />
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-16 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-8 items-start">
              <div className="w-24 flex flex-col items-center gap-2 shrink-0">
                <div className="h-3 bg-muted w-16 rounded" />
                <div className="h-3 bg-muted w-12 rounded" />
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-5 bg-muted w-64 rounded" />
                <div className="h-3 bg-muted w-full rounded" />
                <div className="h-3 bg-muted w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-32 gap-8 text-center"
        >
          <p className="font-serif text-3xl md:text-5xl text-foreground/40 leading-relaxed italic">
            "It is not empty. It is merely waiting."
          </p>
          <div className="w-px h-16 bg-primary/20 mx-auto" />
          <p className="font-sans text-[9px] tracking-[0.3em] text-primary/30 uppercase">
            Breath in. Breath out. Leave.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => {
            const blocks = parseBlocks(item.content);
            const hasBlocks = blocks.length > 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                className="group flex flex-col md:flex-row gap-8 md:gap-12 py-16 border-t border-primary/10 first:border-t-0 hover:border-primary/20 transition-colors duration-700"
              >
                {/* Date + location column */}
                <div className="md:w-40 shrink-0 flex flex-col gap-1">
                  {item.date && (
                    <span className="font-sans text-[10px] tracking-[0.25em] text-primary/70 uppercase">
                      {item.date}
                    </span>
                  )}
                  {item.location && (
                    <span className="font-sans text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase">
                      {item.location}
                    </span>
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col gap-5">
                  <h3 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide leading-snug">
                    {item.title}
                  </h3>

                  {hasBlocks ? (
                    <BlockRenderer blocks={blocks} />
                  ) : item.description ? (
                    <p className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  ) : null}

                  {!hasBlocks && item.imagePath && (
                    <div className="md:w-56 shrink-0 overflow-hidden aspect-[3/2] bg-muted">
                      <img
                        src={item.imagePath}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-1000"
                      />
                    </div>
                  )}

                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-start font-sans text-[10px] tracking-[0.25em] text-primary/60 uppercase border-b border-primary/20 pb-0.5 hover:text-primary hover:border-primary transition-colors duration-500"
                    >
                      Learn more →
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
