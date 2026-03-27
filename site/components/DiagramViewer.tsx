'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface DiagramViewerProps {
  imagePath: string;
  alt: string;
}

export default function DiagramViewer({ imagePath, alt }: DiagramViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track pinch distance for mobile
  const lastPinchDist = useRef<number | null>(null);

  const clampZoom = (z: number) => Math.min(5, Math.max(1, z));

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (zoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Scroll-wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom((prev) => clampZoom(prev + delta));
    },
    []
  );

  // Mouse drag for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile pinch-to-zoom and pan
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist.current = Math.hypot(dx, dy);
      } else if (e.touches.length === 1 && zoom > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y,
        });
      }
    },
    [zoom, pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / lastPinchDist.current;
        setZoom((prev) => clampZoom(prev * scale));
        lastPinchDist.current = dist;
      } else if (e.touches.length === 1 && isDragging) {
        setPan({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastPinchDist.current = null;
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">
          {zoom.toFixed(1)}x zoom
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => clampZoom(z - 0.5))}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-sm rounded border border-border bg-surface text-foreground hover:border-accent transition-colors"
            aria-label="Zoom out"
          >
            &minus;
          </button>
          <button
            onClick={() => setZoom((z) => clampZoom(z + 0.5))}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-sm rounded border border-border bg-surface text-foreground hover:border-accent transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={resetView}
            className="min-h-[44px] px-3 py-2 text-sm rounded border border-border bg-surface text-foreground hover:border-accent transition-colors"
            aria-label="Reset zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-border bg-white select-none"
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in', touchAction: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={imagePath}
          alt={alt}
          draggable={false}
          className="w-full h-auto block"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        />
      </div>

      <p className="text-xs text-muted">
        Scroll to zoom &middot; Drag to pan &middot; Pinch on mobile
      </p>
    </div>
  );
}
