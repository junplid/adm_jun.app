import { api } from "./index";

export async function getServicesToday(): Promise<
  Record<string, number | null>
> {
  const { data } = await api.get("/private/dash/services-today");
  return data.services;
}
