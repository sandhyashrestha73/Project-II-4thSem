import api from "../api/axios";

// =========================================================
// PUBLIC DESTINATIONS
// Only Approved destinations
// =========================================================

export const getDestinations = () =>
  api
    .get("/api/destination")
    .then((res) => res.data.destinations);


// =========================================================
// SINGLE PUBLIC DESTINATION
// =========================================================

export const getDestination = (id) =>
  api
    .get(`/api/destination/${id}`)
    .then((res) => res.data.destination);


// =========================================================
// CREATE DESTINATION
// Admin + Agency
// =========================================================

export const createDestination = (formData) =>
  api
    .post("/api/destination", formData)
    .then((res) => res.data);


// =========================================================
// UPDATE DESTINATION
// Admin only
// =========================================================

export const updateDestination = (id, formData) =>
  api
    .put(`/api/destination/${id}`, formData)
    .then((res) => res.data);


// =========================================================
// DELETE DESTINATION
// Admin only
// =========================================================

export const deleteDestination = (id) =>
  api
    .delete(`/api/destination/${id}`)
    .then((res) => res.data);


// =========================================================
// ADMIN - GET ALL DESTINATIONS
// Pending + Approved + Rejected
// =========================================================

export const getAdminDestinations = () =>
  api
    .get("/api/admin/destinations")
    .then((res) => res.data.destinations);


// =========================================================
// ADMIN - GET PENDING DESTINATIONS
// =========================================================

export const getPendingDestinations = () =>
  api
    .get("/api/admin/destinations/pending")
    .then((res) => res.data.destinations);


// =========================================================
// ADMIN - APPROVE DESTINATION
// =========================================================

export const approveDestination = (id) =>
  api
    .put(`/api/admin/destinations/${id}/approve`)
    .then((res) => res.data);


// =========================================================
// ADMIN - REJECT DESTINATION
// =========================================================

export const rejectDestination = (id) =>
  api
    .put(`/api/admin/destinations/${id}/reject`)
    .then((res) => res.data);


// =========================================================
// AGENCY - GET OWN DESTINATIONS
// =========================================================

export const getAgencyDestinations = () =>
  api
    .get("/api/agency/destinations")
    .then((res) => res.data.destinations);