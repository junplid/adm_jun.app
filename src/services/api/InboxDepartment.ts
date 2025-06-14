import { api } from "./index";

export async function getInboxDepartments(params: {}): Promise<
  {
    name: string;
    id: number;
    createAt: Date;
    tickets_open: number;
    tickets_new: number;
    business: { name: string; id: number };
  }[]
> {
  const { data } = await api.get("/private/inbox-departments", { params });
  return data.inboxDepartments;
}

export async function getOptionsInboxDepartments(params: {}): Promise<
  { name: string; id: number; businessId: number }[]
> {
  const { data } = await api.get("/private/inbox-departments/options", {
    params,
  });
  return data.inboxDepartments;
}

export async function createInboxDepartment(body: {
  name: string;
  businessId: number;
  signBusiness?: boolean;
  signDepartment?: boolean;
  signUser?: boolean;
  previewNumber?: boolean;
  previewPhoto?: boolean;
  inboxUserIds?: number[];
}): Promise<{
  id: number;
  createAt: Date;
  tickets_open: number;
  tickets_new: number;
  business: { name: string; id: number };
}> {
  const { data } = await api.post("/private/inbox-departments", body);
  return data.inboxDepartment;
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

export async function getInboxDepartment(id: number): Promise<{
  name: string;
  businessId: number;
  signBusiness?: boolean;
  signDepartment?: boolean;
  signUser?: boolean;
  previewNumber?: boolean;
  previewPhoto?: boolean;
  inboxUserIds: number[];
}> {
  const { data } = await api.get(`/private/inbox-departments/${id}`);
  return data.inboxDepartment;
}

export async function updateInboxDepartment(
  id: number,
  body: {
    name?: string;
    businessId?: number;
    signBusiness?: boolean;
    signDepartment?: boolean;
    signUser?: boolean;
    previewNumber?: boolean;
    previewPhoto?: boolean;
    inboxUserIds?: number[];
  }
): Promise<{
  business: { name: string; id: number };
}> {
  const { data } = await api.put(`/private/inbox-departments/${id}`, body);
  return data.inboxDepartment;
}

export async function deleteInboxDepartment(id: number): Promise<void> {
  await api.delete(`/private/inbox-departments/${id}`);
}
