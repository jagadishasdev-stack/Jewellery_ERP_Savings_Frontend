import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import defaultUserIcon from "../assets/img/icons/magic-star.svg";
import ProfilePhotoDialog from "./ProfilePhotoDialog";
import {
  MISSING_INFO_MSG,
  UPLOAD_FAILED_MSG,
  getProfileImageName,
  getProfileImageUrl,
  uploadProfilePhoto,
} from "../utils/profilePhoto";

/**
 * User profile photo. Tapping it opens a full screen view/zoom/change screen —
 * it never uploads straight from the tap.
 *  - `editable`     : allow changing the photo (users only).
 *  - `showActions`  : also render the View / Zoom / Edit icon row (edit page).
 */
function UserAvatarUpload({ admin, editable = false, showActions = false, size = 40 }) {
  const inputRef = useRef(null);
  const [version, setVersion] = useState(0); // cache-buster after a fresh upload
  const [hasImage, setHasImage] = useState(true); // turned off when the blob 404s
  const [viewer, setViewer] = useState({ open: false, zoom: 1 });
  const [picked, setPicked] = useState(null); // { file, url } — preview only
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const imageName = getProfileImageName(admin);
  const imageUrl = hasImage ? getProfileImageUrl(imageName, version) : null;
  const photoExists = !!imageUrl;

  // Kept in a ref too, so the preview url is always released — even on unmount.
  const pickedRef = useRef(null);
  const setPickedFile = (file) => {
    if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.url);
    pickedRef.current = file ? { file, url: URL.createObjectURL(file) } : null;
    setPicked(pickedRef.current);
  };
  const clearPicked = () => setPickedFile(null);

  useEffect(
    () => () => {
      if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.url);
    },
    []
  );

  const openViewer = (zoom = 1) => {
    if (!imageName) return setMessage(MISSING_INFO_MSG);
    setViewer({ open: true, zoom });
  };

  const openPicker = () => {
    if (!imageName) return setMessage(MISSING_INFO_MSG);
    // No `capture` attribute on purpose — this opens the gallery picker only,
    // so the app never has to ask for camera permission.
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the user re-pick the same file
    if (!file) return;
    setPickedFile(file);
    setViewer({ open: true, zoom: 1 }); // show the preview before uploading
  };

  const handleSave = async () => {
    if (!picked || !imageName) return;
    setUploading(true);
    try {
      await uploadProfilePhoto(picked.file, imageName);
      clearPicked();
      setHasImage(true);
      setVersion(Date.now()); // force the <img> to refetch the new photo
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setMessage(UPLOAD_FAILED_MSG);
    } finally {
      setUploading(false);
    }
  };

  const closeViewer = () => {
    if (uploading) return;
    clearPicked();
    setViewer((prev) => ({ ...prev, open: false }));
  };

  const actionBtnSx = { border: "1px solid #ddd", width: 34, height: 34 };
  const badge = Math.max(16, Math.round(size * 0.3)); // camera badge scales with the avatar

  return (
    <>
      <Box
        // Guests (no photo, cannot edit) get a plain avatar — nothing to open.
        onClick={editable || photoExists ? () => openViewer(1) : undefined}
        sx={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
          cursor: editable || photoExists ? "pointer" : "default",
        }}
      >
        <Avatar
          src={imageUrl || defaultUserIcon}
          alt="User"
          imgProps={{ onError: () => setHasImage(false) }}
          sx={{ width: size, height: size, bgcolor: "#fff" }}
        />
        {editable && (
          <Box
            sx={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: badge,
              height: badge,
              borderRadius: "50%",
              bgcolor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PhotoCameraIcon sx={{ fontSize: badge * 0.7, color: "#555" }} />
          </Box>
        )}
      </Box>

      {showActions &&
        (photoExists ? (
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <IconButton size="small" sx={actionBtnSx} onClick={() => openViewer(1)}>
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" sx={actionBtnSx} onClick={() => openViewer(2)}>
              <ZoomInIcon sx={{ fontSize: 18 }} />
            </IconButton>
            {editable && (
              <IconButton size="small" sx={actionBtnSx} onClick={openPicker}>
                <PhotoCameraIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Stack>
        ) : (
          editable && (
            <Button
              size="small"
              startIcon={<PhotoCameraIcon sx={{ fontSize: 16 }} />}
              onClick={openPicker}
              sx={{ mt: 1, fontSize: 12, textTransform: "none" }}
            >
              Add Photo
            </Button>
          )
        ))}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <ProfilePhotoDialog
        open={viewer.open}
        initialZoom={viewer.zoom}
        imageUrl={imageUrl}
        previewUrl={picked?.url || null}
        uploading={uploading}
        onClose={closeViewer}
        onPick={editable ? openPicker : undefined}
        onSave={handleSave}
        onDiscard={clearPicked}
      />

      <Dialog open={!!message} onClose={() => setMessage("")}>
        <DialogTitle sx={{ fontSize: "1rem" }}>Profile Photo</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem" }}>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessage("")}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserAvatarUpload;
