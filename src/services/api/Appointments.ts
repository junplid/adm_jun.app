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
  connection?: {
    id: number;
    name: string;
    channel: "baileys" | "instagram";
    s: boolean;
  };
  ticket: {
    connection: {
      s: boolean;
      id: number;
      name: string;
      channel: "baileys" | "instagram";
    };
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
  endAt: Date;
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
    socketIgnore?: string;
  },
): Promise<void> {
  await api.put(`/private/appointments/${id}`, undefined, {
    params: body,
  });
}

export async function createAppointment(body: {
  title: string;
  desc?: string;
  dateStartAt: string;
  timeStartAt: string;
  endAt:
    | "10min"
    | "30min"
    | "1h"
    | "1h e 30min"
    | "2h"
    | "3h"
    | "4h"
    | "5h"
    | "10h"
    | "15h"
    | "1d"
    | "2d";
  socketIgnore?: string;
}): Promise<{
  id: number;
  code: string;
  startAt: Date;
  endAt: Date;
  status: "confirmed";
}> {
  const { data } = await api.post(`/private/appointments`, body);
  return data.appointment;
}

export async function runActionAppointment(
  id: number,
  action: string,
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
    endAt: Date;
    channel: "instagram" | "baileys" | null;
    status: TypeStatusAppointment;
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

export async function deleteAppointment(
  id: number,
  params?: { socketIgnore?: string; message?: string },
): Promise<void> {
  await api.delete(`/private/appointments/${id}`, { params });
}
