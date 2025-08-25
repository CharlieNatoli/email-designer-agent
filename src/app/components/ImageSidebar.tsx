"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UploadItem = {
  name: string; // filename stored under public/uploads
};

const DragAndDropArea = (
  { 
    onDrop, uploadBoxBorder, inputRef, onInputChange, setIsDragging 
  }: { 
    onDrop: (e: React.DragEvent) => void, 
    uploadBoxBorder: string, 
    inputRef: React.RefObject<HTMLInputElement | null>,  
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    setIsDragging: (isDragging: boolean) => void 
  }
) => {
  return (

    <div
    onDragOver={(e) => {
      e.preventDefault();
      setIsDragging(true);
    }}
    onDragLeave={() => setIsDragging(false)}
    onDrop={onDrop}
    style={{
      margin: 14,
      padding: 8,
      paddingTop: 32,
      paddingBottom: 32,
      border: uploadBoxBorder,
      borderRadius: 8,
      textAlign: "center",
      color: "#c9c9d1",
      cursor: "pointer",
    }}
    onClick={() => inputRef.current?.click()}
  >
    <div style={{ fontSize: 16, opacity: 0.85 }}>Drag images here</div>
    <div style={{ fontSize: 14, opacity: 0.55, marginTop: 4 }}>or click to browse</div>
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={onInputChange}
      style={{ display: "none" }}
    />
  </div>
)
}


// TODO - why is image upload so slow?
const AnalyzingImageNotice = () => {
  const styles = {
    overlay: { 
      position: "absolute" as const,
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: 6,
    },
    text: {
      position: "absolute" as const,
      bottom: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      background: 'rgba(0, 0, 0, 0.4)',
      padding: '8px 16px',
      borderRadius: 20,
      backdropFilter: 'blur(5px)',
      animation: 'analyzingPulse 1.2s ease-in-out infinite',  
    },  
  };

  return (
    <div 
        
    style={{
      ...styles.overlay
    }}
    > 
      <div style={styles.text}> 
          <span>Analyzing image</span> 
      </div>
      <style jsx global>{`
        @keyframes analyzingPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.03); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};


const ImagePreview = (
  { item, onPreview, readyIds, onDelete }: { item: UploadItem, onPreview: (item: UploadItem) => void, readyIds: Set<string>, onDelete: (name: string) => void | Promise<void> }
) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const id = item.name.split(".")[0];
  const isReady = readyIds.has(id);

  console.log("isReady", isReady);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(item.name)}
      onMouseLeave={() => setHovered((h) => (h === item.name ? null : h))}
    >
      <button
        onClick={() => onPreview(item)}
        style={{
          width: "100%",
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <img
          src={`/uploads/${item.name}`}
          alt={item.name}
          className="thumb"
        />
      </button>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 6, left: 6 }}>
          <img src="/file.svg" alt="file" style={{ width: 16, height: 16, opacity: 0.9 }} />
        </div>
        {!isReady ? <AnalyzingImageNotice /> : null}
        <DeleteButton
          hovered={hovered}
          item={item}
          handleDelete={onDelete}
        />
      </div>
    </div>
  );
}

const DeleteButton = ({ hovered, item, handleDelete }: { hovered: string | null, item: UploadItem, handleDelete: (name: string) => void | Promise<void> }) => {
  return (
    <div style={{ position: "absolute", right: 6, bottom: 6 }}>
      <div style={{ pointerEvents: "auto", visibility: hovered === item.name ? "visible" : "hidden" }}>
        <button
          onClick={() => handleDelete(item.name)}
          title="Delete"
          className="btn"
          style={{
            background: "rgba(0,0,0,0.55)",
            border: "1px solid #444",
            color: "#f3b1b1",
            borderRadius: 30,
            width: 30,
            height: 30,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

type ImageListProps = {
  items: UploadItem[];
  setPreview: (item: UploadItem | null | ((prev: UploadItem | null) => UploadItem | null)) => void;
  readyIds: Set<string>;
  handleDelete: (name: string) => void | Promise<void>;
};

const ImageList = ({ items, setPreview, readyIds, handleDelete }: ImageListProps) => {
  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: 8,
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 8,
      alignContent: "start",
    }}>
      {items.map((item) => (
        <ImagePreview
          key={item.name}
          item={item}
          onPreview={(it) => setPreview(it)}
          readyIds={readyIds}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

const ImagePreviewPopout = ({ item, onClose }: { item: UploadItem, onClose: () => void }) => {
  return (
    <div
      onClick={onClose}
      className="backdrop"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-dark"
        style={{ maxWidth: "80vw", maxHeight: "80vh" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#c9c9d1", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60vw" }}>{item.name}</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#ddd", fontSize: 20, cursor: "pointer" }}>
            ×
          </button>
        </div>
        <div style={{ overflow: "auto" }}>
          <img src={`/uploads/${item.name}`} alt={item.name} style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }} />
        </div>
      </div>
    </div>
  );
}

export default function ImageSidebar() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<UploadItem | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [readyIds, setReadyIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/uploads", { cache: "no-store" });
      const data = await res.json();
      setItems((data.files ?? []).map((name: string) => ({ name })));
      const ids = new Set<string>((data.infoIds ?? []) as string[]);
      setReadyIds(ids);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll for readiness while any uploaded images are still being analyzed
  useEffect(() => {
    const itemIds = new Set(items.map((it) => it.name.split(".")[0]));
    if (itemIds.size === 0) return;

    const allReady = Array.from(itemIds).every((id) => readyIds.has(id));
    if (allReady) return;

    const interval = setInterval(() => {
      const nowAllReady = Array.from(itemIds).every((id) => readyIds.has(id));
      if (nowAllReady) {
        clearInterval(interval);
        return;
      }
      refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [items, readyIds, refresh]);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const form = new FormData();
    for (const f of files) form.append("file", f);
    await fetch("/api/uploads", { method: "POST", body: form });
    await refresh();
  }, [refresh]);

  const onInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const form = new FormData();
    for (const f of files) form.append("file", f);
    await fetch("/api/uploads", { method: "POST", body: form });
    e.target.value = "";
    await refresh();
  }, [refresh]);

  const handleDelete = useCallback(async (name: string) => {
    await fetch(`/api/uploads?file=${encodeURIComponent(name)}`, { method: "DELETE" });
    setPreview((p) => (p && p.name === name ? null : p));
    await refresh();
  }, [refresh]);

  const uploadBoxBorder = useMemo(() => (isDragging ? "2px dashed #77aaff" : "2px dashed #3f4147"), [isDragging]);

  // TOOD - fix loading state + make prettier
  return (
    <div
      style={{
        width: 200,
        backgroundColor: "var(--surface-3)",
        borderRight: "1px solid var(--border-dark-2)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DragAndDropArea 
        onDrop={onDrop} 
        inputRef={inputRef} 
        uploadBoxBorder={uploadBoxBorder} 
        onInputChange={onInputChange} 
      setIsDragging={setIsDragging} 
      />  
      <ImageList 
        items={items}
        setPreview={setPreview}
        readyIds={readyIds}
        handleDelete={handleDelete}
      />
      {preview && (
        <ImagePreviewPopout item={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}


