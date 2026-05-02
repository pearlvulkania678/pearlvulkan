import { motion } from "framer-motion";

export type ContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "video"; src: string; caption?: string };

export function parseBlocks(content: string): ContentBlock[] {
  try {
    const p = JSON.parse(content);
    if (Array.isArray(p)) return p as ContentBlock[];
  } catch {}
  if (content && content !== "[]") return [{ type: "text", value: content }];
  return [];
}

function getVideoEmbed(src: string) {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { kind: "youtube" as const, embedSrc: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vm = src.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "vimeo" as const, embedSrc: `https://player.vimeo.com/video/${vm[1]}?color=c9b77a&title=0&byline=0&portrait=0` };
  return { kind: "file" as const, embedSrc: src };
}

export function BlockRenderer({ blocks, prose = true }: { blocks: ContentBlock[]; prose?: boolean }) {
  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, bi) => {
        if (block.type === "text") {
          return prose ? (
            <div key={bi} className="font-serif text-lg md:text-xl text-foreground/90 leading-[2.5] whitespace-pre-wrap italic">
              {block.value}
            </div>
          ) : (
            <p key={bi} className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed whitespace-pre-wrap">
              {block.value}
            </p>
          );
        }
        if (block.type === "image") {
          return (
            <motion.figure
              key={bi}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="flex flex-col gap-3"
            >
              <img
                src={block.src}
                alt={block.caption ?? ""}
                className="w-full object-cover opacity-80 hover:opacity-100 transition-all duration-700"
                style={{ maxHeight: "560px", objectFit: "cover" }}
              />
              {block.caption && (
                <figcaption className="font-sans text-[9px] tracking-[0.25em] text-primary/50 uppercase text-center">
                  {block.caption}
                </figcaption>
              )}
            </motion.figure>
          );
        }
        if (block.type === "video") {
          const { kind, embedSrc } = getVideoEmbed(block.src);
          return (
            <motion.figure
              key={bi}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="flex flex-col gap-3"
            >
              {kind === "file" ? (
                <video src={embedSrc} controls className="w-full opacity-90" style={{ maxHeight: "560px" }} />
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
            </motion.figure>
          );
        }
        return null;
      })}
    </div>
  );
}
