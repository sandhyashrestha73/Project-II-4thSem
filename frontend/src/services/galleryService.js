import api from "../api/axios";

export const getGallery = () =>
  api.get("/api/gallery").then((res) => res.data.gallery);

export const getGalleryImage = (id) =>
  api
    .get(`/api/gallery/${id}`)
    .then((res) => res.data.gallery);

export const createGalleryImage = (formData) =>
  api
    .post("/api/gallery", formData)
    .then((res) => res.data);

export const updateGalleryImage = (id, formData) =>
  api
    .put(`/api/gallery/${id}`, formData)
    .then((res) => res.data);

export const deleteGalleryImage = (id) =>
  api
    .delete(`/api/gallery/${id}`)
    .then((res) => res.data);