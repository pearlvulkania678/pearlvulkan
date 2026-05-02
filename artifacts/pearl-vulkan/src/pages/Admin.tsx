import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  useListTracks,
  useCreateTrack,
  useUpdateTrack,
  useDeleteTrack,
  useListPoems,
  useCreatePoem,
  useUpdatePoem,
  useDeletePoem,
  useListGallery,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  getListTracksQueryKey,
  getListPoemsQueryKey,
  getListGalleryQueryKey,
} from "@workspace/api-client-react";

const SESSION_KEY = "pv_admin_auth";

type Tab = "tracks" | "poems" | "gallery";

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
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) { onSuccess(); }
      else { setError("Wrong passphrase."); setPw(""); }
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
          <input
            data-testid="admin-password-input"
            type="password"
            autoFocus
            value={pw}
            onChange={e => setPw(e.target.value)}
            className="admin-input"
            placeholder="••••••••••••"
          />
          {error && <p className="text-[9px] tracking-wider text-red-400/70">{error}</p>}
        </div>
        <button type="submit" disabled={loading || !pw} data-testid="admin-login-btn" className="btn-admin disabled:opacity-30 text-center">
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>("tracks");
  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); window.location.reload(); };

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
          <button onClick={handleLogout} className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors">Sign out</button>
        </div>
      </header>
      <main className="px-8 py-10 max-w-4xl mx-auto">
        {tab === "tracks" && <TracksPanel />}
        {tab === "poems" && <PoemsPanel />}
        {tab === "gallery" && <GalleryPanel />}
      </main>
    </div>
  );
}

// ─── Drag handle icon ────────────────────────────────────────────────────────

function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`cursor-grab active:cursor-grabbing text-[#c9b77a]/20 hover:text-[#c9b77a]/50 transition-colors select-none px-1 ${props.className ?? ""}`}>
      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
        <circle cx="3" cy="4"  r="1.5" /><circle cx="9" cy="4"  r="1.5" />
        <circle cx="3" cy="10" r="1.5" /><circle cx="9" cy="10" r="1.5" />
        <circle cx="3" cy="16" r="1.5" /><circle cx="9" cy="16" r="1.5" />
      </svg>
    </div>
  );
}

// ─── Tracks ──────────────────────────────────────────────────────────────────

