import { api } from "./index";

export type ConnectionWAType = "chatbot" | "marketing";

export async function getConnectionsWA(params: {
  type?: ConnectionWAType;
  name?: string;
  businessIds?: number[];
}): Promise<
  {
    status: "open" | "close" | "sync" | "connecting";
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
  name: string;
  description?: string;
  type: ConnectionWAType;
  businessId: number;
  profileName?: string;
  profileStatus?: string;
  lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
  onlinePrivacy?: "all" | "match_last_seen";
  imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
  statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none";
  groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist";
  readReceiptsPrivacy?: "all" | "none";
  fileImage?: string;
}> {
  const { data } = await api.get(`/private/connection-wa/${id}`);
  const nextData = Object.entries(data.connectionWA).reduce(
    (acc, [key, value]) => {
      // @ts-expect-error
      if (value !== null && value !== undefined) acc[key] = value;
      return acc;
    },
    {}
  );
  // @ts-expect-error
  return nextData;
}

export async function updateConnectionWA(
  id: number,
  body: {
    name?: string;
    description?: string | null;
    type?: ConnectionWAType;
    businessId?: number;
    profileName?: string | null;
    profileStatus?: string | null;
    lastSeenPrivacy?: "all" | "contacts" | "contact_blacklist" | "none" | null;
    onlinePrivacy?: "all" | "match_last_seen" | null;
    imgPerfilPrivacy?: "all" | "contacts" | "contact_blacklist" | "none" | null;
    statusPrivacy?: "all" | "contacts" | "contact_blacklist" | "none" | null;
    groupsAddPrivacy?: "all" | "contacts" | "contact_blacklist" | null;
    readReceiptsPrivacy?: "all" | "none" | null;
    fileImage?: File | null;
  }
): Promise<{ business: { id: number; name: string }; fileImage?: string }> {
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

  const { data } = await api.put(`/private/connections-wa/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.connectionWA;
}

export async function disconnectConnectionWA(
  id: number
): Promise<{ status: "close" }> {
  const { data } = await api.put(
    `/private/disconnect-connection-whatsapp/${id}`,
    undefined
  );
  return data.connectionWA;
}

export async function deleteConnectionWA(id: number): Promise<void> {
  await api.delete(`/private/connection-wa/${id}`);
}
