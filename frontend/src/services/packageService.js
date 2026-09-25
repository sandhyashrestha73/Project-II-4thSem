import api from "../api/axios";

// Get all packages
export const getPackages = () =>
  api.get("/api/package").then((res) => res.data.packages);

// Get single package
export const getPackage = (id) =>
  api.get(`/api/package/${id}`).then((res) => res.data.package);

// Create package with FormData
export const createPackage = (formData) =>
  api.post("/api/package", formData).then((res) => res.data);

// Update package with FormData
export const updatePackage = (id, formData) =>
  api.put(`/api/package/${id}`, formData).then((res) => res.data);

// Delete package
export const deletePackage = (id) =>
  api.delete(`/api/package/${id}`).then((res) => res.data);