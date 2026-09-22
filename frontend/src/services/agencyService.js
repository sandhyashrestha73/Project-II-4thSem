import api from "../api/axios";

// Get agencies waiting for admin verification
export const getPendingAgencies = () =>
  api
    .get("/api/admin/agencies/pending")
    .then((res) => res.data.agencies);

// Approve agency
export const approveAgency = (id) =>
  api
    .put(`/api/admin/agencies/${id}/approve`)
    .then((res) => res.data);

// Reject agency
export const rejectAgency = (id) =>
  api
    .put(`/api/admin/agencies/${id}/reject`)
    .then((res) => res.data);