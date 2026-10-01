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

// Get all verified agencies
export async function getVerifiedAgencies() {
  const response = await api.get("/api/agency/verified");
  return response.data;
}

// Get single agency profile
export async function getAgencyProfile(agencyId) {
  const response = await api.get(`/api/agency/${agencyId}`);
  return response.data;
}

// Get reviews for a specific agency
export async function getAgencyReviews(agencyId) {
  const response = await api.get(
    `/api/agency/${agencyId}/reviews`
  );

  return response.data;
}

