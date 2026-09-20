import api from "../api/axios";

// Maps exactly to routes/package.py

export const getPackages = () =>
  api.get("/api/package").then((res) => res.data.packages);

export const getPackage = (id) =>
  api.get(`/api/package/${id}`).then((res) => res.data.package);

// agency only - agency_id is taken from the JWT by the backend, do not send it
export const createPackage = (payload) =>
  api.post("/api/package", payload).then((res) => res.data);

// admin, or the owning agency
export const updatePackage = (id, payload) =>
  api.put(`/api/package/${id}`, payload).then((res) => res.data);

// admin, or the owning agency
export const deletePackage = (id) =>
  api.delete(`/api/package/${id}`).then((res) => res.data);
