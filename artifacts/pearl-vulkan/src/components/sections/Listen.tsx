import { motion } from "framer-motion";
import { useState } from "react";

const tracks = [
  {
    id: 1,
    title: "Dissonance Studies I–IV",
    genre: "EXPERIMENTAL / COMPOSED",
    duration: "18:03",
    description: "Four short pieces exploring the space between notes — not discord exactly, but the texture of sounds that do not quite agree, and the strange comfort that can live there.",
    image: "/images/listen-1.png",
    hasListen: false
  },
  {
    id: 2,
    title: "Sun Shining Bright Over Ellada",
    genre: "AMBIENT / DRONE",
    duration: "3:24",
    description: "southwest — 10.10.2022. A soundscape consisting of various birds, motorcycles, some Greek music and a truck with vegetables advertising itself on the loudspeaker one fine morning.",
    image: "/images/listen-2.png",
    hasListen: true
  },
  {
    id: 3,
    title: "Nebel des Krieges",
    genre: "FOLK / ACOUSTIC",
    duration: "42:01",
    description: "Improvisation on off-tune piano in the middle of war. You don't know any note unless you try, just like during war your actions are based on 75% uncertainty in the external reality. To navigate through the fog of war you have no other choice than to do right, out of inner truth, moment by moment. Recorded in Berlin, 7 June 2022. Found and published in Kyiv, 23 January 2022.",
    image: "/images/listen-3.png",
    hasListen: false
  },
  {
    id: 4,
    title: "A Study in Decay",
    genre: "AMBIENT / DRONE",
    duration: "12:14",
    description: "Loops of magnetic tape left to degrade in the sun. The sound of memory failing.",
    image: "/images/listen-4.png",
    hasListen: false
  },
  {
    id: 5,
    title: "Vessel",
    genre: "EXPERIMENTAL / COMPOSED",
    duration: "8:55",
    description: "Cello and contact microphones on a steel hull. Hollow, resonant, empty space.",
    image: "/images/listen-5.png",
    hasListen: true
  }
];

export default function Listen() {
  const [filter, setFilter] = useState<string>("ALL MUSIC");
  const genres = ["ALL MUSIC", ...Array.from(new Set(tracks.map(t => t.genre)))];

  const filteredTracks = filter === "ALL MUSIC" ? tracks : tracks.filter(t => t.genre === filter);

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <h2 className="font-serif text-4xl text-primary tracking-[0.1em] uppercase">Listen</h2>
        <div className="flex flex-wrap gap-6 font-sans text-xs tracking-widest">
          {genres.map(g => (
            <button 
              key={g} 
              onClick={() => setFilter(g)}
              className={`transition-colors duration-500 hover:text-primary ${filter === g ? "text-primary border-b border-primary pb-1" : "text-muted-foreground pb-1"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col gap-12">
        {filteredTracks.map((track, i) => (
          <motion.div 
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.1 }}
            className="group flex flex-col md:flex-row gap-8 items-start border-l border-primary/20 pl-6 md:pl-8 hover:border-primary transition-colors duration-700"
          >
            <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 overflow-hidden bg-muted">
              {track.image && (
                <img src={track.image} alt={track.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:mix-blend-normal" />
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                <h3 className="font-serif text-2xl text-foreground tracking-wide">{track.title}</h3>
                <span className="font-sans text-xs text-muted-foreground tracking-widest">{track.duration}</span>
              </div>
              <div className="font-sans text-[10px] text-primary tracking-[0.2em] uppercase">{track.genre}</div>
              <p className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed max-w-2xl mt-2">
                {track.description}
              </p>
              {track.hasListen && (
                <button className="mt-4 self-start text-xs font-sans tracking-[0.2em] text-primary border border-primary/30 px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase">
                  Listen
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
