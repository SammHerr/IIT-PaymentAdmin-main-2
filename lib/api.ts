import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // p.ej. http://localhost:4000/api
  withCredentials: true, // envía/recibe cookies HttpOnly
});
api.defaults.headers.common["Content-Type"] = "application/json";