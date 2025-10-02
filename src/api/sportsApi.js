// src/api/sportsApi.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // tu backend FastAPI

export const getSports = async () => {
  const res = await axios.get(`${API_URL}/sports`);
  return res.data;
};

export const createSport = async (sport) => {
  const res = await axios.post(`${API_URL}/sports`, sport);
  return res.data;
};

export const updateSport = async (id, sport) => {
  const res = await axios.put(`${API_URL}/sports/${id}`, sport);
  return res.data;
};

export const deleteSport = async (id) => {
  const res = await axios.delete(`${API_URL}/sports/${id}`);
  return res.data;
};
