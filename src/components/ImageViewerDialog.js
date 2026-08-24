import React, { useState, useRef, useEffect } from "react";
import { Dialog, Box } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import theme from "../theme";

const ImageViewerDialog = ({ openViewer, setOpenViewer, product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);

  const imageRef = useRef(null);
  const images = product.images || [];

  // Swipe + pan tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  // For pinch zoom
  const initialDistance = useRef(0);
  const initialScale = useRef(1);

  // For panning
  const lastTranslate = useRef({ x: 0, y: 0 });

  // Clamp the pan offset so the image can never be dragged past its own edges.
  // Scaling is about the element centre, so the max travel on each axis is
  // half of the overflow (scaled size − container size). As the user zooms
  // OUT, this bound shrinks and re-centres the image instead of leaving it
  // stuck off to one side. Returns {0,0} once the image fits (scale ≈ 1).
  const clampTranslate = (x, y, s) => {
    const el = imageRef.current;
    if (!el) return { x, y };
    const maxX = Math.max(0, (el.offsetWidth * s - window.innerWidth) / 2);
    const maxY = Math.max(0, (el.offsetHeight * s - window.innerHeight) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  // Reset zoom/pan whenever the viewer opens or the image changes, so a new
  // image never inherits a leftover zoom/pan from the previous one.
  useEffect(() => {
    if (openViewer) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      lastTranslate.current = { x: 0, y: 0 };
    }
  }, [openViewer, currentImage]);

  // Let the Android hardware back button close the viewer (one step) instead
  // of falling through to the app's global back handler, which would navigate
  // away from the product page. The global handler checks this flag first.
  useEffect(() => {
    if (openViewer) {
      window.__IMAGE_VIEWER_CLOSE__ = () => setOpenViewer(false);
    } else {
      window.__IMAGE_VIEWER_CLOSE__ = null;
    }
    return () => {
      window.__IMAGE_VIEWER_CLOSE__ = null;
    };
  }, [openViewer, setOpenViewer]);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchEndX.current = touch.clientX;
      isDragging.current = false;
    } else if (e.touches.length === 2) {
      // Pinch start
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX.current;
      const dy = touch.clientY - touchStartY.current;

      // If zoomed in => Pan (clamped to the image edges)
      if (scale > 1) {
        isDragging.current = true;
        setTranslate(
          clampTranslate(
            lastTranslate.current.x + dx,
            lastTranslate.current.y + dy,
            scale
          )
        );
      }
      // If not zoomed => Track for swipe
      else {
        if (Math.abs(dx) > 10) isDragging.current = true;
        touchEndX.current = touch.clientX;
      }
    } else if (e.touches.length === 2) {
      // Handle pinch zoom
      const newDistance = getDistance(e.touches);
      const zoomFactor = newDistance / initialDistance.current;
      const newScale = Math.min(
        Math.max(initialScale.current * zoomFactor, 1),
        3
      );
      setScale(newScale);
      // Re-clamp the pan for the new scale so zooming out pulls the image
      // back into view instead of leaving it stuck to one side.
      setTranslate((prev) => clampTranslate(prev.x, prev.y, newScale));
    }
  };

  const handleTouchEnd = () => {
    if (scale === 1) {
      // Swipe navigation
      if (
        isDragging.current &&
        Math.abs(touchStartX.current - touchEndX.current) > 50
      ) {
        if (touchStartX.current > touchEndX.current) {
          // Swiped left
          setCurrentImage((prev) => (prev + 1) % images.length);
        } else {
          // Swiped right
          setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
        }
      }
    } else {
      // Zoomed in: persist the (clamped) pan so the next drag continues here.
      const persisted = clampTranslate(translate.x, translate.y, scale);
      lastTranslate.current = persisted;
      setTranslate(persisted);
    }
    isDragging.current = false;
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSince = now - lastTap;

    if (timeSince < 300 && timeSince > 0) {
      // Double tap detected
      if (scale === 1) {
        setScale(2);
      } else {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        lastTranslate.current = { x: 0, y: 0 };
      }
    }

    setLastTap(now);
  };

  // Utility: distance between two touch points
  const getDistance = (touches) => {
    const [t1, t2] = touches;
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <Dialog
      open={openViewer}
      onClose={() => setOpenViewer(false)}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      {/* Close Button */}
      <Box
        sx={{
          position: "absolute",
          top: 65,
          right: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          backgroundColor: "rgba(0,0,0,0.4)",
          borderRadius: "50%",
        }}
      >
        <CloseRoundedIcon
          sx={{
            fontSize: 22,
            color: "#FFF",
            cursor: "pointer",
            zIndex: 10,
          }}
          onClick={() => setOpenViewer(false)}
        />
      </Box>

      {/* Image */}
      <Box
        ref={imageRef}
        component="img"
        src={images[currentImage]}
        alt="product"
        sx={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          userSelect: "none",
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: isDragging.current ? "none" : "transform 0.25s ease-out",
          touchAction: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      />

      {/* Indicator Dots */}
      {scale === 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            display: "flex",
            gap: 1,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  i === currentImage ? theme.theme2.primaryBtn : "#777",
                transition: "background-color 0.3s ease",
              }}
            />
          ))}
        </Box>
      )}
    </Dialog>
  );
};

export default ImageViewerDialog;
