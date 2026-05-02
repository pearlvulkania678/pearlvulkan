import { useState, useId } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useUpdateTrack,
  useDeleteTrack,
  useCreateTrack,
  useUpdatePoem,
  useDeletePoem,
  useCreatePoem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  useCreateGalleryItem,
} from "@workspace/api-client-react";

const fetchAdminTouch = () => fetch(`${BASE}api/admin/touch`).then(r => r.json()) as Promise<AdminTouch[]>;
const fetchAdminSense = () => fetch(`${BASE}api/admin/sense`).then(r => r.json()) as Promise<AdminSense[]>;

const adminTouchKey = ["admin", "touch"] as const;
const adminSenseKey = ["admin", "sense"] as const;

const SESSION_KEY = "pv_admin_auth";
const BASE = import.meta.env.BASE_URL;

type Tab = "tracks" | "see" | "touch" | "sense" | "log";
const TAB_LABELS: Record<Tab, string> = { tracks: "listen", see: "see", touch: "touch", sense: "sense", log: "log" };

// ─── Types matching DB shape ──────────────────────────────────────────────────
interface AdminTrack   { id: number; title: string; genre: string; duration: string; description: string; imagePath: string | null; audioPath: string | null; soundcloudUrl: string | null; hasListen: boolean; published: boolean; sortOrder: number; }
interface AdminPoem    { id: number; title: string | null; content: string; tags: string[]; published: boolean; sortOrder: number; }
interface AdminTouch   { id: number; title: string; subtitle: string | null; description: string; imagePath: string | null; linkUrl: string | null; published: boolean; sortOrder: number; }
interface AdminSense   { id: number; title: string; date: string | null; location: string | null; description: string; imagePath: string | null; linkUrl: string | null; published: boolean; sortOrder: number; }

// ─── Admin-specific fetchers (see all, incl. drafts) ────────────────────────
const fetchAdminTracks = () => fetch(`${BASE}api/admin/tracks`).then(r => r.json()) as Promise<AdminTrack[]>;
const fetchAdminPoems  = () => fetch(`${BASE}api/admin/poems`).then(r => r.json())  as Promise<AdminPoem[]>;

const adminTracksKey = ["admin", "tracks"] as const;
const adminPoemsKey  = ["admin", "poems"]  as const;

// ─── Root ────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  if (!authed) return <LoginGate onSuccess={() => { sessionStorage.setItem(SESSION_KEY, "1"); setAuthed(true); }} />;
  return <AdminPanel />;
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE}api/admin/auth`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (res.ok) { onSuccess(); } else { setError("Wrong passphrase."); setPw(""); }
    } catch { setError("Could not reach server."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#111010] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-72">
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] text-[#c9b77a]/40 uppercase mb-2">Pearl Vulkan</p>
          <h1 className="font-serif text-2xl text-[#c9b77a] tracking-widest uppercase">Admin</h1>
        </div>
        <div className="w-full h-px bg-[#c9b77a]/15" />
        <div className="flex flex-col gap-2">
          <label className="text-[9px] tracking-[0.2em] text-[#c9b77a]/40 uppercase">Passphrase</label>
          <input data-testid="admin-password-input" type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} className="admin-input" placeholder="••••••••••••" />
          {error && <p className="text-[9px] tracking-wider text-red-400/70">{error}</p>}
        </div>
        <button type="submit" disabled={loading || !pw} data-testid="admin-login-btn" className="btn-admin disabled:opacity-30 text-center">{loading ? "Checking..." : "Enter"}</button>
      </form>
    </div>
  );
}

function useBuildInfo() {
  return useQuery<{ status: string; startedAt: string }>({
    queryKey: ["healthz"],
    queryFn: () => fetch(`${BASE}api/healthz`).then(r => r.json()),
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

function BuildBanner() {
  const { data, isFetching, isError } = useBuildInfo();

  const label = (() => {
    if (isError) return { text: "server unreachable", color: "text-red-400/60" };
    if (!data) return { text: "checking server…", color: "text-[#c9b77a]/20" };
    const d = new Date(data.startedAt);
    const now = new Date();
    const secs = Math.floor((now.getTime() - d.getTime()) / 1000);
    const age =
      secs < 60 ? `${secs}s ago` :
      secs < 3600 ? `${Math.floor(secs / 60)}m ago` :
      `${Math.floor(secs / 3600)}h ago`;
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return { text: `server built ${timeStr} · ${age}`, color: "text-[#c9b77a]/30" };
  })();

  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isError ? "bg-red-400/60" : "bg-[#c9b77a]/40"} ${isFetching ? "animate-pulse" : ""}`} />
      <span className={`font-sans text-[8px] tracking-[0.2em] uppercase ${label.color}`}>
        {label.text}
      </span>
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>("tracks");
  return (
    <div className="min-h-screen bg-[#111010] text-[#c9b77a] font-sans">
      <header className="border-b border-[#c9b77a]/20 px-8 py-6 flex items-center justify-between">
        <div>
          <a href="/" className="text-[10px] tracking-[0.3em] text-[#c9b77a]/50 uppercase hover:text-[#c9b77a] transition-colors">&larr; Pearl Vulkan</a>
          <h1 className="font-serif text-2xl tracking-widest uppercase mt-1">Admin</h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex gap-6 flex-wrap">
            {(["tracks", "see", "touch", "sense", "log"] as Tab[]).map(t => (
              <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)}
                className={`text-[10px] tracking-[0.2em] uppercase transition-colors pb-1 ${tab === t ? "text-[#c9b77a] border-b border-[#c9b77a]" : "text-[#c9b77a]/40 hover:text-[#c9b77a]/70"}`}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); window.location.reload(); }} className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors">Sign out</button>
        </div>
      </header>
      <div className="border-b border-[#c9b77a]/10 px-8 py-2">
        <BuildBanner />
      </div>
      <main className="px-8 py-10 max-w-4xl mx-auto">
        {tab === "tracks" && <TracksPanel />}
        {tab === "see"    && <PoemsPanel />}
        {tab === "touch"  && <TouchPanel />}
        {tab === "sense"   && <SensePanel />}
        {tab === "log"     && <ActivityPanel />}
      </main>
    </div>
  );
}

// ─── Drag handle ──────────────────────────────────────────────────────────────
function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className="cursor-grab active:cursor-grabbing text-[#c9b77a]/20 hover:text-[#c9b77a]/50 transition-colors select-none flex items-center px-3 border-r border-[#c9b77a]/10 self-stretch">
      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
        <circle cx="3" cy="4"  r="1.5"/><circle cx="9" cy="4"  r="1.5"/>
        <circle cx="3" cy="10" r="1.5"/><circle cx="9" cy="10" r="1.5"/>
        <circle cx="3" cy="16" r="1.5"/><circle cx="9" cy="16" r="1.5"/>
      </svg>
    </div>
  );
}

