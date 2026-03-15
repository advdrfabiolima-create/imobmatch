"use client";

import { useState } from "react";
import { Building2, X, ChevronLeft, ChevronRight, Image } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="md:col-span-2 aspect-video bg-gray-200 flex items-center justify-center rounded-2xl mb-8">
        <Building2 className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  const PREVIEW_COUNT = 6;
  const preview = photos.slice(0, PREVIEW_COUNT);
  const remaining = photos.length - PREVIEW_COUNT;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = () =>
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length));
  const next = () =>
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % photos.length));

  return (
    <>
      {/* Grade 2×3 — primeiras 6 fotos */}
      <div className="grid grid-cols-2 gap-3 mb-4 rounded-2xl overflow-hidden">
        {preview.map((photo, i) => (
          <div
            key={i}
            onClick={() => openLightbox(i)}
            className="relative aspect-[4/3] bg-gray-200 cursor-pointer group overflow-hidden"
          >
            <img
              src={photo}
              alt={`${title} — foto ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay na última foto quando há mais */}
            {i === PREVIEW_COUNT - 1 && remaining > 0 && !showAll && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
                className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white gap-1 hover:bg-black/65 transition"
              >
                <Image className="h-7 w-7" />
                <span className="text-sm font-semibold">+{remaining} fotos</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Fotos restantes (após clicar "+X fotos") */}
      {showAll && remaining > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {photos.slice(5).map((photo, i) => (
            <div
              key={i + 5}
              onClick={() => openLightbox(i + 5)}
              className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={photo}
                alt={`${title} — foto ${i + 6}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Contador de fotos */}
      {photos.length > 1 && (
        <p className="text-xs text-gray-400 mb-8 text-right">
          {photos.length} foto{photos.length > 1 ? "s" : ""}
          {!showAll && remaining > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="ml-2 text-blue-500 hover:underline"
            >
              Ver todas ({photos.length})
            </button>
          )}
        </p>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Fechar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Anterior */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Imagem */}
          <img
            src={photos[lightboxIndex]}
            alt={`${title} — foto ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Próximo */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Contador */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
