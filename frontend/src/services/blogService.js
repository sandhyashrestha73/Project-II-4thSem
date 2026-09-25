import api from "../api/axios";

// Maps exactly to routes/blog.py
// NOTE: create_blog reads agency_id from the request body (not the JWT),
// so the frontend must send the logged-in agency's own id.
// There is no "approved/pending" field on the Blog model, so a moderation
// queue is not possible with the current backend.


// Get all blogs
export const getBlogs = () =>
  api.get("/api/blog").then((res) => res.data.blogs);

// Get single blog
export const getBlog = (id) =>
  api.get(`/api/blog/${id}`).then((res) => res.data.blog);

// Create blog with FormData
export const createBlog = (formData) =>
  api.post("/api/blog", formData).then((res) => res.data);

// Update blog with FormData
export const updateBlog = (id, formData) =>
  api.put(`/api/blog/${id}`, formData).then((res) => res.data);

// Delete blog
export const deleteBlog = (id) =>
  api.delete(`/api/blog/${id}`).then((res) => res.data);