function TracksPanel() {
  const qc = useQueryClient();
  const { data: tracks = [], isLoading } = useListTracks();
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", genre: "", duration: "", description: "", imagePath: "", hasListen: false });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: getListTracksQueryKey() });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tracks.findIndex(t => t.id === active.id);
    const newIndex = tracks.findIndex(t => t.id === over.id);
    const reordered = arrayMove(tracks, oldIndex, newIndex);
    // Optimistic update
    qc.setQueryData(getListTracksQueryKey(), reordered);
    // Persist new sortOrders
    reordered.forEach((t, i) => {
      if (t.sortOrder !== i) {
        updateTrack.mutate({ id: t.id, data: { sortOrder: i } }, { onSuccess: invalidate });
      }
    });
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

  const handleDelete = (id: number) => {
    if (!confirm("Delete this track?")) return;
    deleteTrack.mutate({ id }, { onSuccess: invalidate });
  };

  const startEdit = (t: typeof tracks[0]) => {
    setEditing(t.id);
    setForm({ title: t.title, genre: t.genre, duration: t.duration, description: t.description, imagePath: t.imagePath ?? "", hasListen: t.hasListen });
  };

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
                onStartEdit={() => startEdit(t)}
                onCancelEdit={() => setEditing(null)}
                onSave={() => handleUpdate(t.id)}
                onDelete={() => handleDelete(t.id)}
                onChange={setForm}
                saving={updateTrack.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableTrackRow({ track, isEditing, form, onStartEdit, onCancelEdit, onSave, onDelete, onChange, saving }: {
  track: { id: number; title: string; genre: string; duration: string; description: string; imagePath: string | null; hasListen: boolean };
  isEditing: boolean;
  form: { title: string; genre: string; duration: string; description: string; imagePath: string; hasListen: boolean };
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (f: typeof form) => void;
  saving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined };

  return (
    <div ref={setNodeRef} style={style} data-testid={`track-row-${track.id}`} className="border border-[#c9b77a]/15 flex">
      <DragHandle {...attributes} {...listeners} className="flex items-center py-5 pl-3 pr-1 border-r border-[#c9b77a]/10" />
      <div className="flex-1 p-4">
        {isEditing ? (
          <TrackForm form={form} onChange={onChange} onSave={onSave} onCancel={onCancelEdit} saving={saving} label="Save" />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-lg text-[#c9b77a]">{track.title}</span>
                <span className="text-[10px] tracking-widest text-[#c9b77a]/50">{track.duration}</span>
              </div>
              <span className="text-[9px] tracking-[0.2em] text-[#c9b77a]/60 uppercase">{track.genre}</span>
              <p className="text-xs text-[#c9b77a]/40 mt-1 leading-relaxed line-clamp-2">{track.description}</p>
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

// ─── Poems ───────────────────────────────────────────────────────────────────

function PoemsPanel() {
  const qc = useQueryClient();
  const { data: poems = [], isLoading } = useListPoems();
  const createPoem = useCreatePoem();
  const updatePoem = useUpdatePoem();
  const deletePoem = useDeletePoem();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: getListPoemsQueryKey() });
  const parseTags = (s: string) => s.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = poems.findIndex(p => p.id === active.id);
    const newIndex = poems.findIndex(p => p.id === over.id);
    const reordered = arrayMove(poems, oldIndex, newIndex);
    qc.setQueryData(getListPoemsQueryKey(), reordered);
    reordered.forEach((p, i) => {
      if (p.sortOrder !== i) updatePoem.mutate({ id: p.id, data: { sortOrder: i } }, { onSuccess: invalidate });
    });
  };

  const handleCreate = () => {
    createPoem.mutate(
      { data: { title: form.title || null, content: form.content, tags: parseTags(form.tags) } },
      { onSuccess: () => { invalidate(); setAdding(false); setForm({ title: "", content: "", tags: "" }); } }
    );
  };

  const handleUpdate = (id: number) => {
    updatePoem.mutate(
      { id, data: { title: form.title || null, content: form.content, tags: parseTags(form.tags) } },
      { onSuccess: () => { invalidate(); setEditing(null); } }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this poem?")) return;
    deletePoem.mutate({ id }, { onSuccess: invalidate });
  };

  const startEdit = (p: typeof poems[0]) => {
    setEditing(p.id);
    setForm({ title: p.title ?? "", content: p.content, tags: p.tags.join(", ") });
  };

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
                onStartEdit={() => startEdit(p)}
                onCancelEdit={() => setEditing(null)}
                onSave={() => handleUpdate(p.id)}
                onDelete={() => handleDelete(p.id)}
                onChange={setForm}
                saving={updatePoem.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePoemRow({ poem, isEditing, form, onStartEdit, onCancelEdit, onSave, onDelete, onChange, saving }: {
  poem: { id: number; title: string | null; content: string; tags: string[]; sortOrder: number };
  isEditing: boolean;
  form: { title: string; content: string; tags: string };
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (f: typeof form) => void;
  saving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: poem.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined };

  return (
    <div ref={setNodeRef} style={style} data-testid={`poem-row-${poem.id}`} className="border border-[#c9b77a]/15 flex">
      <DragHandle {...attributes} {...listeners} className="flex items-center py-5 pl-3 pr-1 border-r border-[#c9b77a]/10" />
      <div className="flex-1 p-4">
        {isEditing ? (
          <PoemForm form={form} onChange={onChange} onSave={onSave} onCancel={onCancelEdit} saving={saving} label="Save" />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {poem.title && <span className="font-serif text-base italic text-[#c9b77a]">{poem.title}</span>}
              <pre className="text-xs text-[#c9b77a]/50 whitespace-pre-wrap font-sans leading-relaxed line-clamp-3">{poem.content}</pre>
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

// ─── Gallery ─────────────────────────────────────────────────────────────────

function GalleryPanel() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useListGallery();
  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ src: "", caption: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: getListGalleryQueryKey() });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(g => g.id === active.id);
    const newIndex = items.findIndex(g => g.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    qc.setQueryData(getListGalleryQueryKey(), reordered);
    reordered.forEach((g, i) => {
      if (g.sortOrder !== i) updateItem.mutate({ id: g.id, data: { sortOrder: i } }, { onSuccess: invalidate });
    });
  };

  const handleCreate = () => {
    createItem.mutate(
      { data: { src: form.src, caption: form.caption } },
      { onSuccess: () => { invalidate(); setAdding(false); setForm({ src: "", caption: "" }); } }
    );
  };

  const handleUpdate = (id: number) => {
    updateItem.mutate(
      { id, data: { src: form.src, caption: form.caption } },
      { onSuccess: () => { invalidate(); setEditing(null); } }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this gallery item?")) return;
    deleteItem.mutate({ id }, { onSuccess: invalidate });
  };

  const startEdit = (item: typeof items[0]) => {
    setEditing(item.id);
    setForm({ src: item.src, caption: item.caption });
  };

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
            {items.map(item => (
              <SortableGalleryRow
                key={item.id}
                item={item}
                isEditing={editing === item.id}
                form={form}
                onStartEdit={() => startEdit(item)}
                onCancelEdit={() => setEditing(null)}
                onSave={() => handleUpdate(item.id)}
                onDelete={() => handleDelete(item.id)}
                onChange={setForm}
                saving={updateItem.isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableGalleryRow({ item, isEditing, form, onStartEdit, onCancelEdit, onSave, onDelete, onChange, saving }: {
  item: { id: number; src: string; caption: string; sortOrder: number };
  isEditing: boolean;
  form: { src: string; caption: string };
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (f: typeof form) => void;
  saving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined };

  return (
    <div ref={setNodeRef} style={style} data-testid={`gallery-row-${item.id}`} className="border border-[#c9b77a]/15 flex">
      <DragHandle {...attributes} {...listeners} className="flex items-center py-4 pl-3 pr-1 border-r border-[#c9b77a]/10" />
      <div className="flex-1 p-4">
        {isEditing ? (
          <GalleryForm form={form} onChange={onChange} onSave={onSave} onCancel={onCancelEdit} saving={saving} label="Save" />
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-20 h-16 overflow-hidden bg-[#1a1919] shrink-0">
              <img src={item.src} alt={item.caption} className="w-full h-full object-cover opacity-70 grayscale" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] tracking-[0.25em] text-[#c9b77a]/60 uppercase">{item.caption}</span>
            </div>
            <div className="flex gap-3 shrink-0">
              <button data-testid={`edit-gallery-${item.id}`} onClick={onStartEdit} className="admin-action">Edit</button>
              <button data-testid={`delete-gallery-${item.id}`} onClick={onDelete} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared form components ──────────────────────────────────────────────────

function TrackForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; genre: string; duration: string; description: string; imagePath: string; hasListen: boolean };
  onChange: (f: typeof form) => void;
  onSave: () => void; onCancel: () => void; saving: boolean; label: string;
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
  onChange: (f: typeof form) => void;
  onSave: () => void; onCancel: () => void; saving: boolean; label: string;
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
  onChange: (f: typeof form) => void;
  onSave: () => void; onCancel: () => void; saving: boolean; label: string;
}) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515]">
      <Field label="Image URL or Path"><input data-testid="input-gallery-src" className="admin-input" value={form.src} onChange={e => onChange({ ...form, src: e.target.value })} placeholder="/images/see-1.png or https://..." /></Field>
      <Field label="Caption"><input data-testid="input-gallery-caption" className="admin-input" value={form.caption} onChange={e => onChange({ ...form, caption: e.target.value })} placeholder="STUDY IN AMBER" /></Field>
      {form.src && <div className="w-32 h-20 overflow-hidden bg-[#1a1919]"><img src={form.src} alt="preview" className="w-full h-full object-cover opacity-70" /></div>}
      <FormActions onSave={onSave} onCancel={onCancel} saving={saving} label={label} />
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
