"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SmartImage } from "@/components/smart-image";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface Props {
  images: GalleryImage[];
  altPrefix: string;
}

export default function ToolGallery({ images, altPrefix }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null);
  const lightboxImgRef = useRef<HTMLImageElement>(null);

  const active = images[activeIndex];
  const prev = prevIndex !== null ? images[prevIndex] : null;

  // Cross-fade hero swap
  const selectHero = useCallback(
    (i: number) => {
      if (i === activeIndex) return;
      setPrevIndex(activeIndex);
      setActiveIndex(i);
      setTimeout(() => setPrevIndex(null), 260);
    },
    [activeIndex],
  );

  // Open lightbox
  const openLightbox = useCallback(
    (i: number) => {
      setLightboxIndex(i);
      setLightboxOpen(true);
    },
    [],
  );

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLoupePos(null);
  }, []);

  // Navigate lightbox
  const goPrev = useCallback(() => {
    setLightboxIndex((c) => (c - 1 + images.length) % images.length);
    setLoupePos(null);
  }, [images.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((c) => (c + 1) % images.length);
    setLoupePos(null);
  }, [images.length]);

  // Keyboard
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  // Body scroll lock
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [lightboxOpen]);

  // Preload adjacent images
  useEffect(() => {
    if (!lightboxOpen) return;
    const preload = (i: number) => {
      const idx = (i + images.length) % images.length;
      const img = new window.Image();
      img.src = images[idx].url;
    };
    preload(lightboxIndex - 1);
    preload(lightboxIndex + 1);
  }, [lightboxOpen, lightboxIndex, images]);

  // Loupe handler
  const handleLoupeMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const rect = lightboxImgRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setLoupePos({ x: clientX, y: clientY });
    },
    [],
  );

  if (images.length === 0) return null;

  const lightboxImg = images[lightboxIndex];

  return (
    <>
      {/* Hero area */}
      <div className="w-full">
        <div
          className="relative w-full aspect-[4/3] rounded-2xl bg-wood/5 overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(activeIndex)}
        >
          {/* Previous image (fading out) */}
          {prev && (
            <div className="absolute inset-0 gallery-fade-out">
              {prev.width && prev.height ? (
                <SmartImage
                  src={prev.url}
                  alt={prev.alt ?? altPrefix}
                  width={prev.width}
                  height={prev.height}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover"
                />
              ) : (
                <SmartImage
                  src={prev.url}
                  alt={prev.alt ?? altPrefix}
                  aspectRatio="4/3"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full"
                />
              )}
            </div>
          )}

          {/* Active image (fading in) */}
          <div className={`absolute inset-0 ${prevIndex !== null ? "gallery-fade-in" : ""}`}>
            {active.width && active.height ? (
              <SmartImage
                src={active.url}
                alt={active.alt ?? altPrefix}
                width={active.width}
                height={active.height}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="w-full h-full object-cover"
              />
            ) : (
              <SmartImage
                src={active.url}
                alt={active.alt ?? altPrefix}
                aspectRatio="4/3"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="w-full h-full"
              />
            )}
          </div>

          {/* Click to inspect pill */}
          <div className="absolute bottom-3 right-3 bg-wood/70 text-cream text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Click to inspect
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => selectHero(i)}
                className={`aspect-[4/3] rounded-lg overflow-hidden ${
                  i === activeIndex
                    ? "ring-2 ring-amber ring-offset-2 ring-offset-cream"
                    : "opacity-70 hover:opacity-100"
                } transition-all`}
              >
                <SmartImage
                  src={img.url}
                  alt={img.alt ?? `${altPrefix} thumbnail ${i + 1}`}
                  aspectRatio="4/3"
                  sizes="(max-width: 768px) 25vw, 12vw"
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-wood/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-cream/80 hover:text-cream z-10 p-2"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-cream/60 text-sm z-10">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream z-10 p-2"
              aria-label="Previous"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream z-10 p-2"
              aria-label="Next"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          )}

          {/* Main lightbox image with loupe */}
          <div
            className="relative max-w-[85vw] max-h-[75vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleLoupeMove}
            onTouchMove={handleLoupeMove}
            onMouseLeave={() => setLoupePos(null)}
            onTouchEnd={() => setLoupePos(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={lightboxImgRef}
              src={lightboxImg.url}
              alt={lightboxImg.alt ?? altPrefix}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />

            {/* Loupe */}
            {loupePos && lightboxImgRef.current && (() => {
              const rect = lightboxImgRef.current.getBoundingClientRect();
              const relX = ((loupePos.x - rect.left) / rect.width) * 100;
              const relY = ((loupePos.y - rect.top) / rect.height) * 100;

              return (
                <div
                  className="pointer-events-none fixed rounded-full border-2 border-cream/40 shadow-2xl"
                  style={{
                    width: 220,
                    height: 220,
                    left: loupePos.x - 110,
                    top: loupePos.y - 110,
                    backgroundImage: `url(${lightboxImg.url})`,
                    backgroundSize: `${rect.width * 2.5}px ${rect.height * 2.5}px`,
                    backgroundPosition: `${relX}% ${relY}%`,
                  }}
                />
              );
            })()}
          </div>

          {/* Hint text */}
          <p className="text-cream/40 text-xs tracking-widest uppercase mt-4">
            Move over image to inspect
          </p>

          {/* Filmstrip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                    setLoupePos(null);
                  }}
                  className={`w-14 h-14 rounded-md overflow-hidden ${
                    i === lightboxIndex
                      ? "ring-2 ring-amber ring-offset-1 ring-offset-wood/95"
                      : "opacity-50 hover:opacity-80"
                  } transition-all`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt ?? `${altPrefix} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .gallery-fade-in {
          animation: galleryFadeIn 260ms ease-in-out forwards;
        }
        .gallery-fade-out {
          animation: galleryFadeOut 260ms ease-in-out forwards;
        }
        @keyframes galleryFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes galleryFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </>
  );
}
