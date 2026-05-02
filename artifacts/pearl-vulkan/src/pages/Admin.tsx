import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
      if (res.ok) {
        onSuccess();
      } else {
        setError("Wrong passphrase.");
        setPw("");
      }
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
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
        <button
          type="submit"
          disabled={loading || !pw}
          data-testid="admin-login-btn"
          className="btn-admin disabled:opacity-30 text-center"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>("tracks");

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#111010] text-[#c9b77a] font-sans">
      <header className="border-b border-[#c9b77a]/20 px-8 py-6 flex items-center justify-between">
        <div>
          <a href="/" className="text-[10px] tracking-[0.3em] text-[#c9b77a]/50 uppercase hover:text-[#c9b77a] transition-colors">
            &larr; Pearl Vulkan
          </a>
          <h1 className="font-serif text-2xl tracking-widest uppercase mt-1">Admin</h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex gap-6">
            {(["tracks", "poems", "gallery"] as Tab[]).map((t) => (
              <button
                key={t}
                data-testid={`tab-${t}`}
                onClick={() => setTab(t)}
                className={`text-[10px] tracking-[0.2em] uppercase transition-colors pb-1 ${
                  tab === t
                    ? "text-[#c9b77a] border-b border-[#c9b77a]"
                    : "text-[#c9b77a]/40 hover:text-[#c9b77a]/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="text-[9px] tracking-[0.2em] uppercase text-[#c9b77a]/30 hover:text-[#c9b77a]/60 transition-colors"
          >
            Sign out
          </button>
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

function TracksPanel() {
  const qc = useQueryClient();
  const { data: tracks = [], isLoading } = useListTracks();
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", genre: "", duration: "", description: "", imagePath: "", hasListen: false });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListTracksQueryKey() });

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
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">Music Tracks ({tracks.length})</h2>
        <button data-testid="add-track" onClick={() => { setAdding(true); setEditing(null); }} className="btn-admin">+ Add Track</button>
      </div>

      {adding && (
        <TrackForm
          form={form}
          onChange={setForm}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={createTrack.isPending}
          label="Create"
        />
      )}

      <div className="flex flex-col gap-4">
        {tracks.map((t) => (
          <div key={t.id} data-testid={`track-row-${t.id}`} className="border border-[#c9b77a]/15 p-5">
            {editing === t.id ? (
              <TrackForm
                form={form}
                onChange={setForm}
                onSave={() => handleUpdate(t.id)}
                onCancel={() => setEditing(null)}
                saving={updateTrack.isPending}
                label="Save"
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-baseline gap-4">
                    <span className="font-serif text-lg text-[#c9b77a]">{t.title}</span>
                    <span className="text-[10px] tracking-widest text-[#c9b77a]/50">{t.duration}</span>
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
        ))}
      </div>
    </div>
  );
}

function TrackForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; genre: string; duration: string; description: string; imagePath: string; hasListen: boolean };
  onChange: (f: typeof form) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  label: string;
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

function PoemsPanel() {
  const qc = useQueryClient();
  const { data: poems = [], isLoading } = useListPoems();
  const createPoem = useCreatePoem();
  const updatePoem = useUpdatePoem();
  const deletePoem = useDeletePoem();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListPoemsQueryKey() });

  const parseTags = (s: string) => s.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);

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
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">Poems ({poems.length})</h2>
        <button data-testid="add-poem" onClick={() => { setAdding(true); setEditing(null); }} className="btn-admin">+ Add Poem</button>
      </div>

      {adding && (
        <PoemForm form={form} onChange={setForm} onSave={handleCreate} onCancel={() => setAdding(false)} saving={createPoem.isPending} label="Create" />
      )}

      <div className="flex flex-col gap-4">
        {poems.map((p) => (
          <div key={p.id} data-testid={`poem-row-${p.id}`} className="border border-[#c9b77a]/15 p-5">
            {editing === p.id ? (
              <PoemForm form={form} onChange={setForm} onSave={() => handleUpdate(p.id)} onCancel={() => setEditing(null)} saving={updatePoem.isPending} label="Save" />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {p.title && <span className="font-serif text-base italic text-[#c9b77a]">{p.title}</span>}
                  <pre className="text-xs text-[#c9b77a]/50 whitespace-pre-wrap font-sans leading-relaxed line-clamp-4">{p.content}</pre>
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
        ))}
      </div>
    </div>
  );
}

function PoemForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { title: string; content: string; tags: string };
  onChange: (f: typeof form) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  label: string;
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

function GalleryPanel() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useListGallery();
  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ src: "", caption: "" });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListGalleryQueryKey() });

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
        <h2 className="text-xs tracking-[0.3em] uppercase text-[#c9b77a]/60">Gallery ({items.length})</h2>
        <button data-testid="add-gallery" onClick={() => { setAdding(true); setEditing(null); }} className="btn-admin">+ Add Image</button>
      </div>

      {adding && (
        <GalleryForm form={form} onChange={setForm} onSave={handleCreate} onCancel={() => setAdding(false)} saving={createItem.isPending} label="Create" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} data-testid={`gallery-row-${item.id}`} className="border border-[#c9b77a]/15 p-4">
            {editing === item.id ? (
              <GalleryForm form={form} onChange={setForm} onSave={() => handleUpdate(item.id)} onCancel={() => setEditing(null)} saving={updateItem.isPending} label="Save" />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="aspect-video overflow-hidden bg-[#1a1919]">
                  <img src={item.src} alt={item.caption} className="w-full h-full object-cover opacity-70 grayscale" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-[0.25em] text-[#c9b77a]/60 uppercase">{item.caption}</span>
                  <div className="flex gap-3">
                    <button data-testid={`edit-gallery-${item.id}`} onClick={() => startEdit(item)} className="admin-action">Edit</button>
                    <button data-testid={`delete-gallery-${item.id}`} onClick={() => handleDelete(item.id)} className="admin-action text-red-400/60 hover:text-red-400">Del</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryForm({ form, onChange, onSave, onCancel, saving, label }: {
  form: { src: string; caption: string };
  onChange: (f: typeof form) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="border border-[#c9b77a]/30 p-5 flex flex-col gap-4 bg-[#161515] col-span-2">
      <Field label="Image URL or Path"><input data-testid="input-gallery-src" className="admin-input" value={form.src} onChange={e => onChange({ ...form, src: e.target.value })} placeholder="/images/see-1.png or https://..." /></Field>
      <Field label="Caption"><input data-testid="input-gallery-caption" className="admin-input" value={form.caption} onChange={e => onChange({ ...form, caption: e.target.value })} placeholder="STUDY IN AMBER" /></Field>
      {form.src && (
        <div className="w-32 h-32 overflow-hidden bg-[#1a1919]">
          <img src={form.src} alt="preview" className="w-full h-full object-cover opacity-70" />
        </div>
      )}
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
      <button data-testid="btn-save" onClick={onSave} disabled={saving} className="btn-admin disabled:opacity-50">
        {saving ? "Saving..." : label}
      </button>
      <button data-testid="btn-cancel" onClick={onCancel} className="admin-action">Cancel</button>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-[10px] tracking-widest text-[#c9b77a]/30 uppercase animate-pulse">
      Loading...
    </div>
  );
}
