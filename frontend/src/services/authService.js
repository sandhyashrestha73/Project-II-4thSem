import api from "../api/axios";

// Maps exactly to routes/auth.py — no invented endpoints.

export const loginTourist = (email, password) =>
  api.post("/api/auth/tourists/login", { email, password }).then((res) => res.data);

export const registerTourist = (payload) =>
  // payload: { full_name, email, phone, password }
  api.post("/api/auth/tourists/register", payload).then((res) => res.data);

export const loginAgency = (email, password) =>
  api.post("/api/auth/agency/login", { email, password }).then((res) => res.data);

export const registerAgency = (payload) =>
  // payload: { agency_name, email, phone, password, address, description, license_no }
  api.post("/api/auth/agency/register", payload).then((res) => res.data);

export const loginAdmin = (email, password) =>
  api.post("/api/auth/admin/login", { email, password }).then((res) => res.data);
