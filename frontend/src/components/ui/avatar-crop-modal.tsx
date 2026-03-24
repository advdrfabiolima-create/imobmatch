"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarCropModalProps {
  src: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const SIZE = 256;

export function AvatarCropModal({ src, onConfirm, onCancel }: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState({ w: 1, h: 1 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Scale so the shortest side fills the container at zoom=1
  const baseScale = Math.max(SIZE / natural.w, SIZE / natural.h);
  const dispW = natural.w * baseScale;
  const dispH = natural.h * baseScale;

  // Clamp offset so no whitespace shows inside the circle
  const clamp = useCallback(
    (ox: number, oy: number, z: number) => ({
      x: Math.max(-(dispW * z - SIZE) / 2, Math.min((dispW * z - SIZE) / 2, ox)),
      y: Math.max(-(dispH * z - SIZE) / 2, Math.min((dispH * z - SIZE) / 2, oy)),
    }),
    [dispW, dispH],
  );

  const onLoad = () => {
    if (imgRef.current) setNatural({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
  };

  /* ── drag (mouse) ── */
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => clamp(prev.x + dx, prev.y + dy, zoom));
    },
    [zoom, clamp],
  );
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  /* ── drag (touch) ── */
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragging.current) return;
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset((prev) => clamp(prev.x + dx, prev.y + dy, zoom));
    },
    [zoom, clamp],
  );
  const onTouchEnd = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  const changeZoom = (z: number) => {
    setZoom(z);
    setOffset((prev) => clamp(prev.x, prev.y, z));
  };

  const confirm = () => {
    if (!imgRef.current || natural.w === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;

    // Effective pixel scale: how many screen pixels per source pixel
    const s = baseScale * zoom;
    // Source region that maps to the SIZE×SIZE canvas
    const srcX = natural.w / 2 - SIZE / (2 * s) - offset.x / s;
    const srcY = natural.h / 2 - SIZE / (2 * s) - offset.y / s;
    const srcW = SIZE / s;
    const srcH = SIZE / s;

    ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, SIZE, SIZE);
    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Ajustar foto</h3>
          <button onClick={onCancel} className="p-1 hover:bg-accent rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop area */}
        <div
          className="mx-auto mb-3 rounded-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ width: SIZE, height: SIZE, border: "3px solid #6366f1", position: "relative" }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop preview"
            draggable={false}
            onLoad={onLoad}
            style={{
              position: "absolute",
              // Fix the image at its natural centered position; zoom/pan via transform only
              left: SIZE / 2 - dispW / 2,
              top:  SIZE / 2 - dispH / 2,
              width:  dispW,
              height: dispH,
              // transform is atomic and GPU-accelerated — avoids mid-frame distortion
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground mb-4">Arraste para reposicionar a imagem</p>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => changeZoom(Math.max(1, +(zoom - 0.1).toFixed(2)))}
            className="p-1 hover:bg-accent rounded transition"
          >
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
          </button>
          <input
            type="range" min="1" max="3" step="0.05"
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <button
            onClick={() => changeZoom(Math.min(3, +(zoom + 0.1).toFixed(2)))}
            className="p-1 hover:bg-accent rounded transition"
          >
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button onClick={confirm} className="flex-1">Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
