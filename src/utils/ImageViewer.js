import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { useSafeAreaTop } from "../SafeAreaFile";
export default function ImageViewer({ open, onClose, images = [], title = "" }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const topInset = useSafeAreaTop(); 
  const trackRef = useRef(null);
  
  useEffect(() => {
    if (open) {
      setCurrentIdx(0);
      setTimeout(() => {
        if (trackRef.current) trackRef.current.scrollTop = 0;
      }, 50);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const scrollTop = trackRef.current.scrollTop;
    const children = trackRef.current.children;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < children.length; i++) {
      const dist = Math.abs(children[i].offsetTop - scrollTop);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    setCurrentIdx(closest);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#1a1a1a", display: "flex", flexDirection: "column",
      paddingTop: topInset,
    }}>
      {/* Header */}
      <div style={{
        position: "absolute", top: topInset, left: 0, right: 0, zIndex: 10,
        // paddingTop: topInset ? `calc(12px + ${topInset})` : "12px",
        padding: "6px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        pointerEvents: "none",
      }}>
        <button
          onClick={onClose}
          style={{
            background: "rgba(0,0,0,0.45)", border: "none", color: "#fff",
            width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "auto",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        <span style={{ color: "#fff", fontSize: 18, fontWeight: 500, flex: 1, textAlign: "center", margin: "0 8px" }}>
          {title}
        </span>

        {images.length > 1 ? (
          <span style={{
            color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500,
            background: "rgba(0,0,0,0.4)", padding: "3px 8px", borderRadius: 10,
            pointerEvents: "auto", flexShrink: 0,
          }}>
            {currentIdx + 1} / {images.length}
          </span>
        ) : <div style={{ width: 36 }} />}
      </div>
{/* const safeTop = topInset ? `calc(52px + ${typeof topInset === "number" ? topInset + "px" : topInset})` : "52px"; */}

      {/* PDF scroll container */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          // ✅ padding so first image clears the header
          paddingTop: topInset ? `calc(22px + ${typeof topInset === "number" ? topInset + "px" : topInset})` : "52px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        {images.map((img, i) => (
          <PinchSlide
            key={i}
            src={img?.url || img}
            alt={`Page ${i + 1}`}
            pageNum={i + 1}
            total={images.length}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

// ─── PDF Page Slide ────────────────────────────────────────────────────────────
function PinchSlide({ src, alt, pageNum, total }) {
  const imgRef = useRef(null);
  const stateRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const lastTapRef = useRef(0);

  const applyTransform = useCallback(() => {
    if (!imgRef.current) return;
    const { scale, tx, ty } = stateRef.current;
    imgRef.current.style.transform = `scale(${scale}) translate(${tx / scale}px, ${ty / scale}px)`;
  }, []);

  const clamp = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const { scale } = stateRef.current;
    const maxTx = (img.offsetWidth * (scale - 1)) / 2;
    const maxTy = (img.offsetHeight * (scale - 1)) / 2;
    stateRef.current.tx = Math.max(-maxTx, Math.min(maxTx, stateRef.current.tx));
    stateRef.current.ty = Math.max(-maxTy, Math.min(maxTy, stateRef.current.ty));
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const t = e.touches;
      pinchRef.current = {
        startDist: Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY),
        startScale: stateRef.current.scale,
      };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        e.preventDefault();
        if (stateRef.current.scale > 1.1) {
          stateRef.current = { scale: 1, tx: 0, ty: 0 };
          if (imgRef.current) imgRef.current.style.touchAction = "pan-y";
        } else {
          stateRef.current.scale = 2.5;
          if (imgRef.current) imgRef.current.style.touchAction = "none";
        }
        applyTransform();
      }
      lastTapRef.current = now;
      if (stateRef.current.scale > 1.05) {
        panRef.current = {
          startX: e.touches[0].clientX - stateRef.current.tx,
          startY: e.touches[0].clientY - stateRef.current.ty,
        };
      }
    }
  }, [applyTransform]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const t = e.touches;
      const dist = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      stateRef.current.scale = Math.min(5, Math.max(1, pinchRef.current.startScale * (dist / pinchRef.current.startDist)));
      if (stateRef.current.scale <= 1.02) {
        stateRef.current.tx = 0; stateRef.current.ty = 0;
        if (imgRef.current) imgRef.current.style.touchAction = "pan-y";
      } else {
        if (imgRef.current) imgRef.current.style.touchAction = "none";
      }
      applyTransform();
    } else if (e.touches.length === 1 && panRef.current && stateRef.current.scale > 1.05) {
      e.preventDefault();
      stateRef.current.tx = e.touches[0].clientX - panRef.current.startX;
      stateRef.current.ty = e.touches[0].clientY - panRef.current.startY;
      clamp();
      applyTransform();
    }
  }, [applyTransform, clamp]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) {
      panRef.current = null;
      if (stateRef.current.scale < 1.05) {
        stateRef.current = { scale: 1, tx: 0, ty: 0 };
        applyTransform();
        if (imgRef.current) imgRef.current.style.touchAction = "pan-y";
      }
    }
  }, [applyTransform]);

  return (
    // ✅ outer box: full width, natural height, NO overflow hidden
    <div style={{
      width: "100%",
      marginBottom: 6,        // gap between pages
      position: "relative",
      background: "#000",
    }}>
      {/* ✅ inner box: clips zoom overflow without affecting layout */}
      <div style={{
        width: "100%",
        overflow: "hidden",   // clips zoomed image within this page only
        lineHeight: 0,        // removes inline gap under img
      }}>
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transformOrigin: "center top", // ✅ zoom from top so it doesn't shift up
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "pan-y",
            transition: "transform 0.05s",
          }}
          draggable={false}
        />
      </div>

      {/* Page badge */}
      {total > 1 && (
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(0,0,0,0.55)", color: "#fff",
          fontSize: 11, padding: "2px 8px", borderRadius: 10,
          pointerEvents: "none",
        }}>
          {pageNum} / {total}
        </div>
      )}
    </div>
  );
}