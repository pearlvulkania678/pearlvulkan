import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useListTracks } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";

export default function Listen() {
  const { data: tracks = [], isLoading } = useListTracks();
  const [filter, setFilter] = useState<string>("ALL MUSIC");
  const [playing, setPlaying] = useState<number | null>(null);
  const [playError, setPlayError] = useState<number | null>(null);
  const [scExpanded, setScExpanded] = useState<number | null>(null);
  const [scAutoplay, setScAutoplay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const genres = ["ALL MUSIC", ...Array.from(new Set(tracks.map((t) => t.genre)))];
  const filteredTracks = filter === "ALL MUSIC" ? tracks : tracks.filter((t) => t.genre === filter);

  const handlePlay = (trackId: number, audioPath: string | null) => {
    if (!audioPath) return;
    setPlayError(null);
    if (playing === trackId) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(audioPath);
    audioRef.current = audio;
    audio.play().catch(() => { setPlaying(null); setPlayError(trackId); });
    audio.onerror = () => { setPlaying(null); setPlayError(trackId); };
    audio.onended = () => setPlaying(null);
    setPlaying(trackId);
  };

  const handleScPlay = (trackId: number) => {
    if (scExpanded === trackId) {
      setScExpanded(null);
      setScAutoplay(false);
    } else {
      if (audioRef.current) { audioRef.current.pause(); setPlaying(null); }
      setScExpanded(trackId);
      setScAutoplay(true);
    }
  };

  const toggleSoundCloud = (trackId: number) => {
    if (scExpanded === trackId) {
      setScExpanded(null);
      setScAutoplay(false);
    } else {
      setScExpanded(trackId);
      setScAutoplay(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Sound</p>
          <h2 className="font-serif text-4xl text-foreground tracking-[0.1em] uppercase">Listen</h2>
        </div>
        <div className="flex flex-wrap gap-6 font-sans text-xs tracking-widest">
          {genres.map((g) => (
            <button
              key={g}
              data-testid={`filter-${g}`}
              onClick={() => setFilter(g)}
              className={`transition-colors duration-500 hover:text-primary ${
                filter === g ? "text-primary border-b border-primary pb-1" : "text-muted-foreground pb-1"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-8 items-start border-l border-primary/20 pl-8 animate-pulse">
              <div className="w-32 h-32 bg-muted shrink-0" />
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-6 bg-muted w-48 rounded" />
                <div className="h-3 bg-muted w-24 rounded" />
                <div className="h-3 bg-muted w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {filteredTracks.map((track, i) => {
            const isPlaying = playing === track.id;
            const hasAudio = !!track.audioPath;
            const hasSoundCloud = !!track.soundcloudUrl;
            const isScOpen = scExpanded === track.id;
            const isScPlaying = isScOpen && scAutoplay;

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
                data-testid={`track-${track.id}`}
                className="group flex flex-col md:flex-row gap-8 items-start border-l border-primary/20 pl-6 md:pl-8 hover:border-primary transition-colors duration-700"
              >
                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 overflow-hidden bg-muted relative">
                  {track.imagePath ? (
                    <img
                      src={track.imagePath}
                      alt={track.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:mix-blend-normal"
                    />
                  ) : track.soundcloudUrl ? (
                    <SoundCloudArtwork url={track.soundcloudUrl} title={track.title} />
                  ) : null}
                  {(hasAudio || (!hasAudio && hasSoundCloud)) && (
                    <button
                      onClick={() =>
                        hasAudio
                          ? handlePlay(track.id, track.audioPath ?? null)
                          : handleScPlay(track.id)
                      }
                      aria-label={isPlaying || isScPlaying ? "Pause" : "Play"}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    >
                      {isPlaying || isScPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-3 w-full">
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                    <h3 className="font-serif text-2xl text-foreground tracking-wide">{track.title}</h3>
                    <span className="font-sans text-xs text-muted-foreground tracking-widest">{track.duration}</span>
                  </div>
                  <div className="font-sans text-[10px] text-primary tracking-[0.2em] uppercase">{track.genre}</div>
                  <p className="font-sans text-sm text-muted-foreground/80 font-light leading-relaxed max-w-2xl mt-2">
                    {track.description}
                  </p>

                  {(isPlaying || isScPlaying) && <WaveformBars />}

                  <div className="flex flex-wrap gap-3 mt-4">
                    {hasAudio && (
                      <button
                        data-testid={`listen-btn-${track.id}`}
                        onClick={() => handlePlay(track.id, track.audioPath ?? null)}
                        className={`self-start flex items-center gap-3 text-xs font-sans tracking-[0.2em] border px-6 py-2 transition-all duration-500 uppercase ${
                          isPlaying
                            ? "bg-primary text-primary-foreground border-primary"
                            : "text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        {isPlaying ? <><PauseIcon small /> Now Playing</> : <><PlayIcon small /> Listen</>}
                      </button>
                    )}

                    {!hasAudio && hasSoundCloud && (
                      <button
                        data-testid={`listen-btn-${track.id}`}
                        onClick={() => handleScPlay(track.id)}
                        className={`self-start flex items-center gap-3 text-xs font-sans tracking-[0.2em] border px-6 py-2 transition-all duration-500 uppercase ${
                          isScPlaying
                            ? "bg-primary text-primary-foreground border-primary"
                            : "text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        {isScPlaying ? <><PauseIcon small /> Now Playing</> : <><PlayIcon small /> Listen</>}
                      </button>
                    )}

                    {hasAudio && hasSoundCloud && (
                      <button
                        data-testid={`sc-btn-${track.id}`}
                        onClick={() => toggleSoundCloud(track.id)}
                        className={`self-start flex items-center gap-2 text-xs font-sans tracking-[0.2em] border px-6 py-2 transition-all duration-500 uppercase ${
                          isScOpen
                            ? "bg-primary/10 text-primary border-primary/60"
                            : "text-primary/60 border-primary/20 hover:text-primary hover:border-primary/40"
                        }`}
                      >
                        <SoundCloudIcon small />
                        {isScOpen ? "Close" : "SoundCloud"}
                      </button>
                    )}
                  </div>

                  {playError === track.id && (
                    <p className="font-sans text-[9px] tracking-[0.2em] text-red-400/60 uppercase mt-1">
                      Could not load audio — check the file path in admin
                    </p>
                  )}

                  {hasSoundCloud && isScOpen && (
                    <motion.div
                      key={`sc-${track.id}-${scAutoplay}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mt-2 overflow-hidden"
                    >
                      <iframe
                        title={`SoundCloud — ${track.title}`}
                        width="100%"
                        height="166"
                        allow="autoplay"
                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.soundcloudUrl ?? "")}&color=%23c9b77a&auto_play=${scAutoplay ? "true" : "false"}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                        className="border-0 opacity-90"
                      />
                    </motion.div>
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

function SoundCloudArtwork({ url, title }: { url: string; title: string }) {
  const { data: thumbnailUrl, isLoading } = useQuery<string>({
    queryKey: ["sc-oembed", url],
    queryFn: () =>
      fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
        .then(r => r.json())
        .then((d: { thumbnail_url?: string }) => d.thumbnail_url ?? ""),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!url,
    retry: false,
  });

  if (isLoading) {
    return <div className="w-full h-full animate-pulse bg-[#c9b77a]/5" />;
  }
  if (!thumbnailUrl) return null;

  return (
    <img
      src={thumbnailUrl}
      alt={title}
      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
    />
  );
}

function WaveformBars() {
  const bars = 20;
  return (
    <div className="flex items-end gap-[3px] h-5 mt-1">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="waveform-bar w-[2px] bg-primary rounded-full"
          style={{
            height: `${10 + Math.sin(i * 0.8) * 6}px`,
            animationDelay: `${(i * 0.06).toFixed(2)}s`,
            animationDuration: `${(0.6 + (i % 5) * 0.1).toFixed(1)}s`,
          }}
        />
      ))}
    </div>
  );
}

function SoundCloudIcon({ small }: { small?: boolean }) {
  const size = small ? 12 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1zm-.899.828c-.06 0-.11.052-.118.11L0 15.378l.158 2.139c.008.06.058.11.118.11.06 0 .11-.05.118-.11l.19-2.139-.19-2.215c-.009-.06-.058-.11-.118-.11zm10.927-5.4a.468.468 0 00-.468.468v9.447a.468.468 0 00.468.468h10.33A1.966 1.966 0 0024 16.07a1.966 1.966 0 00-1.967-1.967c-.07 0-.137.009-.203.023a3.928 3.928 0 00.02-.4 3.928 3.928 0 00-3.928-3.927 3.93 3.93 0 00-1.531.31 5.887 5.887 0 00-5.189-3.056zm-2.8 2.97c-.06 0-.112.05-.12.11l-.217 5.245.218 2.105c.007.06.059.11.12.11.058 0 .11-.05.117-.11l.25-2.105-.25-5.245c-.008-.06-.059-.11-.118-.11zm-1.4-.606c-.067 0-.122.057-.13.122l-.248 5.85.248 2.104c.008.066.063.122.13.122.065 0 .12-.056.128-.122l.282-2.104-.282-5.85c-.008-.065-.063-.122-.128-.122zm-1.4.43c-.074 0-.135.064-.142.136l-.278 5.42.278 2.104c.007.073.068.135.142.135.072 0 .133-.062.14-.135l.316-2.104-.316-5.42c-.007-.072-.068-.136-.14-.136zm-1.4.86c-.08 0-.147.07-.154.15l-.307 4.56.307 2.104c.007.08.074.149.154.149.079 0 .146-.07.152-.15l.35-2.103-.35-4.56c-.006-.08-.073-.15-.152-.15zm-1.4-.055c-.086 0-.157.075-.164.16l-.337 4.615.337 2.104c.007.086.078.16.164.16.085 0 .156-.074.163-.16l.383-2.104-.383-4.615c-.007-.085-.078-.16-.163-.16z"/>
    </svg>
  );
}

function PlayIcon({ small }: { small?: boolean }) {
  const size = small ? 10 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ small }: { small?: boolean }) {
  const size = small ? 10 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
