import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useListTracks } from "@workspace/api-client-react";
import { useState, useRef } from "react";
import PageShell from "@/components/PageShell";

function PlayIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
}
function PauseIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
}

export default function TrackDetail({ id }: { id: string }) {
  const { data: tracks = [], isLoading } = useListTracks();
  const [playing, setPlaying] = useState(false);
  const [scOpen, setScOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [, navigate] = useLocation();

  const track = tracks.find(t => String(t.id) === id);

  const handlePlay = () => {
    if (!track?.audioPath) return;
    if (playing) { audioRef.current?.pause(); setPlaying(false); return; }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.audioPath);
    audioRef.current = audio;
    audio.play().catch(() => setPlaying(false));
    audio.onended = () => setPlaying(false);
    setPlaying(true);
  };

  if (isLoading) return (
    <PageShell>
      <div className="animate-pulse flex flex-col gap-8 max-w-2xl">
        <div className="aspect-square w-64 bg-muted" />
        <div className="h-8 bg-muted w-48 rounded" />
        <div className="h-4 bg-muted w-full rounded" />
      </div>
    </PageShell>
  );

  if (!track) return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <p className="font-sans text-sm text-muted-foreground/60">Track not found.</p>
        <button onClick={() => navigate("/listen")} className="self-start text-[9px] tracking-widest text-primary/50 hover:text-primary uppercase transition-colors">← Back to Listen</button>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="flex flex-col gap-10 max-w-2xl"
      >
        {track.imagePath && (
          <div className="w-full md:w-72 md:h-72 aspect-square overflow-hidden">
            <img src={track.imagePath} alt={track.title} className="w-full h-full object-cover opacity-90" />
          </div>
        )}

        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] text-primary uppercase mb-2">{track.genre}</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-wide leading-tight mb-2">{track.title}</h1>
          {track.duration && <p className="font-sans text-xs text-muted-foreground/30 tracking-widest">{track.duration}</p>}
        </div>

        {track.description && (
          <p className="font-sans text-sm text-muted-foreground/70 font-light leading-relaxed">{track.description}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {track.audioPath && (
            <button
              onClick={handlePlay}
              className={`flex items-center gap-3 text-xs font-sans tracking-[0.2em] border px-6 py-3 transition-all duration-500 uppercase ${playing ? "bg-primary text-primary-foreground border-primary" : "text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"}`}
            >
              {playing ? <><PauseIcon /> Now Playing</> : <><PlayIcon /> Listen</>}
            </button>
          )}
          {track.soundcloudUrl && (
            <button
              onClick={() => setScOpen(v => !v)}
              className={`flex items-center gap-3 text-xs font-sans tracking-[0.2em] border px-6 py-3 transition-all duration-500 uppercase ${scOpen ? "bg-primary/10 text-primary border-primary/60" : "text-primary/50 border-primary/20 hover:text-primary hover:border-primary/40"}`}
            >
              SoundCloud {scOpen ? "↑" : "↓"}
            </button>
          )}
        </div>

        {track.soundcloudUrl && scOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}>
            <iframe
              title={track.title}
              width="100%"
              height="166"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.soundcloudUrl)}&color=%23c9b77a&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`}
              className="border-0 opacity-90"
            />
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
}
