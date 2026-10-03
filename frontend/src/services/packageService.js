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


// AI comparison summary for two packages
export const getAiComparison = (packageId1, packageId2) =>
  api
    .post(
      "/api/package/compare/ai",
      { package_id_1: packageId1, package_id_2: packageId2 },
      { timeout: 60000 } // the AI call can take a few seconds
    )
    .then((res) => res.data)
    .catch((error) => {
      const friendly = new Error(
        error.response?.data?.message ||
          "AI comparison is temporarily unavailable."
      );
      friendly.status = error.response?.status;
      throw friendly;
    });