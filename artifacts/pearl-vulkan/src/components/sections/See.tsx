import { motion } from "framer-motion";
import { useListGallery, useListPoems } from "@workspace/api-client-react";

// ─── Poem rendering (formerly Read) ──────────────────────────────────────────
type PoemBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "video"; src: string; caption?: string };

function parsePoemContent(content: string): PoemBlock[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as PoemBlock[];
  } catch {}
  return [{ type: "text", value: content }];
}

function getVideoEmbed(src: string): { kind: "youtube" | "vimeo" | "file"; embedSrc: string } {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { kind: "youtube", embedSrc: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vm = src.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "vimeo", embedSrc: `https://player.vimeo.com/video/${vm[1]}?color=c9b77a&title=0&byline=0&portrait=0` };
  return { kind: "file", embedSrc: src };
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function See() {
  const { data: poems = [], isLoading: poemsLoading } = useListPoems();
  const { data: items = [], isLoading: galleryLoading } = useListGallery();

  return (
    <div className="w-full">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-24"
      >
        <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase mb-4">See</h2>
        <div className="w-12 h-px bg-primary/40"></div>
      </motion.div>

      {/* ── Poems ── */}
      {(poemsLoading || poems.length > 0) && (
        <div className="mb-40">
          {poemsLoading ? (
            <div className="flex flex-col gap-32 max-w-3xl mx-auto animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="h-4 bg-muted w-full rounded" />
                  <div className="h-4 bg-muted w-3/4 rounded" />
                  <div className="h-4 bg-muted w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-32 max-w-3xl mx-auto">
              {poems.map((poem, i) => {
                const blocks = parsePoemContent(poem.content);
                return (
                  <motion.div
                    key={poem.id}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                    data-testid={`poem-${poem.id}`}
                    className="flex flex-col gap-8"
                  >
                    {poem.title && (
                      <h3 className="font-serif text-lg text-foreground tracking-wider italic">{poem.title}</h3>
                    )}
                    <div className="flex flex-col gap-8">
                      {blocks.map((block, bi) => {
                        if (block.type === "text") {
                          return (
                            <div key={bi} className="font-serif text-lg md:text-xl text-foreground/90 leading-[2.5] whitespace-pre-wrap italic">
                              {block.value}
                            </div>
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
                              className="flex flex-col gap-3 my-4"
                            >
                              <img
                                src={block.src}
                                alt={block.caption ?? ""}
                                className="w-full object-cover opacity-80 hover:opacity-100 transition-all duration-700"
                                style={{ maxHeight: "480px", objectFit: "cover" }}
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
                              className="flex flex-col gap-3 my-4"
                            >
                              {kind === "file" ? (
                                <video src={embedSrc} controls className="w-full opacity-90" style={{ maxHeight: "480px" }} />
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
                    <div className="flex flex-wrap gap-4">
                      {poem.tags.map((tag) => (
                        <span key={tag} className="font-sans text-[9px] tracking-[0.3em] text-primary/70 border border-primary/20 px-3 py-1 rounded-sm uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Gallery ── */}
      {(galleryLoading || items.length > 0) && (
        <div>
          {galleryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
              {items.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: i * 0.2 }}
                  data-testid={`gallery-item-${img.id}`}
                  className={`flex flex-col gap-4 ${i % 2 !== 0 ? "md:mt-32" : ""}`}
                >
                  <div className="relative aspect-square overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-color" />
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                    />
                  </div>
                  <div className="font-sans text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                    {img.caption}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
