import type { FormSchema, MedicalCard, Appointment } from "../types";
import type {
  BookingDetail,
  BookingPayload,
  ScheduleResponse,
  Specialist,
} from "../types/schedule";

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
  searchIcd10: (q: string, limit = 20) => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return request<import("../types").Icd10SearchResponse>(`/icd10/search?${params}`);
  },
  getIcd10Suggestions: () => request<import("../types").Icd10Item[]>("/icd10/suggestions"),
  lookupIcd10: (code: string) => request<import("../types").Icd10Item>(`/icd10/lookup/${encodeURIComponent(code)}`),
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
  getPatientsPaginated: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("page_size", String(params.pageSize));
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<import("../types").PatientListResponse>(`/patients${qs ? `?${qs}` : ""}`);
  },
  getPatientDetail: (patientId: number) =>
    request<import("../types").PatientDetailResponse>(`/patients/${patientId}/detail`),
  startPatientVisit: (patientId: number) =>
    request<MedicalCard>(`/patients/${patientId}/start-visit`, { method: "POST" }),
  completePatientVisit: (patientId: number) =>
    request<MedicalCard>(`/patients/${patientId}/complete-visit`, { method: "POST" }),
  printPatientCard: (patientId: number) =>
    request<{ filename: string; download_url: string; medical_card_id: number }>(
      `/patients/${patientId}/print-card`,
      { method: "POST" },
    ),
  downloadPatientPdf: async (patientId: number, patientName: string) => {
    await request<{ filename: string; download_url: string; medical_card_id: number }>(
      `/patients/${patientId}/print-card`,
      { method: "POST" },
    );
    const response = await fetch(`${BASE}/patients/${patientId}/pdf`);
    if (!response.ok) {
      throw new Error("Не удалось скачать PDF");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `052_u_${patientName.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  downloadMedicalCardPdf: async (
    cardId: number,
    patientName: string,
    visitDate?: string | null,
  ) => {
    await request<{ filename: string; download_url: string }>(`/medical-cards/${cardId}/generate-pdf`, {
      method: "POST",
    });
    const response = await fetch(`${BASE}/medical-cards/${cardId}/pdf`);
    if (!response.ok) {
      throw new Error("Не удалось скачать PDF");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const stamp = visitDate ? visitDate.replace(/-/g, ".") : `card_${cardId}`;
    link.download = `052_u_${patientName.replace(/\s+/g, "_")}_${stamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  getPatients: async () => {
    const response = await request<import("../types").PatientListResponse>(
      "/patients?page_size=100",
    );
    return response.items;
  },
  getAppointments: () => request<Appointment[]>("/appointments"),
  getSpecialists: (params?: { specialty?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.specialty) q.set("specialty", params.specialty);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<Specialist[]>(`/specialists${qs ? `?${qs}` : ""}`);
  },
  getSchedule: (dateFrom: string, dateTo: string, specialistId?: number) => {
    const q = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    if (specialistId) q.set("specialist_id", String(specialistId));
    return request<ScheduleResponse>(`/schedule?${q}`);
  },
  createBooking: (payload: BookingPayload) =>
    request<BookingDetail>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getBooking: (appointmentId: number) => request<BookingDetail>(`/bookings/${appointmentId}`),
  updateBooking: (appointmentId: number, payload: Partial<BookingPayload>) =>
    request<BookingDetail>(`/bookings/${appointmentId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
