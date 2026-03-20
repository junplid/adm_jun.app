import { api } from "./index";

export async function getInboxUsers(params: {}): Promise<
  {
    department: { id: number; name: string } | null;
    tickets_open: number;
    id: number;
    name: string;
    createAt: Date;
  }[]
> {
  const { data } = await api.get("/private/inbox-users", { params });
  return data.inboxUsers;
}

export async function getOptionsInboxUsers(params: {}): Promise<
  { id: number; name: string; inboxDepartmentId: number | null }[]
> {
  const { data } = await api.get("/private/inbox-users/options", { params });
  return data.inboxUsers;
}

export async function createInboxUser(body: {
  name: string;
  email: string;
  password: string;
  inboxDepartmentId?: number;
}): Promise<{
  department: { name: string; id: number } | null;
  id: number;
  createAt: Date;
  updateAt: Date;
}> {
  const { data } = await api.post("/private/inbox-users", body);
  return data.inboxUser;
}

// export async function getConnectionWADetails(id: number): Promise<{
//   id: number;
//   name: string;
//   business: { name: string; id: number }[];
//   value: string | null;
//   type: ConnectionWAType;
// }> {
//   const { data } = await api.get(`/private/connections-wa/${id}/details`);
//   return data.connectionWA;
// }

export async function getInboxUser(id: number): Promise<{
  name: string;
  email: string;
  inboxDepartmentId?: number;
}> {
  const { data } = await api.get(`/private/inbox-users/${id}`);
  return data.inboxUser;
}

export async function updateInboxUser(
  id: number,
  body: {
    name?: string;
    email?: string;
    password?: string;
    inboxDepartmentId?: number | null;
  }
): Promise<{
  department: { name: string; id: number } | null;
  updateAt: Date;
}> {
  const { data } = await api.put(`/private/inbox-users/${id}`, body);
  return data.inboxUser;
}

export async function deleteInboxUser(id: number): Promise<void> {
  await api.delete(`/private/inbox-users/${id}`);
}
