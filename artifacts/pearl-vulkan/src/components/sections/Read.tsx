import { motion } from "framer-motion";
import { useListPoems } from "@workspace/api-client-react";

export default function Read() {
  const { data: poems = [], isLoading } = useListPoems();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-24"
      >
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Text</p>
        <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase mb-4">Read</h2>
        <div className="w-12 h-px bg-primary/40"></div>
      </motion.div>

      {isLoading ? (
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
          {poems.map((poem, i) => (
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
              <div className="font-serif text-lg md:text-xl text-foreground/90 leading-[2.5] whitespace-pre-wrap italic">
                {poem.content}
              </div>
              <div className="flex flex-wrap gap-4">
                {poem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-[9px] tracking-[0.3em] text-primary/70 border border-primary/20 px-3 py-1 rounded-sm uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
