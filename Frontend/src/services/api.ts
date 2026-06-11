import axios from "axios";

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com", // demo API
});

export default api;
