import type { Appointment, FormSchema, MedicalCard } from "../types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getFormSchema: () => request<FormSchema>("/medical-cards/schema/form"),
  getMedicalCards: () => request<MedicalCard[]>("/medical-cards"),
  getMedicalCard: (id: number) => request<MedicalCard>(`/medical-cards/${id}`),
  updateStep: (id: number, currentStep: number, data: Record<string, unknown>) =>
    request<MedicalCard>(`/medical-cards/${id}/step`, {
      method: "PATCH",
      body: JSON.stringify({ current_step: currentStep, data }),
    }),
  completeCard: (id: number) =>
    request<MedicalCard>(`/medical-cards/${id}/complete`, { method: "POST" }),
  generatePdf: (id: number) =>
    request<{ filename: string; download_url: string }>(`/medical-cards/${id}/generate-pdf`, {
      method: "POST",
    }),
  getAppointments: () => request<Appointment[]>("/appointments"),
  getAppointment: (id: number) => request<Appointment>(`/appointments/${id}`),
};
