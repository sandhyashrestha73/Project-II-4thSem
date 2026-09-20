import api from "../api/axios";

// Maps exactly to routes/booking.py
// NOTE: GET /api/booking returns ALL bookings in the system for any
// tourist/agency/admin token — the backend does not scope the list.
// This service exposes the raw call; pages filter client-side.

export const getBookings = () => api.get("/api/booking").then((res) => res.data.bookings);

export const getBooking = (id) => api.get(`/api/booking/${id}`).then((res) => res.data.booking);

// tourist only
export const createBooking = (payload) =>
  api.post("/api/booking", payload).then((res) => res.data);

// tourist/agency/admin (backend does not check the caller owns this booking)
export const updateBooking = (id, payload) =>
  api.put(`/api/booking/${id}`, payload).then((res) => res.data);

// admin only
export const deleteBooking = (id) =>
  api.delete(`/api/booking/${id}`).then((res) => res.data);

// tourist only, and only their own booking (backend checks this)
export const cancelBooking = (id) =>
  api.put(`/api/booking/${id}/cancel`).then((res) => res.data);
