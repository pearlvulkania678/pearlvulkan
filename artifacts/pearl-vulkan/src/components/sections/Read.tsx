import { motion } from "framer-motion";

const poems = [
  {
    id: 1,
    text: `А ж поки з моє і з моє ю не ди ліз є
флоре атрига

5 аутро

Дав дати с'ности в цей світ красу

Бо вже не можу

Винести ті б'є кис а у рожу`,
    tags: ["POETRY", "UKRAINIAN", "VULCANSALUT"]
  },
  {
    id: 2,
    text: `The architecture of ash.
We build houses out of what remains.
Do not ask the fire for forgiveness.
It only knows how to eat.`,
    tags: ["POETRY", "ENGLISH", "FRAGMENTS"]
  },
  {
    id: 3,
    text: `Тиша має вагу.
Вона сідає на плечі,
Як старий пил у порожній кімнаті.
Я не шукаю слів,
Я шукаю простір між ними.`,
    tags: ["POETRY", "UKRAINIAN", "OBSERVATION"]
  }
];

export default function Read() {
  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-24"
      >
        <h2 className="font-serif text-4xl text-primary tracking-[0.1em] uppercase mb-4">Read</h2>
        <div className="w-12 h-px bg-primary/40"></div>
      </motion.div>

      <div className="flex flex-col gap-32 max-w-3xl mx-auto">
        {poems.map((poem, i) => (
          <motion.div 
            key={poem.id}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
            className="flex flex-col gap-8"
          >
            <div className="font-serif text-lg md:text-xl text-foreground/90 leading-[2.5] whitespace-pre-wrap italic">
              {poem.text}
            </div>
            
            <div className="flex flex-wrap gap-4">
              {poem.tags.map(tag => (
                <span key={tag} className="font-sans text-[9px] tracking-[0.3em] text-primary/70 border border-primary/20 px-3 py-1 rounded-sm uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
