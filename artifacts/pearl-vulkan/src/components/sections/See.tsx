import { motion } from "framer-motion";
import { useListGallery } from "@workspace/api-client-react";

export default function See() {
  const { data: items = [], isLoading } = useListGallery();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-20"
      >
        <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Visual</p>
        <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase mb-4 text-right">See</h2>
        <div className="w-full h-px bg-primary/10"></div>
      </motion.div>

      {isLoading ? (
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
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-color"></div>
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out grayscale-[50%] group-hover:grayscale-0"
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
  );
}
