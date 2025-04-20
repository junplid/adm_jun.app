import { api } from "./index";

export type ConnectionWAType = "chatbot" | "marketing";

export async function getConnectionsWA(params: {
  type?: ConnectionWAType;
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    status: string;
    name: string;
    business: { name: string; id: number }[];
    type: ConnectionWAType;
    id: number;
    createAt: Date;
  }[]
> {
  const { data } = await api.get("/private/connections-wa", { params });
  return data.connectionsWA;
}

export async function getOptionsConnectionsWA(params: {
  type?: ConnectionWAType[];
  name?: string;
  businessIds?: number[];
}): Promise<{ id: number; name: string }[]> {
  const { data } = await api.get("/private/connections-wa/options", { params });
  return data.connectionsWA;
}

export async function createConnectionWA(body: {
  name: string;
  description?: string;
  businessId: number;
  type: ConnectionWAType;
  profileName?: string;
  profileStatus?: string;
  lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
  onlinePrivacy?: "all" | "match_last_seen";
  imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
  statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
  groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
  readReceiptsPrivacy?: "all" | "none";
  fileImage?: File;
}): Promise<{
  id: number;
  createAt: Date;
  Business: { name: string; id: number };
}> {
  const formData = new FormData();
  const { fileImage, ...rest } = body;
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  if (fileImage) {
    formData.append("fileImage", fileImage);
  }

  const { data } = await api.post("/private/connections-wa", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.connectionWA;
}

export async function getConnectionWADetails(id: number): Promise<{
  id: number;
  name: string;
  business: { name: string; id: number }[];
  value: string | null;
  type: ConnectionWAType;
}> {
  const { data } = await api.get(`/private/connection-wa/${id}/details`);
  return data.connectionWA;
}

export async function getConnectionWA(id: number): Promise<{
  id: number;
  name: string;
  businessIds: number[];
  value: string | null;
  type: "dynamics" | "constant";
}> {
  const { data } = await api.get(`/private/connection-wa/${id}`);
  return data.connectionWA;
}

export async function updateConnectionWA(
  id: number,
  params: {
    name?: string;
    value?: string | null;
    businessIds?: number[];
    type?: "dynamics" | "constant";
  }
): Promise<void> {
  const { data } = await api.put(`/private/connection-wa/${id}`, undefined, {
    params,
  });
  return data.connectionWA;
}

export async function deleteConnectionWA(id: number): Promise<void> {
  await api.delete(`/private/connection-wa/${id}`);
}
