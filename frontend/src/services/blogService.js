import api from "../api/axios";

// Maps exactly to routes/blog.py
// NOTE: create_blog reads agency_id from the request body (not the JWT),
// so the frontend must send the logged-in agency's own id.
// There is no "approved/pending" field on the Blog model, so a moderation
// queue is not possible with the current backend.

export const getBlogs = () => api.get("/api/blog").then((res) => res.data.blogs);

export const getBlog = (id) => api.get(`/api/blog/${id}`).then((res) => res.data.blog);

// agency only
export const createBlog = (payload) => api.post("/api/blog", payload).then((res) => res.data);

// admin, or agency (no ownership check on the backend)
export const updateBlog = (id, payload) =>
  api.put(`/api/blog/${id}`, payload).then((res) => res.data);

// admin, or agency (no ownership check on the backend)
export const deleteBlog = (id) => api.delete(`/api/blog/${id}`).then((res) => res.data);
