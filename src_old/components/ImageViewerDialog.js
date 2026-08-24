import React, { useState, useRef } from "react";
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

      // If zoomed in => Pan
      if (scale > 1) {
        isDragging.current = true;
        setTranslate({
          x: lastTranslate.current.x + dx,
          y: lastTranslate.current.y + dy,
        });
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
    } else if (scale > 1 && isDragging.current) {
      // Save the last translation after panning
      lastTranslate.current = { ...translate };
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
