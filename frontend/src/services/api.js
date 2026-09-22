import axios from "axios";

const API = axios.create({
  baseURL: "https://job-board-backend-hdle.onrender.com/api",
});

export default API;