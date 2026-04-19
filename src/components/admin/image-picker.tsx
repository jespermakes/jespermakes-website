"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Image } from "@/lib/db/schema";

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (image: Image) => void;
  initialQuery?: string;
}

export function ImagePicker({ open, onClose, onPick, initialQuery = "" }: ImagePickerProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const fetchImages = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    const res = await fetch(`/api/admin/images?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setImages(data.images);
    }
    setLoading(false);
  }, [debounced, open]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        onPick(data.image);
        onClose();
      }
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-wood/40 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-cream border border-wood/10 rounded-2xl max-w-5xl w-full mt-8 mb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-5 border-b border-wood/8">
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
              Pick an image
            </div>
            <div className="font-serif text-xl text-wood mt-0.5">
              From the library, or upload a new one
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-wood text-cream rounded-xl px-4 py-2 text-xs font-semibold hover:bg-wood-light disabled:opacity-50"
            >
              {uploading ? "Uploading & tagging\u2026" : "+ Upload new"}
            </button>
            <button
              onClick={onClose}
              className="text-sm text-wood-light/60 hover:text-wood px-2"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-5">
          <input
            type="text"
            placeholder="Search by filename, description, tag\u2026"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-white border border-wood/12 rounded-xl px-4 py-2.5 text-sm text-wood placeholder:text-wood-light/40 focus:outline-none focus:border-wood/30 mb-4"
          />

          {loading && !images.length && (
            <div className="text-center py-12 text-sm text-wood-light/40">Loading\u2026</div>
          )}

          {!loading && !images.length && (
            <div className="text-center py-12 text-sm text-wood-light/50">
              No images match. Upload one above.
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  onPick(img);
                  onClose();
                }}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-forest transition-all text-left"
                title={img.description ?? img.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.description ?? img.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {!img.reviewed && (
                  <span
                    className="absolute top-2 right-2 w-2.5 h-2.5 bg-forest rounded-full border-2 border-white"
                    title="Unreviewed — tags may be inaccurate"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] text-white/90 line-clamp-2 leading-snug">
                    {img.description || img.filename}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
