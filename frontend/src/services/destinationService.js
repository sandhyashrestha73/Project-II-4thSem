import api from "../api/axios";

// Maps exactly to routes/destination.py

export const getDestinations = () =>
  api.get("/api/destination").then((res) => res.data.destinations);

export const getDestination = (id) =>
  api.get(`/api/destination/${id}`).then((res) => res.data.destination);

// admin only
export const createDestination = (payload) =>
  api.post("/api/destination", payload).then((res) => res.data);

// admin only
export const updateDestination = (id, payload) =>
  api.put(`/api/destination/${id}`, payload).then((res) => res.data);

// admin only
export const deleteDestination = (id) =>
  api.delete(`/api/destination/${id}`).then((res) => res.data);
