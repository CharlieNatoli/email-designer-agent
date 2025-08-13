"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UploadItem = {
  name: string; // filename stored under public/uploads
};

export default function ImageSidebar() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<UploadItem | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
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

  return (
    <div
      style={{
        width: 150,
        backgroundColor: "#1e1f24",
        borderRight: "1px solid #2a2b31",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          margin: 8,
          padding: 8,
          border: uploadBoxBorder,
          borderRadius: 8,
          textAlign: "center",
          color: "#c9c9d1",
          cursor: "pointer",
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{ fontSize: 12, opacity: 0.85 }}>Drag images here</div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>or click to browse</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onInputChange}
          style={{ display: "none" }}
        />
      </div>

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
          <div
            key={item.name}
            style={{ position: "relative" }}
            onMouseEnter={() => setHovered(item.name)}
            onMouseLeave={() => setHovered((h) => (h === item.name ? null : h))}
          >
            <button
              onClick={() => setPreview(item)}
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
                style={{ width: "100%", height: 84, objectFit: "cover", borderRadius: 6, border: "1px solid #2d2f36" }}
              />
            </button>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 6, left: 6 }}>
                <img src="/file.svg" alt="file" style={{ width: 16, height: 16, opacity: 0.9 }} />
              </div>
              {(() => {
                const id = item.name.split(".")[0];
                const isReady = readyIds.has(id);
                if (isReady) return null;
                return (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", borderRadius: 6 }}>
                    <div
                      aria-label="Analyzing image"
                      style={{
                        width: 28,
                        height: 28,
                        border: "3px solid rgba(255,255,255,0.18)",
                        borderTopColor: "#7b86ff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  </div>
                );
              })()}
              <div style={{ position: "absolute", right: 6, bottom: 6 }}>
                <div style={{ pointerEvents: "auto", visibility: hovered === item.name ? "visible" : "hidden" }}>
                  <button
                    onClick={() => handleDelete(item.name)}
                    title="Delete"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid #444",
                      color: "#f3b1b1",
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#181a1f",
              border: "1px solid #2a2b31",
              borderRadius: 10,
              maxWidth: "80vw",
              maxHeight: "80vh",
              padding: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ color: "#c9c9d1", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60vw" }}>{preview.name}</div>
              <button onClick={() => setPreview(null)} style={{ background: "transparent", border: "none", color: "#ddd", fontSize: 20, cursor: "pointer" }}>
                ×
              </button>
            </div>
            <div style={{ overflow: "auto" }}>
              <img src={`/uploads/${preview.name}`} alt={preview.name} style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