// ─── Publish toggle ───────────────────────────────────────────────────────────
function PublishToggle({ published, onToggle, saving }: { published: boolean; onToggle: () => void; saving: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={saving}
      title={published ? "Click to set as draft" : "Click to publish"}
      className={`text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5 transition-all duration-300 disabled:opacity-40 ${
        published
          ? "border-[#c9b77a]/40 text-[#c9b77a]/70 hover:border-red-400/50 hover:text-red-400/70"
          : "border-[#c9b77a]/20 text-[#c9b77a]/30 hover:border-[#c9b77a]/50 hover:text-[#c9b77a]/60"
      }`}
    >
      {published ? "Live" : "Draft"}
    </button>
  );
}

// ─── Tracks panel ─────────────────────────────────────────────────────────────
function TracksPanel() {
  const qc = useQueryClient();
  const { data: tracks = [], isLoading } = useQuery({ queryKey: adminTracksKey, queryFn: fetchAdminTracks });
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", genre: "", duration: "", description: "", imagePath: "", audioPath: "", soundcloudUrl: "", hasListen: false });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: adminTracksKey });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(tracks, tracks.findIndex(t => t.id === active.id), tracks.findIndex(t => t.id === over.id));
    qc.setQueryData(adminTracksKey, reordered);
    reordered.forEach((t, i) => { if (t.sortOrder !== i) updateTrack.mutate({ id: t.id, data: { sortOrder: i } }, { onSuccess: invalidate }); });
  };

  const handleCreate = () => {
    createTrack.mutate(
      { data: { title: form.title, genre: form.genre, duration: form.duration, description: form.description, imagePath: form.imagePath || null, audioPath: form.audioPath || null, soundcloudUrl: form.soundcloudUrl || null, hasListen: form.hasListen } },
      { onSuccess: () => { invalidate(); setAdding(false); setForm({ title: "", genre: "", duration: "", description: "", imagePath: "", audioPath: "", soundcloudUrl: "", hasListen: false }); } }
    );
  };

  const handleUpdate = (id: number) => {
    updateTrack.mutate(
      { id, data: { title: form.title, genre: form.genre, duration: form.duration, description: form.description, imagePath: form.imagePath || null, audioPath: form.audioPath || null, soundcloudUrl: form.soundcloudUrl || null, hasListen: form.hasListen } },
      { onSuccess: () => { invalidate(); setEditing(null); } }
    );
  };

  const handleTogglePublish = (t: AdminTrack) => {
    updateTrack.mutate({ id: t.id, data: { published: !t.published } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this track?")) return;
    deleteTrack.mutate({ id }, { onSuccess: invalidate });
  };

  const startEdit = (t: AdminTrack) => { setEditing(t.id); setForm({ title: t.title, genre: t.genre, duration: t.duration, description: t.description, imagePath: t.imagePath ?? "", audioPath: t.audioPath ?? "", soundcloudUrl: t.soundcloudUrl ?? "", hasListen: t.hasListen }); };

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">Music Tracks ({tracks.length})</h2>
          <span className="text-[9px] text-[#c9b77a]/25 tracking-wider">drag to reorder</span>
        </div>
        <button data-testid="add-track" onClick={() => { setAdding(true); setEditing(null); }} className="btn-admin">+ Add Track</button>
      </div>

      {adding && <TrackForm form={form} onChange={setForm} onSave={handleCreate} onCancel={() => setAdding(false)} saving={createTrack.isPending} label="Create" />}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tracks.map(t => (
              <SortableTrackRow
                key={t.id}
                track={t}
                isEditing={editing === t.id}
                form={form}
                onFormChange={setForm}
                onSave={() => handleUpdate(t.id)}
                onCancelEdit={() => setEditing(null)}
                onStartEdit={() => startEdit(t)}
                onDelete={() => handleDelete(t.id)}
                onTogglePublish={() => handleTogglePublish(t)}
                saving={updateTrack.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Poems panel ──────────────────────────────────────────────────────────────
function PoemsPanel() {
  const qc = useQueryClient();
  const { data: poems = [], isLoading } = useQuery({ queryKey: adminPoemsKey, queryFn: fetchAdminPoems });
  const createPoem = useCreatePoem();
  const updatePoem = useUpdatePoem();
  const deletePoem = useDeletePoem();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: adminPoemsKey });
  const parseTags = (s: string) => s.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(poems, poems.findIndex(p => p.id === active.id), poems.findIndex(p => p.id === over.id));
    qc.setQueryData(adminPoemsKey, reordered);
    reordered.forEach((p, i) => { if (p.sortOrder !== i) updatePoem.mutate({ id: p.id, data: { sortOrder: i } }, { onSuccess: invalidate }); });
  };

  const handleCreate = () => {
    createPoem.mutate(
      { data: { title: form.title || null, content: form.content, tags: parseTags(form.tags) } },
      { onSuccess: () => { invalidate(); setAdding(false); setForm({ title: "", content: "", tags: "" }); } }
    );
  };

  const handleUpdate = (id: number) => {
    updatePoem.mutate({ id, data: { title: form.title || null, content: form.content, tags: parseTags(form.tags) } }, { onSuccess: () => { invalidate(); setEditing(null); } });
  };

  const handleTogglePublish = (p: AdminPoem) => {
    updatePoem.mutate({ id: p.id, data: { published: !p.published } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this poem?")) return;
    deletePoem.mutate({ id }, { onSuccess: invalidate });
  };

  const startEdit = (p: AdminPoem) => { setEditing(p.id); setForm({ title: p.title ?? "", content: p.content, tags: p.tags.join(", ") }); };

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">Poems ({poems.length})</h2>
          <span className="text-[9px] text-[#c9b77a]/25 tracking-wider">drag to reorder</span>
        </div>
        <button data-testid="add-poem" onClick={() => { setAdding(true); setEditing(null); }} className="btn-admin">+ Add Poem</button>
      </div>

      {adding && <PoemForm form={form} onChange={setForm} onSave={handleCreate} onCancel={() => setAdding(false)} saving={createPoem.isPending} label="Create" />}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={poems.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {poems.map(p => (
              <SortablePoemRow
                key={p.id}
                poem={p}
                isEditing={editing === p.id}
                form={form}
                onFormChange={setForm}
                onSave={() => handleUpdate(p.id)}
                onCancelEdit={() => setEditing(null)}
                onStartEdit={() => startEdit(p)}
                onDelete={() => handleDelete(p.id)}
                onTogglePublish={() => handleTogglePublish(p)}
                saving={updatePoem.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Sortable row components (hooks must be at component top level, not in .map) ─
type TrackFormState = { title: string; genre: string; duration: string; description: string; imagePath: string; audioPath: string; soundcloudUrl: string; hasListen: boolean };
type PoemFormState  = { title: string; content: string; tags: string };

// ─── Poem block types ──────────────────────────────────────────────────────────
type PoemBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string; caption: string }
  | { type: "video"; src: string; caption: string };

type PoemBlockWithId = PoemBlock & { _id: string };

let _blkSeq = 0;
const withBlockId = (b: PoemBlock): PoemBlockWithId => ({ ...b, _id: `blk-${++_blkSeq}-${Date.now()}` });

function parsePoemBlocks(content: string): PoemBlock[] {
  try { const p = JSON.parse(content); if (Array.isArray(p)) return p as PoemBlock[]; } catch {}
  return [{ type: "text", value: content }];
}
function blocksToContent(blocks: PoemBlockWithId[]): string {
  const clean: PoemBlock[] = blocks.map(({ _id: _discarded, ...b }) => b as PoemBlock);
  const isRich = clean.some(b => b.type === "image" || b.type === "video");
  if (!isRich && clean.length === 1 && clean[0].type === "text") return (clean[0] as Extract<PoemBlock, { type: "text" }>).value;
  return JSON.stringify(clean);
}

function PoemContentPreview({ content, published }: { content: string; published: boolean }) {
  const blocks = parsePoemBlocks(content);
  const textBlocks  = blocks.filter(b => b.type === "text")  as Extract<PoemBlock, { type: "text" }>[];
  const imageCount  = blocks.filter(b => b.type === "image").length;
  const videoCount  = blocks.filter(b => b.type === "video").length;
  const previewText = textBlocks.map(b => b.value).join(" ").trim().slice(0, 160);
  const dimText = published ? "text-[#c9b77a]/50" : "text-[#c9b77a]/25";

  return (
    <div className="flex flex-col gap-1.5">
      {previewText ? (
        <p className={`font-serif text-sm italic leading-relaxed line-clamp-2 ${dimText}`}>
          {previewText}{previewText.length === 160 ? "…" : ""}
        </p>
      ) : (
        <p className={`text-xs ${dimText} italic`}>No text</p>
      )}
      {(imageCount > 0 || videoCount > 0) && (
        <div className="flex gap-2">
          {imageCount > 0 && (
            <span className="text-[8px] tracking-[0.2em] uppercase border border-sky-400/25 text-sky-400/50 px-1.5 py-0.5">
              {imageCount} image{imageCount > 1 ? "s" : ""}
            </span>
          )}
          {videoCount > 0 && (
            <span className="text-[8px] tracking-[0.2em] uppercase border border-violet-400/25 text-violet-400/50 px-1.5 py-0.5">
              {videoCount} video{videoCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SortableTrackRow({ track, isEditing, form, onFormChange, onSave, onCancelEdit, onStartEdit, onDelete, onTogglePublish, saving }: {
  track: AdminTrack; isEditing: boolean;
  form: TrackFormState; onFormChange: (f: TrackFormState) => void;
  onSave: () => void; onCancelEdit: () => void; onStartEdit: () => void;
  onDelete: () => void; onTogglePublish: () => void; saving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      data-testid={`track-row-${track.id}`} className="border border-[#c9b77a]/15 flex">
      <DragHandle {...attributes} {...listeners} />
      <div className="flex-1 p-4">
        {isEditing ? (
          <TrackForm form={form} onChange={onFormChange} onSave={onSave} onCancel={onCancelEdit} saving={saving} label="Save" />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className={`font-serif text-lg ${track.published ? "text-[#c9b77a]" : "text-[#c9b77a]/40"}`}>{track.title}</span>
                <span className="text-[10px] tracking-widest text-[#c9b77a]/50">{track.duration}</span>
                <PublishToggle published={track.published} onToggle={onTogglePublish} saving={saving} />
              </div>
              <span className="text-[9px] tracking-[0.2em] text-[#c9b77a]/60 uppercase">{track.genre}</span>
              <p className="text-xs text-[#c9b77a]/40 mt-1 leading-relaxed line-clamp-2">{track.description}</p>
              {track.audioPath && <span className="text-[8px] tracking-widest text-[#c9b77a]/30 uppercase mt-1">♪ audio attached</span>}
              {track.soundcloudUrl && <span className="text-[8px] tracking-widest text-[#c9b77a]/30 uppercase mt-1">☁ soundcloud linked</span>}
            </div>
            <div className="flex gap-3 shrink-0">
              <button data-testid={`edit-track-${track.id}`} onClick={onStartEdit} className="admin-action">Edit</button>
              <button data-testid={`delete-track-${track.id}`} onClick={onDelete} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SortablePoemRow({ poem, isEditing, form, onFormChange, onSave, onCancelEdit, onStartEdit, onDelete, onTogglePublish, saving }: {
  poem: AdminPoem; isEditing: boolean;
  form: PoemFormState; onFormChange: (f: PoemFormState) => void;
  onSave: () => void; onCancelEdit: () => void; onStartEdit: () => void;
  onDelete: () => void; onTogglePublish: () => void; saving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: poem.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      data-testid={`poem-row-${poem.id}`} className="border border-[#c9b77a]/15 flex">
      <DragHandle {...attributes} {...listeners} />
      <div className="flex-1 p-4">
        {isEditing ? (
          <PoemForm form={form} onChange={onFormChange} onSave={onSave} onCancel={onCancelEdit} saving={saving} label="Save" />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                {poem.title && <span className={`font-serif text-base italic ${poem.published ? "text-[#c9b77a]" : "text-[#c9b77a]/40"}`}>{poem.title}</span>}
                <PublishToggle published={poem.published} onToggle={onTogglePublish} saving={saving} />
              </div>
              <PoemContentPreview content={poem.content} published={poem.published} />
              <div className="flex gap-2 flex-wrap mt-1">
                {poem.tags.map(tag => <span key={tag} className="text-[9px] tracking-widest text-[#c9b77a]/40 border border-[#c9b77a]/20 px-2 py-0.5">{tag}</span>)}
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button data-testid={`edit-poem-${poem.id}`} onClick={onStartEdit} className="admin-action">Edit</button>
              <button data-testid={`delete-poem-${poem.id}`} onClick={onDelete} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared form components ───────────────────────────────────────────────────
function TrackForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; genre: string; duration: string; description: string; imagePath: string; audioPath: string; soundcloudUrl: string; hasListen: boolean };
  onChange: (f: typeof form) => void; onSave: () => void; onCancel: () => void; saving: boolean; label: string;
}) {
  const [importingArt, setImportingArt] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importSCArtwork = async () => {
    if (!form.soundcloudUrl) return;
    setImportingArt(true);
    setImportError(null);
    try {
      const res = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(form.soundcloudUrl)}&format=json`);
      if (!res.ok) throw new Error("SoundCloud did not respond");
      const data = await res.json() as { thumbnail_url?: string };
      if (!data.thumbnail_url) throw new Error("No artwork found");
      onChange({ ...form, imagePath: data.thumbnail_url });
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Failed");
    } finally {
      setImportingArt(false);
    }
  };

  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <div className="grid grid-cols-3 gap-4">
        <Field label="Title"><input data-testid="input-title" className="admin-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} /></Field>
        <Field label="Genre"><input data-testid="input-genre" className="admin-input" value={form.genre} onChange={e => onChange({ ...form, genre: e.target.value })} placeholder="AMBIENT / DRONE" /></Field>
        <Field label="Duration"><input data-testid="input-duration" className="admin-input" value={form.duration} onChange={e => onChange({ ...form, duration: e.target.value })} placeholder="3:24" /></Field>
      </div>
      <ImageUploadField inputId="track-image-input" value={form.imagePath} onChange={imagePath => onChange({ ...form, imagePath })} />
      {form.soundcloudUrl && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={importSCArtwork}
            disabled={importingArt}
            className="text-[9px] tracking-[0.2em] uppercase border border-[#c9b77a]/30 text-[#c9b77a]/60 hover:text-[#c9b77a] hover:border-[#c9b77a]/60 transition-colors duration-300 px-3 py-1 disabled:opacity-40"
          >
            {importingArt ? "…" : "☁ Import from SoundCloud"}
          </button>
          {importError && <p className="text-[8px] text-red-400/60 tracking-wide">{importError}</p>}
        </div>
      )}
      <Field label="Description"><textarea data-testid="input-description" className="admin-input h-20 resize-none" value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} /></Field>
      <AudioUploadField value={form.audioPath} onChange={audioPath => onChange({ ...form, audioPath })} />
      <div className="flex flex-col gap-1">
        <p className="text-[9px] tracking-[0.25em] text-[#c9b77a]/40 uppercase mb-1">SoundCloud</p>
        <Field label="SoundCloud Track URL">
          <input
            data-testid="input-soundcloud"
            className="admin-input"
            value={form.soundcloudUrl}
            onChange={e => onChange({ ...form, soundcloudUrl: e.target.value })}
            placeholder="https://soundcloud.com/artist/track-name"
          />
        </Field>
        <p className="text-[8px] text-[#c9b77a]/25 tracking-wide mt-1">Paste the full SoundCloud track URL. If both audio file and SoundCloud are set, audio file takes priority.</p>
      </div>
      <FormActions onSave={onSave} onCancel={onCancel} saving={saving} label={label} />
    </div>
  );
}

function PoemForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; content: string; tags: string };
  onChange: (f: typeof form) => void; onSave: () => void; onCancel: () => void; saving: boolean; label: string;
}) {
  const [blocks, setBlocks] = useState<PoemBlockWithId[]>(() =>
    parsePoemBlocks(form.content).map(withBlockId)
  );

  const blockSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const updateBlocks = (next: PoemBlockWithId[]) => {
    setBlocks(next);
    onChange({ ...form, content: blocksToContent(next) });
  };

  const addText  = () => updateBlocks([...blocks, withBlockId({ type: "text",  value: "" })]);
  const addImage = () => updateBlocks([...blocks, withBlockId({ type: "image", src: "", caption: "" })]);
  const addVideo = () => updateBlocks([...blocks, withBlockId({ type: "video", src: "", caption: "" })]);

  const removeBlock = (id: string) => updateBlocks(blocks.filter(b => b._id !== id));

  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex(b => b._id === active.id);
    const newIdx = blocks.findIndex(b => b._id === over.id);
    updateBlocks(arrayMove(blocks, oldIdx, newIdx));
  };

  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-5 bg-[#161515]">
      <Field label="Title (optional)">
        <input data-testid="input-poem-title" className="admin-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} />
      </Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] tracking-[0.2em] text-[#c9b77a]/50 uppercase">Content Blocks</label>
            <span className="text-[8px] text-[#c9b77a]/25 tracking-wider">drag to reorder blocks</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addText}  className="text-[8px] tracking-widest text-[#c9b77a]/50 border border-[#c9b77a]/20 px-3 py-1 hover:border-[#c9b77a]/50 hover:text-[#c9b77a] transition-colors uppercase">+ Text</button>
            <button type="button" onClick={addImage} className="text-[8px] tracking-widest text-[#c9b77a]/50 border border-[#c9b77a]/20 px-3 py-1 hover:border-[#c9b77a]/50 hover:text-[#c9b77a] transition-colors uppercase">+ Image</button>
            <button type="button" onClick={addVideo} className="text-[8px] tracking-widest text-[#c9b77a]/50 border border-[#c9b77a]/20 px-3 py-1 hover:border-[#c9b77a]/50 hover:text-[#c9b77a] transition-colors uppercase">+ Video</button>
          </div>
        </div>

        <DndContext sensors={blockSensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
          <SortableContext items={blocks.map(b => b._id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {blocks.map((block, i) => (
                <SortableBlockRow
                  key={block._id}
                  block={block}
                  index={i}
                  onRemove={() => removeBlock(block._id)}
                  onUpdate={(updated) => {
                    const next = [...blocks];
                    next[i] = { ...updated, _id: block._id };
                    updateBlocks(next);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="border border-dashed border-[#c9b77a]/10 py-8 flex items-center justify-center">
            <span className="text-[9px] tracking-widest text-[#c9b77a]/20 uppercase">No blocks yet — add text, image, or video above</span>
          </div>
        )}
      </div>

      <Field label="Tags (comma separated)">
        <input data-testid="input-poem-tags" className="admin-input" value={form.tags} onChange={e => onChange({ ...form, tags: e.target.value })} placeholder="POETRY, UKRAINIAN, VULCANSALUT" />
      </Field>
      <FormActions onSave={onSave} onCancel={onCancel} saving={saving} label={label} />
    </div>
  );
}

function SortableBlockRow({ block, index, onRemove, onUpdate }: {
  block: PoemBlockWithId;
  index: number;
  onRemove: () => void;
  onUpdate: (b: PoemBlock) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block._id });

  const BLOCK_LABELS: Record<string, string> = { text: "Text Block", image: "Image Block", video: "Video Block" };
  const BLOCK_COLORS: Record<string, string> = {
    text:  "text-[#c9b77a]/30",
    image: "text-sky-400/50",
    video: "text-violet-400/50",
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex gap-0 items-stretch border border-[#c9b77a]/10 bg-[#131212]"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-[#c9b77a]/20 hover:text-[#c9b77a]/50 hover:bg-[#c9b77a]/5 transition-colors select-none flex items-center justify-center w-7 shrink-0 border-r border-[#c9b77a]/10"
      >
        <svg width="10" height="16" viewBox="0 0 12 20" fill="currentColor">
          <circle cx="3" cy="4"  r="1.5"/><circle cx="9" cy="4"  r="1.5"/>
          <circle cx="3" cy="10" r="1.5"/><circle cx="9" cy="10" r="1.5"/>
          <circle cx="3" cy="16" r="1.5"/><circle cx="9" cy="16" r="1.5"/>
        </svg>
      </div>

      {/* Block content */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[8px] tracking-[0.2em] uppercase font-medium ${BLOCK_COLORS[block.type]}`}>
            {BLOCK_LABELS[block.type]}
          </span>
          <span className="text-[8px] text-[#c9b77a]/15 tracking-wider">#{index + 1}</span>
          <span className="flex-1" />
          <button type="button" onClick={onRemove} className="text-[8px] tracking-widest text-red-400/40 hover:text-red-400/80 uppercase transition-colors">Remove</button>
        </div>

        {block.type === "text" ? (
          <textarea
            className="admin-input h-28 resize-y font-serif text-sm"
            value={block.value}
            placeholder="Poem lines…"
            onChange={e => onUpdate({ type: "text", value: e.target.value })}
          />
        ) : block.type === "image" ? (
          <PoemImageBlock
            blockIndex={index}
            src={block.src}
            caption={block.caption}
            onChangeSrc={src => onUpdate({ ...block, src })}
            onChangeCaption={caption => onUpdate({ ...block, caption })}
          />
        ) : (
          <PoemVideoBlock
            src={block.src}
            caption={block.caption}
            onChangeSrc={src => onUpdate({ ...block, src })}
            onChangeCaption={caption => onUpdate({ ...block, caption })}
          />
        )}
      </div>
    </div>
  );
}

function PoemImageBlock({ blockIndex, src, caption, onChangeSrc, onChangeCaption }: {
  blockIndex: number; src: string; caption: string;
  onChangeSrc: (src: string) => void; onChangeCaption: (caption: string) => void;
}) {
  const uid = useId();
  const inputId = `poem-img-${uid}-${blockIndex}`;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const BASE = import.meta.env.BASE_URL;

  const upload = async (file: File) => {
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}api/upload`, { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json() as { error?: string }; setError(j.error ?? "Upload failed"); return; }
      const { url } = await res.json() as { url: string };
      onChangeSrc(url);
    } catch { setError("Upload failed"); }
    finally { setUploading(false); }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
        onClick={() => document.getElementById(inputId)?.click()}
        className={`relative border-2 border-dashed cursor-pointer flex items-center justify-center transition-colors duration-300 ${
          dragging ? "border-[#c9b77a]/60 bg-[#c9b77a]/5" : "border-[#c9b77a]/20 hover:border-[#c9b77a]/40"
        } ${src ? "h-32" : "h-20"}`}
      >
        {src && <img src={src} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
        <div className="relative z-10 text-center pointer-events-none">
          {uploading ? (
            <span className="text-[9px] tracking-widest text-[#c9b77a]/60 uppercase">Uploading…</span>
          ) : (
            <span className="text-[9px] tracking-widest text-[#c9b77a]/40 uppercase">{src ? "Click or drop to replace" : "Drop image or click to browse"}</span>
          )}
        </div>
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      </div>
      {error && <p className="text-[9px] text-red-400/70">{error}</p>}
      <div className="flex gap-2 items-center">
        <span className="text-[8px] text-[#c9b77a]/30 uppercase tracking-widest shrink-0">Or URL</span>
        <input className="admin-input text-xs" value={src} onChange={e => onChangeSrc(e.target.value)} placeholder="https://… or /uploads/…" />
      </div>
      <input className="admin-input text-xs" value={caption} onChange={e => onChangeCaption(e.target.value)} placeholder="Caption (optional)" />
    </div>
  );
}

function PoemVideoBlock({ src, caption, onChangeSrc, onChangeCaption }: {
  src: string; caption: string;
  onChangeSrc: (src: string) => void; onChangeCaption: (caption: string) => void;
}) {
  const isYouTube = /youtube\.com|youtu\.be/.test(src);
  const isVimeo = /vimeo\.com/.test(src);
  const isEmbed = isYouTube || isVimeo;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-[8px] tracking-[0.2em] text-[#c9b77a]/40 uppercase">Video URL</label>
        <input
          className="admin-input text-xs"
          value={src}
          onChange={e => onChangeSrc(e.target.value)}
          placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
        />
        <p className="text-[8px] text-[#c9b77a]/25 tracking-wide">
          {isYouTube ? "▶ YouTube detected — will embed" : isVimeo ? "▶ Vimeo detected — will embed" : "Paste a YouTube, Vimeo, or direct video file URL"}
        </p>
      </div>
      {src && isEmbed && (
        <div className="relative w-full border border-[#c9b77a]/10 overflow-hidden" style={{ paddingBottom: "30%" }}>
          <div className="absolute inset-0 flex items-center justify-center bg-[#111010]">
            <span className="text-[9px] tracking-widest text-[#c9b77a]/40 uppercase">Preview visible on site</span>
          </div>
        </div>
      )}
      <input
        className="admin-input text-xs"
        value={caption}
        onChange={e => onChangeCaption(e.target.value)}
        placeholder="Caption (optional)"
      />
    </div>
  );
}

function ImageUploadField({ value, onChange, inputId = "gallery-file-input" }: { value: string; onChange: (url: string) => void; inputId?: string }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useState<HTMLInputElement | null>(null);
  const BASE = import.meta.env.BASE_URL;

  const upload = async (file: File) => {
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}api/upload`, { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json() as { error?: string }; setError(j.error ?? "Upload failed"); return; }
      const { url } = await res.json() as { url: string };
      onChange(url);
    } catch { setError("Upload failed — check connection"); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] tracking-[0.2em] text-[#c9b77a]/50 uppercase">Image</label>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId)?.click()}
        className={`relative border-2 border-dashed transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${
          dragging ? "border-[#c9b77a]/60 bg-[#c9b77a]/5" : "border-[#c9b77a]/20 hover:border-[#c9b77a]/40"
        } ${value ? "h-40" : "h-28"}`}
      >
        {value && (
          <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        <div className={`relative z-10 flex flex-col items-center gap-1 pointer-events-none ${value ? "text-[#c9b77a]/80" : "text-[#c9b77a]/30"}`}>
          {uploading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span className="text-[9px] tracking-widest uppercase">Uploading…</span>
            </>
          ) : value ? (
            <span className="text-[9px] tracking-widest uppercase">Click or drop to replace</span>
          ) : (
            <>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
              <span className="text-[9px] tracking-widest uppercase">Drop image or click to browse</span>
              <span className="text-[8px] text-[#c9b77a]/30">JPG, PNG, WebP — max 20 MB</span>
            </>
          )}
        </div>
        <input
          id={inputId}
          ref={el => { inputRef[1](el); }}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          data-testid={inputId}
        />
      </div>

      {error && <p className="text-[9px] text-red-400/70 tracking-wider">{error}</p>}

      <div className="flex items-center gap-2">
        <span className="text-[8px] text-[#c9b77a]/30 uppercase tracking-widest shrink-0">Or paste URL</span>
        <input
          className="admin-input text-xs"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... or /images/..."
          data-testid="input-gallery-src"
        />
      </div>
    </div>
  );
}

function AudioUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const BASE = import.meta.env.BASE_URL;

  const upload = async (file: File) => {
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}api/upload`, { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json() as { error?: string }; setError(j.error ?? "Upload failed"); return; }
      const { url } = await res.json() as { url: string };
      onChange(url);
    } catch { setError("Upload failed — check connection"); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const filename = value ? value.split("/").pop() : null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] tracking-[0.2em] text-[#c9b77a]/50 uppercase">Audio File</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("track-audio-input")?.click()}
        className={`border-2 border-dashed transition-colors duration-300 cursor-pointer flex items-center justify-center gap-3 h-16 px-4 ${
          dragging ? "border-[#c9b77a]/60 bg-[#c9b77a]/5" : value ? "border-[#c9b77a]/40" : "border-[#c9b77a]/20 hover:border-[#c9b77a]/40"
        }`}
      >
        {uploading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-[#c9b77a]/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <span className="text-[9px] tracking-widest uppercase text-[#c9b77a]/50">Uploading…</span>
          </>
        ) : value ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#c9b77a]/60 shrink-0"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <span className="text-[9px] tracking-[0.15em] text-[#c9b77a]/70 truncate max-w-xs">{filename}</span>
            <span className="text-[8px] text-[#c9b77a]/30 uppercase tracking-wider shrink-0">— click to replace</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#c9b77a]/30"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
            <span className="text-[9px] tracking-widest uppercase text-[#c9b77a]/30">Drop audio or click to browse</span>
            <span className="text-[8px] text-[#c9b77a]/20">MP3, WAV, OGG, AAC — max 100 MB</span>
          </>
        )}
        <input id="track-audio-input" type="file" accept="audio/*" className="hidden" onChange={handleFile} data-testid="track-audio-input" />
      </div>
      {error && <p className="text-[9px] text-red-400/70 tracking-wider">{error}</p>}
      {value && (
        <div className="flex items-center gap-3">
          <audio controls src={value} className="h-8 flex-1 opacity-70" style={{ filter: "sepia(1) saturate(0.3) hue-rotate(10deg)" }} />
          <button onClick={() => onChange("")} className="text-[8px] tracking-wider uppercase text-[#c9b77a]/30 hover:text-red-400/60 transition-colors">Remove</button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] tracking-[0.2em] text-[#c9b77a]/50 uppercase">{label}</label>
      {children}
    </div>
  );
}

function FormActions({ onSave, onCancel, saving, label }: { onSave: () => void; onCancel: () => void; saving: boolean; label: string }) {
  return (
    <div className="flex gap-4 pt-2">
      <button data-testid="btn-save" onClick={onSave} disabled={saving} className="btn-admin disabled:opacity-50">{saving ? "Saving..." : label}</button>
      <button data-testid="btn-cancel" onClick={onCancel} className="admin-action">Cancel</button>
    </div>
  );
}

function Loading() {
  return <div className="flex items-center justify-center py-24 text-[10px] tracking-widest text-[#c9b77a]/30 uppercase animate-pulse">Loading...</div>;
}

// ─── Activity log panel ───────────────────────────────────────────────────────
interface ActivityEntry {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  entityTitle: string | null;
  createdAt: string;
}

const ACTION_STYLES: Record<string, string> = {
  CREATE: "text-emerald-400/70 border-emerald-400/30",
  UPDATE: "text-[#c9b77a]/60 border-[#c9b77a]/20",
  DELETE: "text-red-400/60 border-red-400/20",
};

const ENTITY_LABELS: Record<string, string> = {
  track: "Track",
  poem: "Poem",
  touch: "Touch",
  sense: "Sense",
};

function ActivityPanel() {
  const { data: entries = [], isLoading, refetch } = useQuery<ActivityEntry[]>({
    queryKey: ["admin", "activity"],
    queryFn: () => fetch(`${BASE}api/admin/activity`).then(r => r.json()),
    refetchInterval: 15_000,
  });

  function fmtTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const secs = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">
          Activity Log {entries.length > 0 && `(${entries.length})`}
        </h2>
        <button
          onClick={() => refetch()}
          className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9b77a]/20">No activity yet</span>
          <span className="text-[9px] text-[#c9b77a]/15">Actions will appear here as you create, update, or delete content.</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {entries.map((e, i) => (
            <div
              key={e.id}
              className={`flex items-start gap-4 py-4 ${i < entries.length - 1 ? "border-b border-[#c9b77a]/8" : ""}`}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full border ${ACTION_STYLES[e.action] ?? "text-[#c9b77a]/30 border-[#c9b77a]/20"}`} style={{ background: "currentColor" }} />
                {i < entries.length - 1 && (
                  <div className="w-px flex-1 bg-[#c9b77a]/8 mt-2" style={{ minHeight: "20px" }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex items-baseline justify-between gap-4 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className={`text-[8px] tracking-[0.25em] uppercase border px-1.5 py-0.5 shrink-0 ${ACTION_STYLES[e.action] ?? "text-[#c9b77a]/30 border-[#c9b77a]/20"}`}>
                    {e.action}
                  </span>
                  <span className="text-[9px] tracking-[0.15em] text-[#c9b77a]/40 uppercase shrink-0">
                    {ENTITY_LABELS[e.entity] ?? e.entity}
                  </span>
                  {e.entityTitle && (
                    <span className="font-serif text-sm text-[#c9b77a]/70 italic truncate">
                      {e.entityTitle}
                    </span>
                  )}
                </div>
                <span className="text-[8px] tracking-wider text-[#c9b77a]/25 shrink-0 tabular-nums">
                  {fmtTime(e.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TOUCH Panel ─────────────────────────────────────────────────────────────

function TouchPanel() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery<AdminTouch[]>({ queryKey: adminTouchKey, queryFn: fetchAdminTouch });
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<AdminTouch, "id" | "sortOrder">>({ title: "", subtitle: null, description: "", imagePath: null, linkUrl: null, published: false });
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const ids = items.map(i => String(i.id));

  const invalidate = () => qc.invalidateQueries({ queryKey: adminTouchKey });

  const resetForm = () => { setForm({ title: "", subtitle: null, description: "", imagePath: null, linkUrl: null, published: false }); setAdding(false); setEditing(null); };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, subtitle: form.subtitle || null, imagePath: form.imagePath || null, linkUrl: form.linkUrl || null };
      if (editing != null) {
        await fetch(`${BASE}api/touch/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch(`${BASE}api/touch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      await invalidate();
      resetForm();
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this touch item?")) return;
    await fetch(`${BASE}api/touch/${id}`, { method: "DELETE" });
    await invalidate();
  };

  const togglePublish = async (item: AdminTouch) => {
    await fetch(`${BASE}api/touch/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !item.published }) });
    await invalidate();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => String(i.id) === active.id);
    const newIdx = items.findIndex(i => String(i.id) === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    qc.setQueryData(adminTouchKey, reordered);
    await fetch(`${BASE}api/touch/reorder`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: reordered.map(i => i.id) }) });
    await invalidate();
  };

  const startEdit = (item: AdminTouch) => { setForm({ title: item.title, subtitle: item.subtitle, description: item.description, imagePath: item.imagePath, linkUrl: item.linkUrl, published: item.published }); setEditing(item.id); setAdding(false); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg tracking-widest uppercase text-[#c9b77a]/70">Touch</h2>
        {!adding && editing == null && (
          <button onClick={() => { setAdding(true); setEditing(null); }} className="text-[9px] tracking-[0.25em] uppercase border border-[#c9b77a]/30 text-[#c9b77a]/60 hover:text-[#c9b77a] hover:border-[#c9b77a]/60 px-4 py-2 transition-colors duration-300">+ Add Item</button>
        )}
      </div>

      {(adding || editing != null) && (
        <TouchForm form={form} onChange={setForm} onSave={save} onCancel={resetForm} saving={saving} isEdit={editing != null} />
      )}

      {isLoading ? <p className="text-[10px] text-[#c9b77a]/30 tracking-widest">Loading…</p> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map(item => (
                <SortableTouchRow key={item.id} item={item} onEdit={startEdit} onDelete={del} onToggle={togglePublish} editing={editing} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableTouchRow({ item, onEdit, onDelete, onToggle, editing }: { item: AdminTouch; onEdit: (i: AdminTouch) => void; onDelete: (id: number) => void; onToggle: (i: AdminTouch) => void; editing: number | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 border p-3 transition-colors duration-200 ${editing === item.id ? "border-[#c9b77a]/50 bg-[#c9b77a]/5" : "border-[#c9b77a]/10 hover:border-[#c9b77a]/20 bg-[#161515]"}`}>
      <span {...attributes} {...listeners} className="cursor-grab text-[#c9b77a]/20 hover:text-[#c9b77a]/50 select-none text-lg leading-none">⠿</span>
      {item.imagePath && <img src={item.imagePath} alt="" className="w-10 h-10 object-cover opacity-80 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] tracking-widest uppercase text-[#c9b77a]/80 truncate">{item.title}</p>
        {item.subtitle && <p className="text-[9px] text-[#c9b77a]/40 tracking-wider truncate">{item.subtitle}</p>}
      </div>
      <span className={`text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5 ${item.published ? "text-[#c9b77a]/60 border-[#c9b77a]/20" : "text-[#c9b77a]/25 border-[#c9b77a]/10"}`}>{item.published ? "Live" : "Draft"}</span>
      <button onClick={() => onToggle(item)} className="text-[8px] tracking-widest uppercase text-[#c9b77a]/30 hover:text-[#c9b77a] transition-colors px-2">Toggle</button>
      <button onClick={() => onEdit(item)} className="text-[8px] tracking-widest uppercase text-[#c9b77a]/30 hover:text-[#c9b77a] transition-colors px-2">Edit</button>
      <button onClick={() => onDelete(item.id)} className="text-[8px] tracking-widest uppercase text-red-400/30 hover:text-red-400/70 transition-colors px-2">Del</button>
    </div>
  );
}

function TouchForm({ form, onChange, onSave, onCancel, saving, isEdit }: { form: Omit<AdminTouch, "id" | "sortOrder">; onChange: (f: Omit<AdminTouch, "id" | "sortOrder">) => void; onSave: () => void; onCancel: () => void; saving: boolean; isEdit: boolean }) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title"><input className="admin-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} placeholder="Work title" /></Field>
        <Field label="Subtitle"><input className="admin-input" value={form.subtitle ?? ""} onChange={e => onChange({ ...form, subtitle: e.target.value || null })} placeholder="e.g. Album / Series" /></Field>
        <Field label="Link URL"><input className="admin-input" value={form.linkUrl ?? ""} onChange={e => onChange({ ...form, linkUrl: e.target.value || null })} placeholder="https://..." /></Field>
      </div>
      <Field label="Description"><textarea className="admin-input h-20 resize-none" value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} /></Field>
      <ImageUploadField inputId="touch-image-input" value={form.imagePath ?? ""} onChange={v => onChange({ ...form, imagePath: v || null })} />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <div onClick={() => onChange({ ...form, published: !form.published })} className={`w-8 h-4 rounded-full transition-colors duration-300 ${form.published ? "bg-[#c9b77a]/60" : "bg-[#c9b77a]/10"}`}>
            <div className={`w-4 h-4 rounded-full bg-[#c9b77a] transition-transform duration-300 shadow ${form.published ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/50">{form.published ? "Published" : "Draft"}</span>
        </label>
        <div className="flex-1" />
        <button onClick={onCancel} className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors px-4 py-2">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.title} className="text-[9px] tracking-[0.2em] uppercase border border-[#c9b77a]/40 text-[#c9b77a]/70 hover:text-[#c9b77a] hover:border-[#c9b77a] transition-colors px-6 py-2 disabled:opacity-40">
          {saving ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}

// ─── SENSE Panel ──────────────────────────────────────────────────────────────

function SensePanel() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery<AdminSense[]>({ queryKey: adminSenseKey, queryFn: fetchAdminSense });
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<AdminSense, "id" | "sortOrder">>({ title: "", date: null, location: null, description: "", imagePath: null, linkUrl: null, published: false });
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const ids = items.map(i => String(i.id));

  const invalidate = () => qc.invalidateQueries({ queryKey: adminSenseKey });

  const resetForm = () => { setForm({ title: "", date: null, location: null, description: "", imagePath: null, linkUrl: null, published: false }); setAdding(false); setEditing(null); };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, date: form.date || null, location: form.location || null, imagePath: form.imagePath || null, linkUrl: form.linkUrl || null };
      if (editing != null) {
        await fetch(`${BASE}api/sense/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch(`${BASE}api/sense`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      await invalidate();
      resetForm();
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this sense item?")) return;
    await fetch(`${BASE}api/sense/${id}`, { method: "DELETE" });
    await invalidate();
  };

  const togglePublish = async (item: AdminSense) => {
    await fetch(`${BASE}api/sense/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !item.published }) });
    await invalidate();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => String(i.id) === active.id);
    const newIdx = items.findIndex(i => String(i.id) === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    qc.setQueryData(adminSenseKey, reordered);
    await fetch(`${BASE}api/sense/reorder`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: reordered.map(i => i.id) }) });
    await invalidate();
  };

  const startEdit = (item: AdminSense) => { setForm({ title: item.title, date: item.date, location: item.location, description: item.description, imagePath: item.imagePath, linkUrl: item.linkUrl, published: item.published }); setEditing(item.id); setAdding(false); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg tracking-widest uppercase text-[#c9b77a]/70">Sense</h2>
        {!adding && editing == null && (
          <button onClick={() => { setAdding(true); setEditing(null); }} className="text-[9px] tracking-[0.25em] uppercase border border-[#c9b77a]/30 text-[#c9b77a]/60 hover:text-[#c9b77a] hover:border-[#c9b77a]/60 px-4 py-2 transition-colors duration-300">+ Add Event</button>
        )}
      </div>

      {(adding || editing != null) && (
        <SenseForm form={form} onChange={setForm} onSave={save} onCancel={resetForm} saving={saving} isEdit={editing != null} />
      )}

      {isLoading ? <p className="text-[10px] text-[#c9b77a]/30 tracking-widest">Loading…</p> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map(item => (
                <SortableSenseRow key={item.id} item={item} onEdit={startEdit} onDelete={del} onToggle={togglePublish} editing={editing} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableSenseRow({ item, onEdit, onDelete, onToggle, editing }: { item: AdminSense; onEdit: (i: AdminSense) => void; onDelete: (id: number) => void; onToggle: (i: AdminSense) => void; editing: number | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 border p-3 transition-colors duration-200 ${editing === item.id ? "border-[#c9b77a]/50 bg-[#c9b77a]/5" : "border-[#c9b77a]/10 hover:border-[#c9b77a]/20 bg-[#161515]"}`}>
      <span {...attributes} {...listeners} className="cursor-grab text-[#c9b77a]/20 hover:text-[#c9b77a]/50 select-none text-lg leading-none">⠿</span>
      {item.imagePath && <img src={item.imagePath} alt="" className="w-10 h-10 object-cover opacity-80 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] tracking-widest uppercase text-[#c9b77a]/80 truncate">{item.title}</p>
        <p className="text-[9px] text-[#c9b77a]/40 tracking-wider">{[item.date, item.location].filter(Boolean).join(" · ")}</p>
      </div>
      <span className={`text-[8px] tracking-[0.2em] uppercase border px-2 py-0.5 ${item.published ? "text-[#c9b77a]/60 border-[#c9b77a]/20" : "text-[#c9b77a]/25 border-[#c9b77a]/10"}`}>{item.published ? "Live" : "Draft"}</span>
      <button onClick={() => onToggle(item)} className="text-[8px] tracking-widest uppercase text-[#c9b77a]/30 hover:text-[#c9b77a] transition-colors px-2">Toggle</button>
      <button onClick={() => onEdit(item)} className="text-[8px] tracking-widest uppercase text-[#c9b77a]/30 hover:text-[#c9b77a] transition-colors px-2">Edit</button>
      <button onClick={() => onDelete(item.id)} className="text-[8px] tracking-widest uppercase text-red-400/30 hover:text-red-400/70 transition-colors px-2">Del</button>
    </div>
  );
}

function SenseForm({ form, onChange, onSave, onCancel, saving, isEdit }: { form: Omit<AdminSense, "id" | "sortOrder">; onChange: (f: Omit<AdminSense, "id" | "sortOrder">) => void; onSave: () => void; onCancel: () => void; saving: boolean; isEdit: boolean }) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title"><input className="admin-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} placeholder="Event / Exhibition title" /></Field>
        <Field label="Date"><input className="admin-input" value={form.date ?? ""} onChange={e => onChange({ ...form, date: e.target.value || null })} placeholder="2025 / Spring" /></Field>
        <Field label="Location"><input className="admin-input" value={form.location ?? ""} onChange={e => onChange({ ...form, location: e.target.value || null })} placeholder="City, Venue" /></Field>
        <Field label="Link URL"><input className="admin-input" value={form.linkUrl ?? ""} onChange={e => onChange({ ...form, linkUrl: e.target.value || null })} placeholder="https://..." /></Field>
      </div>
      <Field label="Description"><textarea className="admin-input h-20 resize-none" value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} /></Field>
      <ImageUploadField inputId="sense-image-input" value={form.imagePath ?? ""} onChange={v => onChange({ ...form, imagePath: v || null })} />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <div onClick={() => onChange({ ...form, published: !form.published })} className={`w-8 h-4 rounded-full transition-colors duration-300 ${form.published ? "bg-[#c9b77a]/60" : "bg-[#c9b77a]/10"}`}>
            <div className={`w-4 h-4 rounded-full bg-[#c9b77a] transition-transform duration-300 shadow ${form.published ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/50">{form.published ? "Published" : "Draft"}</span>
        </label>
        <div className="flex-1" />
        <button onClick={onCancel} className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors px-4 py-2">Cancel</button>
        <button onClick={onSave} disabled={saving || !form.title} className="text-[9px] tracking-[0.2em] uppercase border border-[#c9b77a]/40 text-[#c9b77a]/70 hover:text-[#c9b77a] hover:border-[#c9b77a] transition-colors px-6 py-2 disabled:opacity-40">
          {saving ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}
