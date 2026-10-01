import api from "../api/axios";

// Submit a review for a completed booking
export async function createReview(data) {
  const response = await api.post("/api/review", data);
  return response.data;
}

// Get all reviews of an agency
export async function getAgencyReviews(agencyId) {
  const response = await api.get(
    `/api/agency/${agencyId}/reviews`
  );

  return response.data;
}