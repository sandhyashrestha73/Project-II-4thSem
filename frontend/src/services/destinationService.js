import api from "../api/axios";

export const getDestinations = () =>
  api.get("/api/destination").then((res) => res.data.destinations);

export const getDestination = (id) =>
  api.get(`/api/destination/${id}`).then((res) => res.data.destination);

export const createDestination = (formData) =>
  api
    .post("/api/destination", formData)
    .then((res) => res.data);

export const updateDestination = (id, formData) =>
  api
    .put(`/api/destination/${id}`, formData)
    .then((res) => res.data);

export const deleteDestination = (id) =>
  api
    .delete(`/api/destination/${id}`)
    .then((res) => res.data);