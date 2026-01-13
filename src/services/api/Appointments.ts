import { api } from "./index";
import { TypeStatusTicket } from "./Ticket";

export type TypeStatusAppointment =
  | "suggested"
  | "pending_confirmation"
  | "confirmed"
  | "canceled"
  | "completed"
  | "expired";

export type TypeCreateByAppointment = "human" | "bot";

export interface AppointmentDetails {
  business: { id: number; name: string };
  contactName: string | undefined;
  reminders: { sent: number; failed: number };
  connectionWA: { s: boolean; id: number; name: string } | null;
  ticket: {
    connection: { s: boolean; id: number; name: string };
    id: number;
    departmentName: string;
    status: TypeStatusTicket;
  }[];
  id: number;
  title: string;
  desc: string | null;
  n_appointment: string;
  status: TypeStatusAppointment;
  startAt: Date;
  createdBy: TypeCreateByAppointment;
  createAt: Date;
  actionChannels: string[];
}

export async function updateAppointment(
  id: number,
  body: {
    title?: string;
    desc?: string;
    startAt?: Date;
  }
): Promise<void> {
  await api.put(`/private/appointments/${id}`, undefined, {
    params: body,
  });
}

export async function runActionAppointment(
  id: number,
  action: string
): Promise<void> {
  await api.post(`/private/appointment/action/${id}/${action}`);
}

export async function getAppointments(params?: {
  limit?: number;
  status?: TypeStatusAppointment[];
  menu?: string;
}): Promise<{
  appointments: {
    id: number;
    title: string;
    desc: string | null;
    startAt: Date;
  }[];
}> {
  const { data } = await api.get("/private/appointments", { params });
  return { appointments: data.appointments };
}

export async function getAppointmentDetails(id: number): Promise<{
  appointment: AppointmentDetails;
}> {
  const { data } = await api.get(`/private/appointments/${id}/details`);
  return { appointment: data.appointment };
}

export async function deleteAppointment(id: number): Promise<void> {
  await api.delete(`/private/appointments/${id}`);
}
