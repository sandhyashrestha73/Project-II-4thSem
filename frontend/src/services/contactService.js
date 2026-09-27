import api from "../api/axios";


// Send contact message
export const sendContactMessage = (data) =>
  api
    .post("/api/contact", data)
    .then((res) => res.data);


// Admin: get all contact messages
export const getContactMessages = () =>
  api
    .get("/api/admin/contact-messages")
    .then((res) => res.data.messages);