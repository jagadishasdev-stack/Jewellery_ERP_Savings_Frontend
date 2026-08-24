import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import theme from "../theme";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

// Image with pinch-zoom, double-tap zoom and drag-to-pan while zoomed in.
function ZoomableImage({ src, zoom, setZoom }) {
  const imgRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const lastTapRef = useRef(0);

  // Back at 1x the image always sits centred again.
  useEffect(() => {
    if (zoom <= MIN_ZOOM) setPos({ x: 0, y: 0 });
  }, [zoom]);

  const gap = (t) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  // Never let the image be dragged past its own edges.
  const clampPos = (p, z) => {
    const el = imgRef.current;
    if (!el) return p;
    const maxX = (el.offsetWidth * (z - 1)) / 2;
    const maxY = (el.offsetHeight * (z - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, p.x)),
      y: Math.min(maxY, Math.max(-maxY, p.y)),
    };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { gap: gap(e.touches), zoom };
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < 300) setZoom(zoom > MIN_ZOOM ? MIN_ZOOM : 2);
    lastTapRef.current = now;
    if (zoom > MIN_ZOOM) {
      panRef.current = {
        x: e.touches[0].clientX - pos.x,
        y: e.touches[0].clientY - pos.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      setZoom(
        clampZoom(
          pinchRef.current.zoom * (gap(e.touches) / pinchRef.current.gap)
        )
      );
    } else if (panRef.current && zoom > MIN_ZOOM) {
      setPos(
        clampPos(
          {
            x: e.touches[0].clientX - panRef.current.x,
            y: e.touches[0].clientY - panRef.current.y,
          },
          zoom
        )
      );
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current = null;
    panRef.current = null;
  };

  return (
    <Box
      ref={imgRef}
      component="img"
      src={src}
      alt="Profile"
      draggable={false}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
        userSelect: "none",
        touchAction: "none",
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
        transition: "transform 0.12s ease-out",
      }}
    />
  );
}

/**
 * Profile photo popup — view, zoom and change the picture.
 * Picking a photo only shows a preview here; nothing is uploaded until Save.
 */
function ProfilePhotoDialog({
  open,
  onClose,
  imageUrl,
  previewUrl,
  initialZoom = MIN_ZOOM,
  uploading = false,
  onPick,
  onSave,
  onDiscard,
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);

  // Start every visit (and every newly picked photo) at the requested zoom.
  useEffect(() => {
    if (open) setZoom(initialZoom);
  }, [open, initialZoom, previewUrl]);

  // Android hardware back closes this screen first — same hook the product
  // image viewer uses, so the page underneath is not navigated away.
  useEffect(() => {
    if (!open) return undefined;
    window.__IMAGE_VIEWER_CLOSE__ = onClose;
    return () => {
      window.__IMAGE_VIEWER_CLOSE__ = null;
    };
  }, [open, onClose]);

  const shownUrl = previewUrl || imageUrl;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", m: 2 } }}
    >
      {/* Header — title + close */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1,
          borderBottom: "1px solid #eee",
        }}
      >
        <Typography sx={{ flex: 1, fontSize: "0.9rem", fontWeight: 600 }}>
          {previewUrl ? "Preview Photo" : "Profile Photo"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Photo — zoom stays inside this box, the page behind stays visible */}
      <Box
        sx={{
          position: "relative",
          height: 260,
          bgcolor: "#f4f4f4",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {shownUrl ? (
          <ZoomableImage src={shownUrl} zoom={zoom} setZoom={setZoom} />
        ) : (
          <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
            No photo added yet
          </Typography>
        )}

        {shownUrl && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              display: "flex",
              bgcolor: "rgba(0,0,0,0.45)",
              borderRadius: 5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
              disabled={zoom <= MIN_ZOOM}
              sx={{ color: "#fff", "&.Mui-disabled": { color: "#888" } }}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
              disabled={zoom >= MAX_ZOOM}
              sx={{ color: "#fff", "&.Mui-disabled": { color: "#888" } }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Actions — only rendered when there is something to do (edit allowed) */}
      {(previewUrl || onPick) && (
        <Box sx={{ display: "flex", gap: 1.5, p: 2 }}>
          {previewUrl ? (
            <>
              <Button
                fullWidth
                variant="outlined"
                disabled={uploading}
                onClick={onDiscard}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                disabled={uploading}
                onClick={onSave}
                startIcon={
                  uploading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
                sx={{
                  bgcolor: theme.colors.primaryButton,
                  textTransform: "none",
                }}
              >
                {uploading ? "Saving..." : "Save Photo"}
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={onPick}
              startIcon={<PhotoCameraIcon />}
              sx={{
                bgcolor: theme.colors.primaryButton,
                textTransform: "none",
              }}
            >
              {imageUrl ? "Change Photo" : "Add Photo"}
            </Button>
          )}
        </Box>
      )}
    </Dialog>
  );
}

export default ProfilePhotoDialog;
