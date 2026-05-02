import { useState } from "react";
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

const SESSION_KEY = "pv_admin_auth";
const BASE = import.meta.env.BASE_URL;

type Tab = "tracks" | "poems" | "gallery";

// ─── Types matching DB shape ──────────────────────────────────────────────────
interface AdminTrack { id: number; title: string; genre: string; duration: string; description: string; imagePath: string | null; hasListen: boolean; published: boolean; sortOrder: number; }
interface AdminPoem  { id: number; title: string | null; content: string; tags: string[]; published: boolean; sortOrder: number; }
interface AdminGallery { id: number; src: string; caption: string; published: boolean; sortOrder: number; }

// ─── Admin-specific fetchers (see all, incl. drafts) ────────────────────────
const fetchAdminTracks  = () => fetch(`${BASE}api/admin/tracks`).then(r => r.json()) as Promise<AdminTrack[]>;
const fetchAdminPoems   = () => fetch(`${BASE}api/admin/poems`).then(r => r.json())  as Promise<AdminPoem[]>;
const fetchAdminGallery = () => fetch(`${BASE}api/admin/gallery`).then(r => r.json()) as Promise<AdminGallery[]>;

const adminTracksKey  = ["admin", "tracks"]  as const;
const adminPoemsKey   = ["admin", "poems"]   as const;
const adminGalleryKey = ["admin", "gallery"] as const;

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
          <div className="flex gap-6">
            {(["tracks", "poems", "gallery"] as Tab[]).map(t => (
              <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)}
                className={`text-[10px] tracking-[0.2em] uppercase transition-colors pb-1 ${tab === t ? "text-[#c9b77a] border-b border-[#c9b77a]" : "text-[#c9b77a]/40 hover:text-[#c9b77a]/70"}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); window.location.reload(); }} className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors">Sign out</button>
        </div>
      </header>
      <main className="px-8 py-10 max-w-4xl mx-auto">
        {tab === "tracks"  && <TracksPanel />}
        {tab === "poems"   && <PoemsPanel />}
        {tab === "gallery" && <GalleryPanel />}
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
  const [form, setForm] = useState({ title: "", genre: "", duration: "", description: "", imagePath: "", hasListen: false });

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
      { data: { title: form.title, genre: form.genre, duration: form.duration, description: form.description, imagePath: form.imagePath || null, hasListen: form.hasListen } },
      { onSuccess: () => { invalidate(); setAdding(false); setForm({ title: "", genre: "", duration: "", description: "", imagePath: "", hasListen: false }); } }
    );
  };

  const handleUpdate = (id: number) => {
    updateTrack.mutate(
      { id, data: { title: form.title, genre: form.genre, duration: form.duration, description: form.description, imagePath: form.imagePath || null, hasListen: form.hasListen } },
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

  const startEdit = (t: AdminTrack) => { setEditing(t.id); setForm({ title: t.title, genre: t.genre, duration: t.duration, description: t.description, imagePath: t.imagePath ?? "", hasListen: t.hasListen }); };

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
            {tracks.map(t => {
              const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableItem(t.id);
              return (
                <div key={t.id} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
                  data-testid={`track-row-${t.id}`} className="border border-[#c9b77a]/15 flex">
                  <DragHandle {...attributes} {...listeners} />
                  <div className="flex-1 p-4">
                    {editing === t.id ? (
                      <TrackForm form={form} onChange={setForm} onSave={() => handleUpdate(t.id)} onCancel={() => setEditing(null)} saving={updateTrack.isPending} label="Save" />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className={`font-serif text-lg ${t.published ? "text-[#c9b77a]" : "text-[#c9b77a]/40"}`}>{t.title}</span>
                            <span className="text-[10px] tracking-widest text-[#c9b77a]/50">{t.duration}</span>
                            <PublishToggle published={t.published} onToggle={() => handleTogglePublish(t)} saving={updateTrack.isPending} />
                          </div>
                          <span className="text-[9px] tracking-[0.2em] text-[#c9b77a]/60 uppercase">{t.genre}</span>
                          <p className="text-xs text-[#c9b77a]/40 mt-1 leading-relaxed line-clamp-2">{t.description}</p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                          <button data-testid={`edit-track-${t.id}`} onClick={() => startEdit(t)} className="admin-action">Edit</button>
                          <button data-testid={`delete-track-${t.id}`} onClick={() => handleDelete(t.id)} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
            {poems.map(p => {
              const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableItem(p.id);
              return (
                <div key={p.id} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
                  data-testid={`poem-row-${p.id}`} className="border border-[#c9b77a]/15 flex">
                  <DragHandle {...attributes} {...listeners} />
                  <div className="flex-1 p-4">
                    {editing === p.id ? (
                      <PoemForm form={form} onChange={setForm} onSave={() => handleUpdate(p.id)} onCancel={() => setEditing(null)} saving={updatePoem.isPending} label="Save" />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            {p.title && <span className={`font-serif text-base italic ${p.published ? "text-[#c9b77a]" : "text-[#c9b77a]/40"}`}>{p.title}</span>}
                            <PublishToggle published={p.published} onToggle={() => handleTogglePublish(p)} saving={updatePoem.isPending} />
                          </div>
                          <pre className={`text-xs whitespace-pre-wrap font-sans leading-relaxed line-clamp-3 ${p.published ? "text-[#c9b77a]/50" : "text-[#c9b77a]/25"}`}>{p.content}</pre>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {p.tags.map(tag => <span key={tag} className="text-[9px] tracking-widest text-[#c9b77a]/40 border border-[#c9b77a]/20 px-2 py-0.5">{tag}</span>)}
                          </div>
                        </div>
                        <div className="flex gap-3 shrink-0">
                          <button data-testid={`edit-poem-${p.id}`} onClick={() => startEdit(p)} className="admin-action">Edit</button>
                          <button data-testid={`delete-poem-${p.id}`} onClick={() => handleDelete(p.id)} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Gallery panel ────────────────────────────────────────────────────────────
function GalleryPanel() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: adminGalleryKey, queryFn: fetchAdminGallery });
  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ src: "", caption: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: adminGalleryKey });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(items, items.findIndex(g => g.id === active.id), items.findIndex(g => g.id === over.id));
    qc.setQueryData(adminGalleryKey, reordered);
    reordered.forEach((g, i) => { if (g.sortOrder !== i) updateItem.mutate({ id: g.id, data: { sortOrder: i } }, { onSuccess: invalidate }); });
  };

  const handleCreate = () => {
    createItem.mutate({ data: { src: form.src, caption: form.caption } }, { onSuccess: () => { invalidate(); setAdding(false); setForm({ src: "", caption: "" }); } });
  };

  const handleUpdate = (id: number) => {
    updateItem.mutate({ id, data: { src: form.src, caption: form.caption } }, { onSuccess: () => { invalidate(); setEditing(null); } });
  };

  const handleTogglePublish = (g: AdminGallery) => {
    updateItem.mutate({ id: g.id, data: { published: !g.published } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this gallery item?")) return;
    deleteItem.mutate({ id }, { onSuccess: invalidate });
  };

  const startEdit = (item: AdminGallery) => { setEditing(item.id); setForm({ src: item.src, caption: item.caption }); };

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">Gallery ({items.length})</h2>
          <span className="text-[9px] text-[#c9b77a]/25 tracking-wider">drag to reorder</span>
        </div>
        <button data-testid="add-gallery" onClick={() => { setAdding(true); setEditing(null); }} className="btn-admin">+ Add Image</button>
      </div>

      {adding && <GalleryForm form={form} onChange={setForm} onSave={handleCreate} onCancel={() => setAdding(false)} saving={createItem.isPending} label="Create" />}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(g => g.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {items.map(item => {
              const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableItem(item.id);
              return (
                <div key={item.id} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
                  data-testid={`gallery-row-${item.id}`} className="border border-[#c9b77a]/15 flex">
                  <DragHandle {...attributes} {...listeners} />
                  <div className="flex-1 p-4">
                    {editing === item.id ? (
                      <GalleryForm form={form} onChange={setForm} onSave={() => handleUpdate(item.id)} onCancel={() => setEditing(null)} saving={updateItem.isPending} label="Save" />
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className={`w-20 h-16 overflow-hidden bg-[#1a1919] shrink-0 ${!item.published ? "opacity-30" : ""}`}>
                          <img src={item.src} alt={item.caption} className="w-full h-full object-cover grayscale" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <span className={`text-[9px] tracking-[0.25em] uppercase ${item.published ? "text-[#c9b77a]/60" : "text-[#c9b77a]/25"}`}>{item.caption}</span>
                          <PublishToggle published={item.published} onToggle={() => handleTogglePublish(item)} saving={updateItem.isPending} />
                        </div>
                        <div className="flex gap-3 shrink-0">
                          <button data-testid={`edit-gallery-${item.id}`} onClick={() => startEdit(item)} className="admin-action">Edit</button>
                          <button data-testid={`delete-gallery-${item.id}`} onClick={() => handleDelete(item.id)} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Hook helper ──────────────────────────────────────────────────────────────
function useSortableItem(id: number) {
  return useSortable({ id });
}

// ─── Shared form components ───────────────────────────────────────────────────
function TrackForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; genre: string; duration: string; description: string; imagePath: string; hasListen: boolean };
  onChange: (f: typeof form) => void; onSave: () => void; onCancel: () => void; saving: boolean; label: string;
}) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title"><input data-testid="input-title" className="admin-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} /></Field>
        <Field label="Genre"><input data-testid="input-genre" className="admin-input" value={form.genre} onChange={e => onChange({ ...form, genre: e.target.value })} placeholder="AMBIENT / DRONE" /></Field>
        <Field label="Duration"><input data-testid="input-duration" className="admin-input" value={form.duration} onChange={e => onChange({ ...form, duration: e.target.value })} placeholder="3:24" /></Field>
        <Field label="Image Path"><input data-testid="input-image" className="admin-input" value={form.imagePath} onChange={e => onChange({ ...form, imagePath: e.target.value })} placeholder="/images/listen-1.png" /></Field>
      </div>
      <Field label="Description"><textarea data-testid="input-description" className="admin-input h-20 resize-none" value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} /></Field>
      <label className="flex items-center gap-2 text-xs text-[#c9b77a]/60 cursor-pointer">
        <input type="checkbox" checked={form.hasListen} onChange={e => onChange({ ...form, hasListen: e.target.checked })} className="accent-[#c9b77a]" />
        Show Listen button
      </label>
      <FormActions onSave={onSave} onCancel={onCancel} saving={saving} label={label} />
    </div>
  );
}

function PoemForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; content: string; tags: string };
  onChange: (f: typeof form) => void; onSave: () => void; onCancel: () => void; saving: boolean; label: string;
}) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <Field label="Title (optional)"><input data-testid="input-poem-title" className="admin-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} /></Field>
      <Field label="Content"><textarea data-testid="input-poem-content" className="admin-input h-40 resize-none font-serif" value={form.content} onChange={e => onChange({ ...form, content: e.target.value })} /></Field>
      <Field label="Tags (comma separated)"><input data-testid="input-poem-tags" className="admin-input" value={form.tags} onChange={e => onChange({ ...form, tags: e.target.value })} placeholder="POETRY, UKRAINIAN, VULCANSALUT" /></Field>
      <FormActions onSave={onSave} onCancel={onCancel} saving={saving} label={label} />
    </div>
  );
}

function GalleryForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { src: string; caption: string };
  onChange: (f: typeof form) => void; onSave: () => void; onCancel: () => void; saving: boolean; label: string;
}) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <ImageUploadField
        value={form.src}
        onChange={src => onChange({ ...form, src })}
      />
      <Field label="Caption">
        <input
          data-testid="input-gallery-caption"
          className="admin-input"
          value={form.caption}
          onChange={e => onChange({ ...form, caption: e.target.value })}
          placeholder="STUDY IN AMBER"
        />
      </Field>
      <FormActions onSave={onSave} onCancel={onCancel} saving={saving} label={label} />
    </div>
  );
}

function ImageUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
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
        onClick={() => document.getElementById("gallery-file-input")?.click()}
        className={`relative border-2 border-dashed transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden ${
          dragging ? "border-[#c9b77a]/60 bg-[#c9b77a]/5" : "border-[#c9b77a]/20 hover:border-[#c9b77a]/40"
        } ${value ? "h-40" : "h-28"}`}
      >
        {value && (
          <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" />
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
          id="gallery-file-input"
          ref={el => { inputRef[1](el); }}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          data-testid="gallery-file-input"
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
