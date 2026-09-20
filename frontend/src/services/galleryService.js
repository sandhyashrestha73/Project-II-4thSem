import api from "../api/axios";

// Maps exactly to routes/gallery.py
// NOTE: create_gallery reads agency_id from the request body (not the JWT).

export const getGallery = () => api.get("/api/gallery").then((res) => res.data.gallery);

export const getGalleryImage = (id) =>
  api.get(`/api/gallery/${id}`).then((res) => res.data.gallery);

// agency only
export const createGalleryImage = (payload) =>
  api.post("/api/gallery", payload).then((res) => res.data);

// admin, or agency (no ownership check on the backend)
export const updateGalleryImage = (id, payload) =>
  api.put(`/api/gallery/${id}`, payload).then((res) => res.data);

// admin, or agency (no ownership check on the backend)
export const deleteGalleryImage = (id) =>
  api.delete(`/api/gallery/${id}`).then((res) => res.data);
