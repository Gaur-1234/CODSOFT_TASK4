import axios from "axios";

const API = axios.create({
  baseURL: "https://job-board-backend-hd1e.onrender.com/api",
});

export default API;