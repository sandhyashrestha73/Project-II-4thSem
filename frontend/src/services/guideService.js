import api from "../api/axios";

// Maps exactly to routes/guide.py
// NOTE: create_guide reads agency_id from the request body (not the JWT),
// so the frontend must send the logged-in agency's own id.

export const getGuides = () => api.get("/api/guides").then((res) => res.data.guides);

export const getGuide = (id) => api.get(`/api/guides/${id}`).then((res) => res.data.guide);

// agency only
export const createGuide = (payload) =>
  api.post("/api/guides", payload).then((res) => res.data);

// admin, or agency (no ownership check on the backend)
export const updateGuide = (id, payload) =>
  api.put(`/api/guides/${id}`, payload).then((res) => res.data);

// admin, or agency (no ownership check on the backend)
export const deleteGuide = (id) =>
  api.delete(`/api/guides/${id}`).then((res) => res.data);
