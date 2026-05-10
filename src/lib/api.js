import axios from "axios";

export async function saveAudit(payload) {
  const response = await axios.post("/api/audits", payload);
  return response.data;
}

export async function submitLead(payload) {
  const response = await axios.post("/api/leads", payload);
  return response.data;
}
