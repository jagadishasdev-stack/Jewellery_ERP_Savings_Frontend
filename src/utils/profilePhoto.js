import axios from "axios";
import APP_CONFIG from "../config/constants";

// Profile photos live in the "logo" container as <user_id>-<store_id>-<branch>.jpg
const BLOB_BASE = "https://kumuduorderapp.blob.core.windows.net/logo";
const CONTAINER_NAME = "logo";
const MAX_SIDE = 512; // px — keeps the upload small on mobile data
const JPEG_QUALITY = 0.8;

export const MISSING_INFO_MSG =
  "Server is busy at the moment. Please logout and login again, then try after some time.";
export const UPLOAD_FAILED_MSG =
  "Could not upload your photo right now. Please try again after some time.";

// All three parts are mandatory — returns null when anything is missing.
// The id comes from the logged in role: agents are agent_id, users are user_id
// (both live on the same adminUser object, which carries `role`).
export const getProfileImageName = (admin) => {
  const id = admin?.role === "agent" ? admin?.agent_id : admin?.user_id;
  const storeId = admin?.store_id || APP_CONFIG.STORE_ID;
  const branch = admin?.branch || APP_CONFIG.BRANCH;
  if (!id || !storeId || !branch) return null;
  return `${id}-${storeId}-${branch}`;
};

// `version` is a cache-buster so a freshly uploaded photo shows up immediately.
export const getProfileImageUrl = (name, version) =>
  name ? `${BLOB_BASE}/${name}.jpg${version ? `?v=${version}` : ""}` : null;

// Re-encode whatever the gallery gave us into a small JPEG so the blob name
// (.jpg) always matches the real content.
const toJpegFile = (file, name) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], `${name}.jpg`, { type: "image/jpeg" }))
            : reject(new Error("Could not read the selected image")),
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image"));
    };
    img.src = objectUrl;
  });

export const uploadProfilePhoto = async (file, name) => {
  const jpeg = await toJpegFile(file, name);
  const form = new FormData();
  form.append("image", jpeg, `${name}.jpg`);
  form.append("containerName", CONTAINER_NAME);

  await axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/api/admin/uploadimagetoblob`,
    form,
    { timeout: 60000 }
  );
};
